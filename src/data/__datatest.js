/**
 * Runtime self-test of the Day 3 data layer (repos, services, pure helpers).
 * Mirrors src/models/__smoketest.js. Returns { ok, results }.
 * Run headlessly with `npm test data`.
 */

import { computeReward } from './reward';

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

  const ok = r.every((x) => x.ok);
  return { ok, results: r };
}

export { memStore, fakeDb, check };
