/**
 * Runtime self-test of the Day 3 data layer (repos, services, pure helpers).
 * Mirrors src/models/__smoketest.js. Returns { ok, results }.
 * Run headlessly with `npm test data`.
 */

import { computeReward } from './reward';
import { buildCard } from './learnerView';
import { categoryMeta } from './categoryMeta';
import { buildAnalytics } from './creatorStats';
import { aggregate, xpPercent } from './parentStats';
import { childTabs, filterAndGroup } from './parentActivity';
import { SEED_CHILDREN, SEED_PARENT_ACTIVITY } from './seedData';
import { makeLocalStore } from './localStore';
import { GuidedProject, Progress, Certificate, Creator, VerifiedCreator, Parent } from '../models';
import { makeParentRepo } from '../repos/parentRepo';
import { makeProgressRepo } from '../repos/progressRepo';
import { makeProjectRepo } from '../repos/projectRepo';
import { makeCertificateRepo } from '../repos/certificateRepo';
import { makeAchievementRepo } from '../repos/achievementRepo';
import { makeCreatorRepo } from '../repos/creatorRepo';
import { makeProgressService } from '../services/progressService';
import { makeAuthoringService } from '../services/authoringService';

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
  const calls = { upserts: [], updates: [], inserts: [], deletes: [], rpcs: [] };
  const api = {
    calls,
    rpc(name, args) {
      calls.rpcs.push({ name, args });
      const rows = (rowsByTable.__rpc && rowsByTable.__rpc[name]) || [];
      return Promise.resolve({ data: rows, error: null });
    },
    from(table) {
      return {
        select() {
          const q = {
            _table: table,
            eq() { return q; },
            order() { return q; },
            limit() { return q; },
            single() { return Promise.resolve({ data: (rowsByTable[table] || [])[0] || null, error: null }); },
            then(resolve) { return Promise.resolve({ data: rowsByTable[table] || [], error: null }).then(resolve); },
          };
          return q;
        },
        upsert(payload, opts) { calls.upserts.push({ table, payload, opts }); return Promise.resolve({ error: null }); },
        update(payload) { return { eq() { calls.updates.push({ table, payload }); return Promise.resolve({ error: null }); } }; },
        insert(payload) {
          calls.inserts.push({ table, payload });
          return {
            select() { return { single() { return Promise.resolve({ data: { id: 4242, ...payload }, error: null }); } }; },
            then(resolve) { return Promise.resolve({ error: null }).then(resolve); },
          };
        },
        delete() { return { eq() { calls.deletes.push({ table }); return Promise.resolve({ error: null }); } }; },
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

  await check('projectRepo offline lists 12 seed projects with stepCount', async () => {
    const repo = makeProjectRepo({ db: null, configured: false });
    const list = await repo.listProjects();
    if (list.length !== 12) throw new Error(`len=${list.length}`);
    const p1 = list.find((p) => String(p.id) === '1');
    if (p1.stepCount !== 6) throw new Error(`p1 stepCount=${p1.stepCount}`);
    if (p1.title !== 'Solar Phone Charger') throw new Error('p1 title');
  }, r);

  await check('projectRepo offline getProjectWithSteps loads real P1 steps', async () => {
    const repo = makeProjectRepo({ db: null, configured: false });
    const p1 = await repo.getProjectWithSteps(1);
    if (p1.steps.length !== 6) throw new Error(`steps=${p1.steps.length}`);
    if (p1.steps[0].title !== 'Gather Materials') throw new Error('step1 title');
    if (p1.steps[0].materials.length !== 6) throw new Error('materials');
    const missing = await repo.getProjectWithSteps(999);
    if (missing !== null) throw new Error('missing should be null');
  }, r);

  await check('certificateRepo.issueCertificate is idempotent per user+project', async () => {
    const store = makeLocalStore(memStore());
    const db = fakeDb();
    const repo = makeCertificateRepo({ store, db, configured: true });
    const c1 = new Certificate({ projectId: 1, userId: 'u1', projectTitle: 'Solar', userName: 'Cara' });
    await repo.issueCertificate(c1);
    const c2 = new Certificate({ projectId: 1, userId: 'u1', projectTitle: 'Solar', userName: 'Cara' });
    await repo.issueCertificate(c2);
    const list = await repo.listCertificates('u1');
    if (list.length !== 1) throw new Error(`len=${list.length}`);
  }, r);

  await check('achievementRepo offline returns 16-badge catalog + 6 earned', async () => {
    const repo = makeAchievementRepo({ db: null, configured: false });
    const cat = await repo.listCatalog();
    if (cat.length !== 16) throw new Error(`catalog=${cat.length}`);
    const earned = await repo.listEarnedCodes('demo');
    if (earned.length !== 6) throw new Error(`earned=${earned.length}`);
  }, r);

  await check('progressService.completeStep saves progress and returns xpDelta', async () => {
    const store = makeLocalStore(memStore());
    const progressRepo = makeProgressRepo({ store, db: null, configured: false });
    const certificateRepo = makeCertificateRepo({ store, db: null, configured: false });
    const svc = makeProgressService({ progressRepo, certificateRepo });
    const project = new GuidedProject({ id: 100, title: 'T', status: 'published',
      steps: [{ title: 'a', xp: 40 }, { title: 'b', xp: 60 }] });
    const progress = new Progress({ userId: 'u1', projectId: 100 });
    const user = { id: 'u1', fullName: 'Cara' };
    const res = await svc.completeStep({ user, project, progress, stepN: 1 });
    if (res.xpDelta !== 40) throw new Error(`xpDelta=${res.xpDelta}`);
    if (res.projectCompleted) throw new Error('not complete after 1/2');
    const cached = await store.getJSON('smib.progress.u1', {});
    if (!cached['100']) throw new Error('progress not saved');
  }, r);

  await check('progressService.completeStep issues a certificate on full completion', async () => {
    const store = makeLocalStore(memStore());
    const progressRepo = makeProgressRepo({ store, db: null, configured: false });
    const certificateRepo = makeCertificateRepo({ store, db: null, configured: false });
    const svc = makeProgressService({ progressRepo, certificateRepo });
    const project = new GuidedProject({ id: 101, title: 'Solar', status: 'published',
      steps: [{ title: 'a', xp: 40 }] });
    const progress = new Progress({ userId: 'u2', projectId: 101 });
    const user = { id: 'u2', fullName: 'Dan' };
    const res = await svc.completeStep({ user, project, progress, stepN: 1 });
    if (!res.projectCompleted) throw new Error('should be complete');
    if (!res.certificate) throw new Error('no certificate');
    const certs = await certificateRepo.listCertificates('u2');
    if (certs.length !== 1) throw new Error(`certs=${certs.length}`);
  }, r);

  await check('progressService.completeStep gives 0 xpDelta when re-completing', async () => {
    const store = makeLocalStore(memStore());
    const progressRepo = makeProgressRepo({ store, db: null, configured: false });
    const certificateRepo = makeCertificateRepo({ store, db: null, configured: false });
    const svc = makeProgressService({ progressRepo, certificateRepo });
    const project = new GuidedProject({ id: 102, title: 'T', status: 'published', steps: [{ title: 'a', xp: 40 }, { title: 'b', xp: 20 }] });
    const progress = new Progress({ userId: 'u3', projectId: 102, completedStepNumbers: [1] });
    const user = { id: 'u3', fullName: 'E' };
    const res = await svc.completeStep({ user, project, progress, stepN: 1 });
    if (res.xpDelta !== 0) throw new Error(`xpDelta=${res.xpDelta}`);
  }, r);

  await check('progressRepo online merge: local cache wins over remote (LWW)', async () => {
    const store = makeLocalStore(memStore());
    await store.setJSON('smib.progress.u1', { 1: { user_id: 'u1', project_id: 1, completed_step_numbers: [1, 2, 3], xp_earned: 90 } });
    const db = fakeDb({ progress: [
      { user_id: 'u1', project_id: 1, completed_step_numbers: [1], xp_earned: 20 },
      { user_id: 'u1', project_id: 5, completed_step_numbers: [1, 2], xp_earned: 50 },
    ] });
    const repo = makeProgressRepo({ store, db, configured: true });
    const all = await repo.getAllProgress('u1');
    const p1 = all.find((p) => String(p.projectId) === '1');
    const p5 = all.find((p) => String(p.projectId) === '5');
    if (!p1 || p1.completedStepNumbers.length !== 3) throw new Error('local should win for p1');
    if (!p5 || p5.completedStepNumbers.length !== 2) throw new Error('remote-only p5 missing');
  }, r);

  await check('categoryMeta maps known + unknown categories', () => {
    if (categoryMeta('Electronics').emoji !== '⚡') throw new Error('electronics emoji');
    if (categoryMeta('Coding').color !== 'purple-img') throw new Error('coding color');
    const d = categoryMeta('Nonsense');
    if (d.emoji !== '🛠️' || d.color !== 'teal-img') throw new Error('default');
  }, r);

  await check('creatorStats.buildAnalytics aggregates published projects', () => {
    const mk = (o) => new GuidedProject({ id: o.id, title: 't', status: o.status, stepCountHint: 4, enrolled: o.enrolled || 0, completion: o.completion || 0, rating: o.rating || 0 });
    const projects = [
      mk({ id: 1, status: 'published', enrolled: 100, completion: 60, rating: 4.8 }),
      mk({ id: 2, status: 'published', enrolled: 50, completion: 40, rating: 0 }),     // unrated
      mk({ id: 3, status: 'draft', enrolled: 0, completion: 0, rating: 0 }),           // excluded
    ];
    const a = buildAnalytics(projects);
    if (a.totalStudents !== 150) throw new Error(`students=${a.totalStudents}`);
    if (a.avgCompletion !== 50) throw new Error(`avgCompletion=${a.avgCompletion}`);
    if (a.avgRating !== '4.8') throw new Error(`avgRating=${a.avgRating}`);
    if (a.topProjects.length !== 2) throw new Error('topProjects');
    if (a.topProjects[0].id !== 1) throw new Error('top sorted by enrolled');
  }, r);

  await check('creatorStats.buildAnalytics avgRating null when none rated', () => {
    const a = buildAnalytics([new GuidedProject({ id: 9, title: 't', status: 'published', enrolled: 5, completion: 10, rating: 0 })]);
    if (a.avgRating !== null) throw new Error(`avgRating=${a.avgRating}`);
    if (a.weeklyBars.length !== 7) throw new Error('weeklyBars length');
  }, r);

  await check('creatorRepo.listMyProjects offline returns 11 seed projects', async () => {
    const repo = makeCreatorRepo({ store: makeLocalStore(memStore()), db: null, configured: false });
    const list = await repo.listMyProjects('creator-1');
    if (list.length !== 11) throw new Error(`len=${list.length}`);
    if (!list.some((p) => p.status === 'review')) throw new Error('expected a review project');
  }, r);

  await check('creatorRepo.saveProject (new) assigns id, caches, inserts project + steps', async () => {
    const store = makeLocalStore(memStore());
    const db = fakeDb();
    const repo = makeCreatorRepo({ store, db, configured: true });
    const saved = await repo.saveProject({
      projectRow: { id: null, creator_id: 'creator-1', creator_name: 'Cara', title: 'New', category: 'Coding', difficulty: 'Easy', status: 'draft', type: 'guided', emoji: '🤖', color: 'purple-img' },
      stepRows: [{ title: 'a', instruction: '', materials: [], xp: 40, video_url: null, proof_required: true }],
    });
    if (saved.id == null) throw new Error('id not assigned');
    if (db.calls.inserts.filter((c) => c.table === 'projects').length !== 1) throw new Error('project insert');
    if (db.calls.deletes.filter((c) => c.table === 'steps').length !== 1) throw new Error('steps delete (full-replace)');
    if (db.calls.inserts.filter((c) => c.table === 'steps').length !== 1) throw new Error('steps insert');
    const cache = await store.getJSON('smib.creator.projects.creator-1', {});
    if (!cache[saved.id]) throw new Error('not cached');
  }, r);

  await check('creatorRepo.saveProject (existing) full-replaces steps and renumbers', async () => {
    const store = makeLocalStore(memStore());
    const repo = makeCreatorRepo({ store, db: null, configured: false });
    const saved = await repo.saveProject({
      projectRow: { id: 5, creator_id: 'creator-1', title: 'WT', category: 'Renewable', status: 'draft', type: 'guided' },
      stepRows: [{ title: 'x', xp: 20 }, { title: 'y', xp: 30 }],
    });
    if (saved.steps.length !== 2) throw new Error('steps');
    if (saved.steps[1].n !== 2) throw new Error('renumber');
    const reload = await repo.getMyProjectWithSteps(5, 'creator-1');
    if (reload.steps.length !== 2) throw new Error('persisted steps');
  }, r);

  await check('creatorRepo.setStatus updates cache + offline', async () => {
    const store = makeLocalStore(memStore());
    const repo = makeCreatorRepo({ store, db: null, configured: false });
    await repo.saveProject({ projectRow: { id: 7, creator_id: 'creator-1', title: 'pH', category: 'Agriculture', status: 'draft', type: 'guided' }, stepRows: [] });
    await repo.setStatus(7, 'review', 'creator-1');
    const p = await repo.getMyProjectWithSteps(7, 'creator-1');
    if (p.status !== 'review') throw new Error(`status=${p.status}`);
  }, r);

  await check('authoringService.saveProject draft keeps status draft', async () => {
    const store = makeLocalStore(memStore());
    const creatorRepo = makeCreatorRepo({ store, db: null, configured: false });
    const svc = makeAuthoringService({ creatorRepo });
    const user = new Creator({ id: 'creator-1', email: 'c@x.y', displayName: 'Cara' });
    const saved = await svc.saveProject({ user, project: { title: 'N', category: 'Coding', difficulty: 'Easy' }, steps: [{ title: 'a', materials: 'LED, Wire', xp: 40 }], submit: false });
    if (saved.status !== 'draft') throw new Error(`status=${saved.status}`);
    if (saved.steps[0].materials.length !== 2) throw new Error('materials parsed');
    if (saved.emoji !== '🤖') throw new Error('emoji from category');
  }, r);

  await check('authoringService.saveProject submit -> review for base Creator', async () => {
    const store = makeLocalStore(memStore());
    const creatorRepo = makeCreatorRepo({ store, db: null, configured: false });
    const svc = makeAuthoringService({ creatorRepo });
    const user = new Creator({ id: 'creator-1', email: 'c@x.y', displayName: 'Cara' });
    const saved = await svc.saveProject({ user, project: { title: 'N', category: 'Coding' }, steps: [], submit: true });
    if (saved.status !== 'review') throw new Error(`status=${saved.status}`);
  }, r);

  await check('authoringService.saveProject submit -> published for VerifiedCreator', async () => {
    const store = makeLocalStore(memStore());
    const creatorRepo = makeCreatorRepo({ store, db: null, configured: false });
    const svc = makeAuthoringService({ creatorRepo });
    const user = new VerifiedCreator({ id: 'creator-2', email: 'v@x.y', displayName: 'Vee' });
    const saved = await svc.saveProject({ user, project: { title: 'N', category: 'Coding' }, steps: [], submit: true });
    if (saved.status !== 'published') throw new Error(`status=${saved.status}`);
  }, r);

  await check('authoringService.saveProject editing a published project -> review', async () => {
    const store = makeLocalStore(memStore());
    const creatorRepo = makeCreatorRepo({ store, db: null, configured: false });
    const svc = makeAuthoringService({ creatorRepo });
    const user = new Creator({ id: 'creator-1', email: 'c@x.y', displayName: 'Cara' });
    const saved = await svc.saveProject({ user, project: { id: 6, title: 'LED', category: 'Electronics', status: 'published' }, steps: [], submit: false });
    if (saved.status !== 'review') throw new Error(`status=${saved.status}`);
  }, r);

  // ── Parent flow (Day 5) ────────────────────────────────────────────────────
  await check('parentStats.aggregate sums active/done/badges over children', () => {
    const a = aggregate(SEED_CHILDREN);
    if (a.totalActive !== 4) throw new Error(`totalActive=${a.totalActive}`);
    if (a.totalDone !== 10) throw new Error(`totalDone=${a.totalDone}`);
    if (a.totalBadges !== 17) throw new Error(`totalBadges=${a.totalBadges}`);
  }, r);

  await check('parentStats.aggregate is all-zero for empty list', () => {
    const a = aggregate([]);
    if (a.totalActive || a.totalDone || a.totalBadges) throw new Error('expected zeros');
  }, r);

  await check('parentStats.xpPercent clamps and rounds', () => {
    if (xpPercent({ xp: 620, xpMax: 1000 }) !== 62) throw new Error('62 expected');
    if (xpPercent({ xp: 0, xpMax: 0 }) !== 0) throw new Error('0 when no max');
  }, r);

  await check('parentActivity.childTabs is All + unique names in feed order', () => {
    const tabs = childTabs(SEED_PARENT_ACTIVITY);
    if (tabs[0] !== 'All') throw new Error('first tab must be All');
    if (!(tabs.includes('Fazrin') && tabs.includes('Nurul'))) throw new Error('missing child');
    if (tabs.length !== 3) throw new Error(`tabs=${tabs.length}`);
  }, r);

  await check('parentActivity.filterAndGroup filters by child and groups by day', () => {
    const groups = filterAndGroup(SEED_PARENT_ACTIVITY, 'Nurul');
    const flat = groups.flatMap((g) => g.items);
    if (!flat.every((a) => a.child === 'Nurul')) throw new Error('filter leaked');
    if (!groups.some((g) => g.group === 'Today')) throw new Error('missing Today group');
    const all = filterAndGroup(SEED_PARENT_ACTIVITY, 'All');
    if (all.flatMap((g) => g.items).length !== SEED_PARENT_ACTIVITY.length) throw new Error('All should keep every row');
  }, r);

  await check('parentRepo.lookupChildByPublicId offline matches seed (LRN-4821)', async () => {
    const store = makeLocalStore(memStore());
    const repo = makeParentRepo({ store, db: null, configured: false });
    const res = await repo.lookupChildByPublicId('lrn-4821');
    if (!res.found) throw new Error('should find seed child');
    if (res.child.name !== 'Fazrin Ezan') throw new Error(`name=${res.child.name}`);
  }, r);

  await check('parentRepo.lookupChildByPublicId rejects a malformed id', async () => {
    const repo = makeParentRepo({ store: makeLocalStore(memStore()), db: null, configured: false });
    const res = await repo.lookupChildByPublicId('1234');
    if (res.found || !res.error) throw new Error('expected validation error');
  }, r);

  await check('parentRepo.lookupChildByPublicId offline not-found returns error', async () => {
    const repo = makeParentRepo({ store: makeLocalStore(memStore()), db: null, configured: false });
    const res = await repo.lookupChildByPublicId('LRN-9999');
    if (res.found || !res.error) throw new Error('expected not-found');
  }, r);

  await check('parentRepo.lookupChildByPublicId online uses the rpc row', async () => {
    const store = makeLocalStore(memStore());
    const db = fakeDb({ __rpc: { find_learner_by_public_id: [{ id: 'uuid-1', display_name: 'Aiman', school_name: 'SMK X', grade: 'Form 3', level: 3, public_id: 'LRN-0007' }] } });
    const repo = makeParentRepo({ store, db, configured: true });
    const res = await repo.lookupChildByPublicId('LRN-0007');
    if (!res.found) throw new Error('rpc row should resolve');
    if (res.child.name !== 'Aiman') throw new Error(`name=${res.child.name}`);
    if (db.calls.rpcs.length !== 1) throw new Error('rpc not called');
  }, r);

  await check('parentRepo.linkChild appends id (deduped), caches, and updates profile', async () => {
    const store = makeLocalStore(memStore());
    const db = fakeDb();
    const repo = makeParentRepo({ store, db, configured: true });
    const parent = new Parent({ id: 'p1', email: 'p@x.y', displayName: 'Halimah', linkedChildIds: [] });
    const child = { id: 'uuid-1', name: 'Aiman', public_id: 'LRN-0007' };
    await repo.linkChild(parent, child);
    await repo.linkChild(parent, child); // dedupe
    if (parent.linkedChildIds.length !== 1) throw new Error(`linked=${parent.linkedChildIds.length}`);
    const cache = await store.getJSON('smib.parent.links.p1', {});
    if (!cache['uuid-1']) throw new Error('child not cached');
    if (!db.calls.updates.some((u) => u.table === 'profiles')) throw new Error('no profile update');
  }, r);

  await check('parentRepo.listChildren returns seed plus a locally-linked child', async () => {
    const store = makeLocalStore(memStore());
    const repo = makeParentRepo({ store, db: null, configured: false });
    const parent = new Parent({ id: 'p2', email: 'p@x.y', displayName: 'Halimah', linkedChildIds: [] });
    await repo.linkChild(parent, { id: 'uuid-9', name: 'New Kid', public_id: 'LRN-0009' });
    const kids = await repo.listChildren(parent);
    if (kids.length !== SEED_CHILDREN.length + 1) throw new Error(`count=${kids.length}`);
    if (!kids.some((k) => String(k.id) === 'uuid-9')) throw new Error('linked child missing');
  }, r);

  const ok = r.every((x) => x.ok);
  return { ok, results: r };
}

export { memStore, fakeDb, check };
