/**
 * Runtime self-test of the Day 3 data layer (repos, services, pure helpers).
 * Mirrors src/models/__smoketest.js. Returns { ok, results }.
 * Run headlessly with `npm test data`.
 */

import { computeReward } from './reward';
import { buildCard } from './learnerView';
import { makeLocalStore } from './localStore';
import { GuidedProject, Progress } from '../models';
import { makeProgressRepo } from '../repos/progressRepo';

function check(name, fn, results) {
  return Promise.resolve()
    .then(fn)
    .then(() => results.push({ name, ok: true }))
    .catch((err) => results.push({ name, ok: false, error: err.message || String(err) }));
}

/** In-memory AsyncStorage shim for tests. */
function memStore() {
  const m = new Map();
  return {
    async getItem(k) { return m.has(k) ? m.get(k) : null; },
    async setItem(k, v) { m.set(k, v); },
    async removeItem(k) { m.delete(k); },
    _map: m,
  };
}

/** Minimal chainable Supabase fake. Records upserts/updates. */
function fakeDb(rowsByTable = {}) {
  const calls = { upserts: [], updates: [] };
  const api = {
    calls,
    from(table) {
      return {
        select() {
          const q = {
            _table: table,
            eq() { return q; },
            order() { return q; },
            limit() { return q; },
            then(resolve) { return Promise.resolve({ data: rowsByTable[table] || [], error: null }).then(resolve); },
          };
          return q;
        },
        upsert(payload, opts) { calls.upserts.push({ table, payload, opts }); return Promise.resolve({ error: null }); },
        update(payload) { return { eq() { calls.updates.push({ table, payload }); return Promise.resolve({ error: null }); } }; },
        insert(payload) { calls.upserts.push({ table, payload }); return Promise.resolve({ error: null }); },
      };
    },
  };
  return api;
}

export async function runDataSmokeTest() {
  const r = [];
  // tests added in later tasks
  await check('computeReward: adds XP and crosses a level threshold', () => {
    const row = { id: 'u1', role: 'senior_learner', display_name: 'Cara', public_id: 'LRN-0001', xp: 90, level: 1, streak: 2 };
    const out = computeReward({ userRow: row, xpDelta: 50, lastActive: '2026-05-19', today: '2026-05-20' });
    if (out.userRow.xp !== 140) throw new Error(`xp=${out.userRow.xp}`);
    if (out.userRow.level !== 2) throw new Error(`level=${out.userRow.level}`);
    if (out.userRow.streak !== 3) throw new Error(`streak=${out.userRow.streak}`);
    if (out.lastActive !== '2026-05-20') throw new Error(`lastActive=${out.lastActive}`);
  }, r);

  await check('computeReward: same-day activity does not bump streak', () => {
    const row = { id: 'u2', role: 'senior_learner', display_name: 'D', xp: 0, level: 1, streak: 5 };
    const out = computeReward({ userRow: row, xpDelta: 10, lastActive: '2026-05-20', today: '2026-05-20' });
    if (out.userRow.streak !== 5) throw new Error(`streak=${out.userRow.streak}`);
  }, r);

  await check('computeReward: a gap resets streak to 1', () => {
    const row = { id: 'u3', role: 'senior_learner', display_name: 'E', xp: 0, level: 1, streak: 9 };
    const out = computeReward({ userRow: row, xpDelta: 10, lastActive: '2026-05-10', today: '2026-05-20' });
    if (out.userRow.streak !== 1) throw new Error(`streak=${out.userRow.streak}`);
  }, r);

  await check('computeReward: non-learner row is returned unchanged', () => {
    const row = { id: 'c1', role: 'creator', display_name: 'Cr' };
    const out = computeReward({ userRow: row, xpDelta: 50, lastActive: null, today: '2026-05-20' });
    if (out.userRow !== row) throw new Error('creator row should be untouched');
  }, r);

  await check('buildCard: pct/started/completed from progress + stepCount', () => {
    const proj = new GuidedProject({ id: 1, title: 'T', status: 'published', stepCountHint: 6 });
    const prog = new Progress({ userId: 'u', projectId: 1, completedStepNumbers: [1, 2, 3] });
    const card = buildCard(proj, prog);
    if (card.totalSteps !== 6) throw new Error(`totalSteps=${card.totalSteps}`);
    if (card.pct !== 50) throw new Error(`pct=${card.pct}`);
    if (!card.started) throw new Error('should be started');
    if (card.completed) throw new Error('should not be completed');
  }, r);

  await check('buildCard: no progress means pct 0, not started', () => {
    const proj = new GuidedProject({ id: 2, title: 'T', status: 'published', stepCountHint: 4 });
    const card = buildCard(proj, null);
    if (card.pct !== 0) throw new Error(`pct=${card.pct}`);
    if (card.started) throw new Error('should not be started');
  }, r);

  await check('progressRepo.saveProgress writes local cache + fires upsert (null id stripped)', async () => {
    const store = makeLocalStore(memStore());
    const db = fakeDb();
    const repo = makeProgressRepo({ store, db, configured: true });
    const prog = new Progress({ userId: 'u1', projectId: 1, completedStepNumbers: [1], xpEarned: 20 });
    await repo.saveProgress(prog);
    const cached = await store.getJSON('smib.progress.u1', {});
    if (!cached['1']) throw new Error('not cached');
    if (db.calls.upserts.length !== 1) throw new Error('no upsert');
    const up = db.calls.upserts[0];
    if (up.table !== 'progress') throw new Error('wrong table');
    if ('id' in up.payload) throw new Error('null id should be stripped');
    if (up.opts.onConflict !== 'user_id,project_id') throw new Error('onConflict');
  }, r);

  await check('progressRepo offline returns seed demo progress overlaid by cache', async () => {
    const store = makeLocalStore(memStore());
    const repo = makeProgressRepo({ store, db: null, configured: false });
    const all = await repo.getAllProgress('demo');
    const p1 = all.find((p) => String(p.projectId) === '1');
    if (!p1 || p1.completedStepNumbers.length !== 3) throw new Error('seed p1 missing');
    // overlay: save a new state for project 1, then read again — cache wins
    const updated = new Progress({ userId: 'demo', projectId: 1, completedStepNumbers: [1, 2, 3, 4] });
    await repo.saveProgress(updated);
    const all2 = await repo.getAllProgress('demo');
    const p1b = all2.find((p) => String(p.projectId) === '1');
    if (p1b.completedStepNumbers.length !== 4) throw new Error('cache should win');
  }, r);

  const ok = r.every((x) => x.ok);
  return { ok, results: r };
}

export { memStore, fakeDb, check };
