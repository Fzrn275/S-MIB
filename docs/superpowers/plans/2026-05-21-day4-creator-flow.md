# Day 4 — Creator Authoring Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the creator authoring flow — Dashboard, Projects, Project Detail, New/Edit/Add-Steps, Profile (view-only), Analytics — backed by a dual-mode creator **write** data layer (create/edit projects + steps, status lifecycle), plus `schema_day4.sql` (creator-write RLS).

**Architecture:** Mirrors Day 3. Creator screens read/write via `creatorRepo` (dual-mode, write-through/LWW); `authoringService` applies the status lifecycle through the `Creator` model; `creatorStats` does pure analytics aggregation. Authoring screens push onto a `CreatorStack` above `CreatorTabs`. Step persistence is full-replace. Online creators start empty; offline shows `SEED_CREATOR_PROJECTS`.

**Tech Stack:** Expo 55, React Native 0.83, React Navigation 7 (native-stack + bottom-tabs), AsyncStorage, supabase-js, react-native-paper, expo-linear-gradient. Tests via `scripts/smoke.cjs` (`npm test`), JSX via `scripts/parsecheck.cjs`.

**Spec:** `docs/superpowers/specs/2026-05-21-day4-creator-flow-design.md`
**Prototype:** `.design-extracted/smib-app design/ScreensCreator.jsx` (screens 21–28; `ProjectFormFields` at 353–421, NewProject 424–451, EditProject 455–670, AddSteps 1114–1284, Dashboard 99–195, Projects 195–243, ProjDetail 243–353, Analytics 676–855, Profile 855–953), `App.jsx:100–112` (`CREATOR_PROJECTS`), `styles.css`.

**Conventions:** Named exports. Import tokens from `src/theme/tokens`. Reuse Day 3 components (`AppHeader`, `SectionHeader`, `StatCard`, `DifficultyPill`, `ScreenBackground`) and patterns (`useFocusEffect` refresh, id-only nav params, repos with injectable `{ store, db, configured }`). Commits use plain `git commit -m "single line"` (no heredocs).

---

## File Structure

**New — SQL**
- `supabase/schema_day4.sql` — creator-write RLS on `projects` + `steps`.

**New — data/logic (TDD)**
- `src/data/categoryMeta.js` — `categoryMeta(category) → {emoji,color}`.
- `src/data/creatorStats.js` — pure `buildAnalytics(projects)`.
- `src/repos/creatorRepo.js` — dual-mode creator reads/writes.
- `src/services/authoringService.js` — save + status lifecycle.

**New — UI**
- `src/components/StatusBadge.js`, `CreatorProjectCard.js`, `FormTextField.js`, `FormSelectField.js`, `StepEditorSheet.js`, `AnalyticsBars.js`.
- `src/screens/creator/CreatorDashboardScreen.js`, `CreatorProjectsScreen.js`, `CreatorProjectDetailScreen.js`, `CreatorNewProjectScreen.js`, `CreatorAddStepsScreen.js`, `CreatorEditProjectScreen.js`, `CreatorAnalyticsScreen.js`, `CreatorProfileScreen.js`.
- `src/navigation/CreatorStack.js`.

**Modified**
- `src/data/seedData.js` (`SEED_CREATOR_PROJECTS`; export `placeholderSteps`).
- `src/data/localStore.js` (creator keys).
- `src/data/__datatest.js` (extend `fakeDb`; creator tests).
- `src/repos/index.js` (export `creatorRepo`).
- `src/navigation/CreatorTabs.js`, `src/navigation/RootNavigator.js`.
- `supabase/README.md`.

---

## Phase A — SQL + seed

### Task 1: `schema_day4.sql`

**Files:** Create `supabase/schema_day4.sql`

- [ ] **Step 1: Write the file**

```sql
-- ============================================================================
-- S-MIB — Supabase schema (Day 4): creator write access. Run AFTER
-- schema_day3.sql. Adds INSERT/UPDATE/DELETE RLS so a creator can author and
-- manage their own projects + steps. No new tables.
-- ============================================================================

-- projects: owner can insert/update/delete their own rows
drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own" on public.projects
  for insert with check (creator_id = auth.uid());

drop policy if exists "projects_update_own" on public.projects;
create policy "projects_update_own" on public.projects
  for update using (creator_id = auth.uid()) with check (creator_id = auth.uid());

drop policy if exists "projects_delete_own" on public.projects;
create policy "projects_delete_own" on public.projects
  for delete using (creator_id = auth.uid());

-- steps: writable when the parent project is owned by the caller
drop policy if exists "steps_insert_own" on public.steps;
create policy "steps_insert_own" on public.steps
  for insert with check (exists (
    select 1 from public.projects p where p.id = steps.project_id and p.creator_id = auth.uid()));

drop policy if exists "steps_update_own" on public.steps;
create policy "steps_update_own" on public.steps
  for update using (exists (
    select 1 from public.projects p where p.id = steps.project_id and p.creator_id = auth.uid()));

drop policy if exists "steps_delete_own" on public.steps;
create policy "steps_delete_own" on public.steps
  for delete using (exists (
    select 1 from public.projects p where p.id = steps.project_id and p.creator_id = auth.uid()));
```

- [ ] **Step 2: Verify policy count**

Run: `grep -c 'create policy' supabase/schema_day4.sql`
Expected: `6`.

- [ ] **Step 3: Commit**

```bash
git add supabase/schema_day4.sql
git commit -m "feat(db): add Day 4 creator-write RLS for projects + steps"
```

### Task 2: `SEED_CREATOR_PROJECTS` + export `placeholderSteps`

**Files:** Modify `src/data/seedData.js`

- [ ] **Step 1: Export `placeholderSteps`**

In `src/data/seedData.js`, change the `placeholderSteps` declaration from:

```js
function placeholderSteps(projectId, count) {
```

to:

```js
export function placeholderSteps(projectId, count) {
```

- [ ] **Step 2: Append `SEED_CREATOR_PROJECTS`**

Add at the end of `src/data/seedData.js` (rows from `App.jsx:100–112`, expanded to full project columns; `creator_id: null` is replaced at runtime with the demo creator's id):

```js
/** Offline demo creator's portfolio (mixed draft/review/published). */
export const SEED_CREATOR_PROJECTS = [
  { id: 1,  title: 'Solar Phone Charger',    category: 'Electronics', difficulty: 'Easy',   duration: '3–5 hours', description: 'Build a solar-powered USB charger using a 6V panel, USB module and basic breadboard wiring.', emoji: '⚡', color: 'teal-img',   creator_id: null, creator_name: 'Ahmad Khalil', status: 'published', enrolled: 142, completion: 68, rating: 4.9, type: 'guided', step_count: 6 },
  { id: 2,  title: 'Smart Water Sensor',     category: 'Agriculture', difficulty: 'Medium', duration: '1–2 days',  description: 'Capacitive soil moisture sensor with an Arduino Nano that sends SMS alerts.', emoji: '🌱', color: 'green-img',  creator_id: null, creator_name: 'Ahmad Khalil', status: 'published', enrolled: 98,  completion: 52, rating: 4.7, type: 'guided', step_count: 8 },
  { id: 3,  title: 'Biogas Generator',       category: 'Agriculture', difficulty: 'Medium', duration: '1 week',    description: 'Small-scale biogas digester from recycled materials.', emoji: '🔬', color: 'green-img',  creator_id: null, creator_name: 'Ahmad Khalil', status: 'review',    enrolled: 0,   completion: 0,  rating: 0,   type: 'guided', step_count: 7 },
  { id: 4,  title: 'Arduino Plant Monitor',  category: 'Coding',      difficulty: 'Hard',   duration: '2+ weeks',  description: 'Full IoT project: soil sensor + DHT11 + OLED + Blynk dashboard.', emoji: '🤖', color: 'purple-img', creator_id: null, creator_name: 'Ahmad Khalil', status: 'published', enrolled: 203, completion: 31, rating: 4.8, type: 'guided', step_count: 10 },
  { id: 5,  title: 'Wind Turbine Basics',    category: 'Renewable',   difficulty: 'Easy',   duration: '1–2 hours', description: 'Functional wind turbine from recycled bottles and a DC motor.', emoji: '♻️', color: 'green-img',  creator_id: null, creator_name: 'Ahmad Khalil', status: 'draft',     enrolled: 0,   completion: 0,  rating: 0,   type: 'guided', step_count: 5 },
  { id: 6,  title: 'LED Circuit Board',      category: 'Electronics', difficulty: 'Easy',   duration: '1–2 hours', description: 'Fundamentals of circuit design: resistors, LEDs, breadboards, multimeters.', emoji: '💡', color: 'teal-img',   creator_id: null, creator_name: 'Ahmad Khalil', status: 'published', enrolled: 188, completion: 89, rating: 5.0, type: 'guided', step_count: 4 },
  { id: 7,  title: 'Soil pH Tester',         category: 'Agriculture', difficulty: 'Easy',   duration: '3–5 hours', description: 'Measure soil pH with a probe and a microcontroller.', emoji: '🌱', color: 'green-img',  creator_id: null, creator_name: 'Ahmad Khalil', status: 'draft',     enrolled: 0,   completion: 0,  rating: 0,   type: 'guided', step_count: 4 },
  { id: 8,  title: 'Hydroponic System',      category: 'Agriculture', difficulty: 'Hard',   duration: '2+ weeks',  description: 'Automated hydroponic system with pH sensor and pump control.', emoji: '🥬', color: 'green-img',  creator_id: null, creator_name: 'Ahmad Khalil', status: 'published', enrolled: 76,  completion: 44, rating: 4.6, type: 'guided', step_count: 9 },
  { id: 9,  title: 'Ultrasonic Meter',       category: 'Coding',      difficulty: 'Easy',   duration: '1–2 hours', description: 'Handheld distance meter using HC-SR04 and a 16×2 LCD.', emoji: '📡', color: 'purple-img', creator_id: null, creator_name: 'Ahmad Khalil', status: 'published', enrolled: 91,  completion: 74, rating: 4.7, type: 'guided', step_count: 4 },
  { id: 10, title: 'Solar Water Heater',     category: 'Renewable',   difficulty: 'Medium', duration: '1 week',    description: 'Passive solar water heating panel from copper pipe.', emoji: '☀️', color: 'amber-img',  creator_id: null, creator_name: 'Ahmad Khalil', status: 'review',    enrolled: 0,   completion: 0,  rating: 0,   type: 'guided', step_count: 6 },
  { id: 11, title: 'Earthquake Detector',    category: 'Coding',      difficulty: 'Hard',   duration: '1–2 days',  description: 'Seismograph with MPU-6050, SD logging and FFT analysis.', emoji: '📳', color: 'red-img',    creator_id: null, creator_name: 'Ahmad Khalil', status: 'published', enrolled: 29,  completion: 18, rating: 4.8, type: 'guided', step_count: 8 },
];
```

- [ ] **Step 3: Parse-check + commit**

```bash
node scripts/parsecheck.cjs src/data/seedData.js
git add src/data/seedData.js
git commit -m "feat(data): add SEED_CREATOR_PROJECTS + export placeholderSteps"
```

### Task 3: creator localStore keys

**Files:** Modify `src/data/localStore.js`

- [ ] **Step 1: Add keys**

In `src/data/localStore.js`, extend the `keys` object (after `lastActive`):

```js
  creatorProjects: (userId) => `smib.creator.projects.${userId}`,
  creatorSteps: (userId) => `smib.creator.steps.${userId}`,
  creatorNextId: 'smib.creator.nextid',
```

- [ ] **Step 2: Parse-check + commit**

```bash
node scripts/parsecheck.cjs src/data/localStore.js
git add src/data/localStore.js
git commit -m "feat(data): add creator localStore keys"
```

---

## Phase B — Pure helpers (TDD)

### Task 4: `categoryMeta.js`

**Files:** Create `src/data/categoryMeta.js`; Test `src/data/__datatest.js`

- [ ] **Step 1: Add failing test**

Add import to `src/data/__datatest.js`: `import { categoryMeta } from './categoryMeta';`
Inside `runDataSmokeTest` (before `const ok`):

```js
  await check('categoryMeta maps known + unknown categories', () => {
    if (categoryMeta('Electronics').emoji !== '⚡') throw new Error('electronics emoji');
    if (categoryMeta('Coding').color !== 'purple-img') throw new Error('coding color');
    const d = categoryMeta('Nonsense');
    if (d.emoji !== '🛠️' || d.color !== 'teal-img') throw new Error('default');
  }, r);
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test data`
Expected: FAIL — `Cannot find module './categoryMeta'`.

- [ ] **Step 3: Implement `src/data/categoryMeta.js`**

```js
/** Map a project category to a default emoji + thumb-color class. */
const MAP = {
  Electronics: { emoji: '⚡', color: 'teal-img' },
  Agriculture: { emoji: '🌱', color: 'green-img' },
  Renewable: { emoji: '♻️', color: 'green-img' },
  'Renewable Energy': { emoji: '♻️', color: 'green-img' },
  Coding: { emoji: '🤖', color: 'purple-img' },
  Biology: { emoji: '🔬', color: 'green-img' },
  Physics: { emoji: '📡', color: 'amber-img' },
};

export function categoryMeta(category) {
  return MAP[category] || { emoji: '🛠️', color: 'teal-img' };
}
```

- [ ] **Step 4: Run to verify pass + commit**

```bash
npm test data   # ✓ Data: 17/17 passing
git add src/data/categoryMeta.js src/data/__datatest.js
git commit -m "feat(data): add categoryMeta helper"
```

### Task 5: `creatorStats.js`

**Files:** Create `src/data/creatorStats.js`; Test `src/data/__datatest.js`

- [ ] **Step 1: Add failing tests**

Add import: `import { buildAnalytics } from './creatorStats';` (and reuse `GuidedProject` already imported).
Inside `runDataSmokeTest`:

```js
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
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test data`
Expected: FAIL — `buildAnalytics is not a function`.

- [ ] **Step 3: Implement `src/data/creatorStats.js`**

```js
/**
 * Pure aggregation of a creator's projects for the Analytics screen.
 * `projects` is an array of Project instances.
 */
export function buildAnalytics(projects) {
  const published = projects.filter((p) => p.isPublished);
  const totalStudents = published.reduce((sum, p) => sum + (p.enrolled || 0), 0);
  const avgCompletion = published.length
    ? Math.round(published.reduce((sum, p) => sum + (p.completion || 0), 0) / published.length)
    : 0;

  const rated = published.filter((p) => (p.rating || 0) > 0);
  const avgRating = rated.length
    ? (rated.reduce((sum, p) => sum + p.rating, 0) / rated.length).toFixed(1)
    : null;

  const topProjects = [...published].sort((a, b) => (b.enrolled || 0) - (a.enrolled || 0)).slice(0, 4);

  // Mock weekly trend proportional to total students (real time-series deferred).
  const ratios = [0.12, 0.28, 0.18, 0.42, 0.22, 0.08, 0.52];
  const scale = Math.min(60, totalStudents / 2 + 10);
  const raw = ratios.map((r) => Math.round(r * scale));
  const maxH = Math.max(...raw, 10);
  const weeklyBars = raw.map((h) => Math.max(0.08, h / maxH));

  return { totalStudents, avgCompletion, avgRating, ratedCount: rated.length, topProjects, weeklyBars };
}
```

- [ ] **Step 4: Run to verify pass + commit**

```bash
npm test data   # ✓ Data: 19/19 passing
git add src/data/creatorStats.js src/data/__datatest.js
git commit -m "feat(data): add creatorStats.buildAnalytics"
```

---

## Phase C — creatorRepo (TDD)

### Task 6: Extend `fakeDb`, then `creatorRepo`

**Files:** Modify `src/data/__datatest.js` (extend `fakeDb`); Create `src/repos/creatorRepo.js`

- [ ] **Step 1: Extend the `fakeDb` helper**

The current `fakeDb` (in `src/data/__datatest.js`) supports `select/upsert/update/insert`. `creatorRepo`
needs `insert(row).select().single()` and `delete().eq()`. Replace the `from(table)` return object's
`insert` and add `delete`, and make `insert` chainable. Replace the `fakeDb` function body's `from`
method with:

```js
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
```

Also extend the `calls` object initializer in `fakeDb` from `{ upserts: [], updates: [] }` to:

```js
  const calls = { upserts: [], updates: [], inserts: [], deletes: [] };
```

- [ ] **Step 2: Add failing creatorRepo tests**

Add imports: `import { makeCreatorRepo } from '../repos/creatorRepo';` (reuse `makeLocalStore`, `memStore`, `fakeDb`).

```js
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
```

- [ ] **Step 3: Run to verify failure**

Run: `npm test data`
Expected: FAIL — `makeCreatorRepo is not a function`.

- [ ] **Step 4: Implement `src/repos/creatorRepo.js`**

```js
import { isSupabaseConfigured, supabase as defaultDb } from '../services/supabase';
import { localStore as defaultStore, keys } from '../data/localStore';
import { Project } from '../models';
import { SEED_CREATOR_PROJECTS, SEED_STEPS, placeholderSteps } from '../data/seedData';

export function makeCreatorRepo({ store = defaultStore, db = defaultDb, configured = isSupabaseConfigured() } = {}) {
  const projCache = (uid) => store.getJSON(keys.creatorProjects(uid), {}).then((v) => v || {});
  const stepCache = (uid) => store.getJSON(keys.creatorSteps(uid), {}).then((v) => v || {});

  async function listMyProjects(creatorId) {
    if (configured && db) {
      const { data, error } = await db.from('projects').select('*').eq('creator_id', creatorId).order('id');
      if (!error && data) return data.map((row) => Project.fromRow(row, []));
    }
    const map = {};
    SEED_CREATOR_PROJECTS.forEach((row) => { map[row.id] = { ...row, creator_id: creatorId }; });
    const cache = await projCache(creatorId);
    Object.values(cache).forEach((row) => { map[row.id] = row; });
    return Object.values(map).map((row) => Project.fromRow(row, []));
  }

  async function getMyProjectWithSteps(id, creatorId) {
    if (configured && db) {
      const { data: pRows, error } = await db.from('projects').select('*').eq('id', id).limit(1);
      const pRow = !error && pRows ? pRows[0] : null;
      if (!pRow) return null;
      const { data: sRows } = await db.from('steps').select('*').eq('project_id', id).order('step_n');
      return Project.fromRow(pRow, sRows || []);
    }
    const cacheP = await projCache(creatorId);
    const cacheS = await stepCache(creatorId);
    let pRow = cacheP[id];
    if (!pRow) {
      const seed = SEED_CREATOR_PROJECTS.find((row) => String(row.id) === String(id));
      pRow = seed ? { ...seed, creator_id: creatorId } : null;
    }
    if (!pRow) return null;
    const sRows = cacheS[id] || SEED_STEPS[id] || placeholderSteps(Number(id), pRow.step_count || 0);
    return Project.fromRow(pRow, sRows);
  }

  async function saveProject({ projectRow, stepRows }) {
    const uid = projectRow.creator_id;
    let id = projectRow.id;

    if (id == null) {
      if (configured && db) {
        const { id: _omit, ...insertRow } = projectRow;
        const { data, error } = await db.from('projects').insert(insertRow).select().single();
        if (!error && data) id = data.id;
      }
      if (id == null) {
        const next = (await store.getJSON(keys.creatorNextId, 1000)) || 1000;
        id = next;
        await store.setJSON(keys.creatorNextId, next + 1);
      }
    } else if (configured && db) {
      await db.from('projects').upsert(projectRow, { onConflict: 'id' });
    }

    const numbered = stepRows.map((s, i) => ({ ...s, project_id: id, step_n: i + 1 }));
    const finalRow = { ...projectRow, id, step_count: numbered.length };

    const cacheP = await projCache(uid);
    cacheP[id] = finalRow;
    await store.setJSON(keys.creatorProjects(uid), cacheP);
    const cacheS = await stepCache(uid);
    cacheS[id] = numbered;
    await store.setJSON(keys.creatorSteps(uid), cacheS);

    if (configured && db) {
      await db.from('steps').delete().eq('project_id', id);
      if (numbered.length) await db.from('steps').insert(numbered);
      await db.from('projects').update({ step_count: numbered.length }).eq('id', id);
    }

    return Project.fromRow(finalRow, numbered);
  }

  async function setStatus(projectId, status, creatorId) {
    const cacheP = await projCache(creatorId);
    if (cacheP[projectId]) {
      cacheP[projectId] = { ...cacheP[projectId], status };
    } else {
      const seed = SEED_CREATOR_PROJECTS.find((row) => String(row.id) === String(projectId));
      if (seed) cacheP[projectId] = { ...seed, creator_id: creatorId, status };
    }
    await store.setJSON(keys.creatorProjects(creatorId), cacheP);
    if (configured && db) await db.from('projects').update({ status }).eq('id', projectId);
  }

  async function deleteProject(projectId, creatorId) {
    const cacheP = await projCache(creatorId);
    delete cacheP[projectId];
    await store.setJSON(keys.creatorProjects(creatorId), cacheP);
    const cacheS = await stepCache(creatorId);
    delete cacheS[projectId];
    await store.setJSON(keys.creatorSteps(creatorId), cacheS);
    if (configured && db) await db.from('projects').delete().eq('id', projectId);
  }

  return { listMyProjects, getMyProjectWithSteps, saveProject, setStatus, deleteProject };
}

export const creatorRepo = makeCreatorRepo();
```

- [ ] **Step 5: Run to verify pass**

Run: `npm test data`
Expected: `✓ Data: 23/23 passing`.

- [ ] **Step 6: Export from barrel + commit**

Add to `src/repos/index.js`: `export { creatorRepo, makeCreatorRepo } from './creatorRepo';`

```bash
node scripts/parsecheck.cjs src/repos/creatorRepo.js src/repos/index.js
git add src/repos/creatorRepo.js src/repos/index.js src/data/__datatest.js
git commit -m "feat(repos): add dual-mode creatorRepo (write-through, full-replace steps)"
```

---

## Phase D — authoringService (TDD)

### Task 7: `authoringService.js`

**Files:** Create `src/services/authoringService.js`; Test `src/data/__datatest.js`

- [ ] **Step 1: Add failing tests**

Add imports: `import { makeAuthoringService } from '../services/authoringService';`, and reuse `Creator`/`VerifiedCreator` — add them to the existing models import line in `__datatest.js` (`import { ..., Creator, VerifiedCreator } from '../models';`).

```js
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
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test data`
Expected: FAIL — `makeAuthoringService is not a function`.

- [ ] **Step 3: Implement `src/services/authoringService.js`**

```js
import { creatorRepo as defaultCreatorRepo } from '../repos';
import { categoryMeta } from '../data/categoryMeta';

function parseMaterials(input) {
  if (Array.isArray(input)) return input;
  if (!input || typeof input !== 'string') return [];
  return input.split(',').map((s) => s.trim()).filter(Boolean).map((name) => ({ name }));
}

export function makeAuthoringService({ creatorRepo = defaultCreatorRepo } = {}) {
  /**
   * Persist a project + its steps and apply the status lifecycle.
   * `project` is plain data (id optional). `submit` requests review/publish.
   */
  async function saveProject({ user, project, steps, submit = false }) {
    const meta = categoryMeta(project.category);
    const wasPublished = project.status === 'published';

    let status;
    if (submit) status = user.intendedPublishStatus();
    else if (wasPublished) status = user.intendedPublishStatus(); // re-review on edit
    else status = project.status === 'review' ? 'review' : 'draft';

    const projectRow = {
      id: project.id ?? null,
      title: project.title,
      category: project.category,
      difficulty: project.difficulty || 'Easy',
      duration: project.duration || null,
      description: project.description || null,
      emoji: project.emoji || meta.emoji,
      color: project.color || meta.color,
      creator_id: user.id,
      creator_name: user.fullName,
      status,
      enrolled: project.enrolled || 0,
      completion: project.completion || 0,
      rating: project.rating || 0,
      cover_url: project.cover_url || null,
      type: project.type || 'guided',
    };

    const stepRows = (steps || []).map((s) => ({
      title: s.title,
      instruction: s.instruction || '',
      tip: s.tip || null,
      materials: parseMaterials(s.materials),
      xp: Number(s.xp) || 40,
      video_url: s.videoUrl || s.video_url || null,
      proof_required: s.proofRequired !== false,
    }));

    return creatorRepo.saveProject({ projectRow, stepRows });
  }

  async function submitForReview({ user, projectId }) {
    return creatorRepo.setStatus(projectId, user.intendedPublishStatus(), user.id);
  }

  async function withdraw({ user, projectId }) {
    return creatorRepo.setStatus(projectId, 'draft', user.id);
  }

  return { saveProject, submitForReview, withdraw };
}

export const authoringService = makeAuthoringService();
```

- [ ] **Step 4: Run to verify pass + commit**

```bash
npm test   # model 22, auth 11, data 27 — all green
node scripts/parsecheck.cjs src/services/authoringService.js
git add src/services/authoringService.js src/data/__datatest.js
git commit -m "feat(services): add authoringService (save + status lifecycle)"
```

---

## Phase E — Components

> Presentational, named exports, styled with `theme/tokens`. Verification = `node scripts/parsecheck.cjs <file>`. Port visual values from the prototype `styles.css` classes named per task.

### Task 8: `StatusBadge.js`

**Files:** Create `src/components/StatusBadge.js`

- [ ] **Step 1: Write the component**

```js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii, sizes } from '../theme/tokens';

const META = {
  draft:     { label: 'Draft',     fg: colors.textMuted, bg: colors.glass },
  review:    { label: 'In Review', fg: colors.cyan,      bg: 'rgba(14,116,144,0.18)' },
  published: { label: 'Published', fg: colors.green,     bg: 'rgba(34,197,94,0.15)' },
  rejected:  { label: 'Rejected',  fg: colors.red,       bg: 'rgba(239,68,68,0.15)' },
};

export function StatusBadge({ status, style }) {
  const m = META[status] || META.draft;
  return (
    <View style={[styles.badge, { backgroundColor: m.bg }, style]}>
      <Text style={[styles.text, { color: m.fg }]}>{m.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radii.pill, alignSelf: 'flex-start' },
  text: { fontSize: sizes.textXs, fontWeight: '800' },
});
```

- [ ] **Step 2: Parse-check + commit**

```bash
node scripts/parsecheck.cjs src/components/StatusBadge.js
git add src/components/StatusBadge.js
git commit -m "feat(ui): add StatusBadge"
```

### Task 9: `CreatorProjectCard.js`

**Files:** Create `src/components/CreatorProjectCard.js`

Port `App.jsx:219-241` (list-card) adapted for creator stats; styles.css `.list-card*`, `.status-badge`.

- [ ] **Step 1: Write the component**

```js
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, sizes, spacing, thumbGradient } from '../theme/tokens';
import { StatusBadge } from './StatusBadge';

/** project = a Project instance. */
export function CreatorProjectCard({ project, onPress }) {
  const published = project.isPublished;
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <LinearGradient colors={thumbGradient(project.color)} style={styles.thumb}>
          <Text style={styles.emoji}>{project.emoji}</Text>
        </LinearGradient>
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={1}>{project.title}</Text>
          <Text style={styles.meta} numberOfLines={1}>{project.category} · {project.difficulty} · {project.stepCount} steps</Text>
          <StatusBadge status={project.status} style={{ marginTop: 6 }} />
        </View>
      </View>
      {published ? (
        <View style={styles.stats}>
          <Text style={styles.stat}>👥 {project.enrolled}</Text>
          <Text style={styles.stat}>✅ {project.completion}%</Text>
          <Text style={styles.stat}>★ {project.rating || '—'}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: spacing.lg, marginBottom: spacing.sm, padding: spacing.md, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: { width: 52, height: 52, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 24 },
  body: { flex: 1, minWidth: 0 },
  title: { color: colors.white, fontSize: sizes.textMd, fontWeight: '800' },
  meta: { color: colors.textDim, fontSize: sizes.textXs, marginTop: 2 },
  stats: { flexDirection: 'row', gap: 16, marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  stat: { color: colors.textMuted, fontSize: sizes.textXs, fontWeight: '700' },
});
```

- [ ] **Step 2: Parse-check + commit**

```bash
node scripts/parsecheck.cjs src/components/CreatorProjectCard.js
git add src/components/CreatorProjectCard.js
git commit -m "feat(ui): add CreatorProjectCard"
```

### Task 10: `FormTextField.js` + `FormSelectField.js`

**Files:** Create `src/components/FormTextField.js`, `src/components/FormSelectField.js`

- [ ] **Step 1: Write `FormTextField.js`**

```js
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, radii, sizes, spacing } from '../theme/tokens';

export function FormTextField({ label, value, onChangeText, placeholder, required, multiline, keyboardType }) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}{required ? ' *' : ''}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textDim}
        multiline={!!multiline}
        keyboardType={keyboardType || 'default'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  group: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  label: { color: colors.textMuted, fontSize: sizes.textXs, fontWeight: '700', marginBottom: 6 },
  input: { backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: 10, color: colors.white, fontSize: sizes.textSm },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
});
```

- [ ] **Step 2: Write `FormSelectField.js`** (tap-to-open option list via Paper Menu)

```js
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Menu } from 'react-native-paper';
import { colors, radii, sizes, spacing } from '../theme/tokens';

export function FormSelectField({ label, value, options, onSelect, placeholder, required }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}{required ? ' *' : ''}</Text>
      <Menu
        visible={open}
        onDismiss={() => setOpen(false)}
        anchor={
          <Pressable style={styles.input} onPress={() => setOpen(true)}>
            <Text style={[styles.value, !value && styles.placeholder]}>{value || placeholder || 'Select…'}</Text>
            <Text style={styles.chevron}>▾</Text>
          </Pressable>
        }
      >
        {options.map((opt) => (
          <Menu.Item key={opt} title={opt} onPress={() => { onSelect(opt); setOpen(false); }} />
        ))}
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  label: { color: colors.textMuted, fontSize: sizes.textXs, fontWeight: '700', marginBottom: 6 },
  input: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: 12 },
  value: { color: colors.white, fontSize: sizes.textSm },
  placeholder: { color: colors.textDim },
  chevron: { color: colors.textMuted, fontSize: sizes.textSm },
});
```

- [ ] **Step 3: Parse-check + commit**

```bash
node scripts/parsecheck.cjs src/components/FormTextField.js src/components/FormSelectField.js
git add src/components/FormTextField.js src/components/FormSelectField.js
git commit -m "feat(ui): add FormTextField + FormSelectField"
```

### Task 11: `StepEditorSheet.js`

**Files:** Create `src/components/StepEditorSheet.js`

Port the EditProject step bottom sheet (`ScreensCreator.jsx:575-666`). Modal with title/instructions/materials/video/XP.

- [ ] **Step 1: Write the component**

```js
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { FormTextField } from './FormTextField';
import { colors, radii, sizes, spacing } from '../theme/tokens';

const EMPTY = { title: '', instruction: '', materials: '', videoUrl: '', xp: '40' };

/** initial: a step draft (or null for new). onSave(draft), onCancel(). */
export function StepEditorSheet({ visible, initial, index, onSave, onCancel }) {
  const [draft, setDraft] = useState(EMPTY);
  useEffect(() => { setDraft(initial ? { ...EMPTY, ...initial } : EMPTY); }, [initial, visible]);
  const set = (k) => (v) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>{index == null ? 'Add New Step' : `Edit Step ${index + 1}`}</Text>
          <ScrollView>
            <FormTextField label="Step Title" required value={draft.title} onChangeText={set('title')} placeholder="e.g. Gather Materials" />
            <FormTextField label="Instructions" value={draft.instruction} onChangeText={set('instruction')} placeholder="Step-by-step instructions…" multiline />
            <FormTextField label="Materials (comma separated)" value={draft.materials} onChangeText={set('materials')} placeholder="Breadboard, LED, Resistor" />
            <FormTextField label="Learning Video URL (optional)" value={draft.videoUrl} onChangeText={set('videoUrl')} placeholder="https://youtube.com/…" keyboardType="url" />
            <FormTextField label="XP Reward" value={String(draft.xp)} onChangeText={set('xp')} placeholder="40" keyboardType="number-pad" />
          </ScrollView>
          <View style={styles.actions}>
            <Button mode="outlined" textColor={colors.white} style={styles.btn} onPress={onCancel}>Cancel</Button>
            <Button mode="contained" buttonColor={colors.teal} textColor={colors.white} style={styles.btn} disabled={!draft.title.trim()} onPress={() => onSave(draft)}>Save Step</Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.navyLight, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, paddingTop: spacing.sm, paddingBottom: spacing.xl, maxHeight: '88%' },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing.md },
  title: { color: colors.white, fontSize: sizes.textLg, fontWeight: '900', paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginTop: spacing.sm },
  btn: { flex: 1, borderColor: colors.border },
});
```

- [ ] **Step 2: Parse-check + commit**

```bash
node scripts/parsecheck.cjs src/components/StepEditorSheet.js
git add src/components/StepEditorSheet.js
git commit -m "feat(ui): add StepEditorSheet"
```

### Task 12: `AnalyticsBars.js`

**Files:** Create `src/components/AnalyticsBars.js`

- [ ] **Step 1: Write the component**

```js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, sizes, spacing } from '../theme/tokens';

/** bars: number[] heights 0..1; labels: string[] same length. */
export function AnalyticsBars({ bars, labels }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.bars}>
        {bars.map((h, i) => (
          <View key={i} style={styles.col}>
            <View style={[styles.bar, { height: Math.max(4, Math.round(h * 80)) }]} />
            <Text style={styles.label}>{labels[i]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: spacing.lg, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.md },
  bars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 100 },
  col: { alignItems: 'center', flex: 1 },
  bar: { width: 14, borderRadius: 6, backgroundColor: colors.cyan },
  label: { color: colors.textDim, fontSize: 10, marginTop: 6 },
});
```

- [ ] **Step 2: Parse-check + commit**

```bash
node scripts/parsecheck.cjs src/components/AnalyticsBars.js
git add src/components/AnalyticsBars.js
git commit -m "feat(ui): add AnalyticsBars"
```

---

## Phase F — Screens

> Named-export `function ScreenName({ navigation, route })`. Load via repos with `useFocusEffect` refresh; `useAuth()` for the creator `user`. Verification = `node scripts/parsecheck.cjs <file>`; behavior in Phase H QA. Reuse Day 3 `AppHeader`, `SectionHeader`, `StatCard`, `ScreenBackground`.

### Task 13: `CreatorDashboardScreen.js`

**Files:** Create `src/screens/creator/CreatorDashboardScreen.js` (port `ScreensCreator.jsx:99-195`)

- [ ] **Step 1: Write the screen**

```js
import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AppHeader } from '../../components/AppHeader';
import { StatCard } from '../../components/StatCard';
import { SectionHeader } from '../../components/SectionHeader';
import { CreatorProjectCard } from '../../components/CreatorProjectCard';
import { useAuth } from '../../context/AuthContext';
import { creatorRepo } from '../../repos';
import { buildAnalytics } from '../../data/creatorStats';
import { colors, spacing, sizes } from '../../theme/tokens';

export function CreatorDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const list = await creatorRepo.listMyProjects(user.id);
    setProjects(list);
    setLoading(false);
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const stats = buildAnalytics(projects);
  const recent = [...projects].slice(0, 4);

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }} showsVerticalScrollIndicator={false}>
        <AppHeader paddingBottom={spacing.xl}>
          <Text style={styles.eyebrow}>S-MIB CREATOR</Text>
          <Text style={styles.name}>{user ? user.fullName : ''}</Text>
          <Text style={styles.sub}>{user ? user.publicId : ''}</Text>
        </AppHeader>

        <View style={styles.stats}>
          <StatCard value={projects.length} label="Projects" tone="teal" onPress={() => navigation.navigate('Projects')} />
          <View style={{ width: spacing.sm }} />
          <StatCard value={stats.totalStudents} label="Students" tone="yellow" />
          <View style={{ width: spacing.sm }} />
          <StatCard value={stats.avgRating || '—'} label="Avg ★" tone="green" />
        </View>

        <View style={styles.cta}>
          <Button mode="contained" buttonColor={colors.teal} textColor={colors.white} onPress={() => navigation.navigate('CreatorNewProject')}>
            + New Project
          </Button>
        </View>

        <SectionHeader title="Recent Projects" icon="🛠️" link="See all" onLink={() => navigation.navigate('Projects')} />
        {loading ? (
          <ActivityIndicator color={colors.cyan} style={{ marginTop: spacing.lg }} />
        ) : (
          recent.map((p) => <CreatorProjectCard key={p.id} project={p} onPress={() => navigation.navigate('CreatorProjectDetail', { projectId: p.id })} />)
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  eyebrow: { color: colors.cyan, fontSize: sizes.textXs, fontWeight: '800', letterSpacing: 2 },
  name: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '900', marginTop: 4 },
  sub: { color: colors.textMuted, fontSize: sizes.textSm, marginTop: 2 },
  stats: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginTop: -spacing.xl + 4 },
  cta: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
});
```

- [ ] **Step 2: Parse-check + commit**

```bash
node scripts/parsecheck.cjs src/screens/creator/CreatorDashboardScreen.js
git add src/screens/creator/CreatorDashboardScreen.js
git commit -m "feat(creator): add Dashboard screen"
```

### Task 14: `CreatorProjectsScreen.js`

**Files:** Create `src/screens/creator/CreatorProjectsScreen.js` (port `ScreensCreator.jsx:195-243`)

- [ ] **Step 1: Write the screen**

```js
import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AppHeader } from '../../components/AppHeader';
import { CreatorProjectCard } from '../../components/CreatorProjectCard';
import { useAuth } from '../../context/AuthContext';
import { creatorRepo } from '../../repos';
import { colors, spacing, sizes } from '../../theme/tokens';

const TABS = [
  { label: 'All', match: () => true },
  { label: 'Published', match: (p) => p.status === 'published' },
  { label: 'In Review', match: (p) => p.status === 'review' },
  { label: 'Draft', match: (p) => p.status === 'draft' },
];

export function CreatorProjectsScreen({ navigation }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setProjects(await creatorRepo.listMyProjects(user.id));
    setLoading(false);
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const shown = projects.filter(TABS[tab].match);

  return (
    <ScreenBackground>
      <AppHeader paddingBottom={spacing.md}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>My Projects</Text>
          <Button mode="contained" compact buttonColor={colors.teal} textColor={colors.white} onPress={() => navigation.navigate('CreatorNewProject')}>+ New</Button>
        </View>
      </AppHeader>

      <View style={styles.tabs}>
        {TABS.map((t, i) => (
          <Pressable key={t.label} onPress={() => setTab(i)} style={[styles.tab, tab === i && styles.tabActive]}>
            <Text style={[styles.tabText, tab === i && styles.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.cyan} style={{ marginTop: spacing.xl }} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingTop: spacing.sm, paddingBottom: spacing.xxl }}>
          {shown.length === 0 ? (
            <Text style={styles.empty}>No projects here yet.</Text>
          ) : (
            shown.map((p) => <CreatorProjectCard key={p.id} project={p} onPress={() => navigation.navigate('CreatorProjectDetail', { projectId: p.id })} />)
          )}
        </ScrollView>
      )}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '900' },
  tabs: { flexDirection: 'row', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: 8 },
  tab: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.teal, borderColor: colors.cyan },
  tabText: { color: colors.textMuted, fontSize: sizes.textXs, fontWeight: '800' },
  tabTextActive: { color: colors.white },
  empty: { color: colors.textDim, textAlign: 'center', marginTop: spacing.xxl, fontSize: sizes.textSm },
});
```

- [ ] **Step 2: Parse-check + commit**

```bash
node scripts/parsecheck.cjs src/screens/creator/CreatorProjectsScreen.js
git add src/screens/creator/CreatorProjectsScreen.js
git commit -m "feat(creator): add My Projects screen"
```

### Task 15: `CreatorProjectDetailScreen.js`

**Files:** Create `src/screens/creator/CreatorProjectDetailScreen.js` (port `ScreensCreator.jsx:243-353`)

- [ ] **Step 1: Write the screen**

```js
import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AppHeader } from '../../components/AppHeader';
import { SectionHeader } from '../../components/SectionHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { creatorRepo } from '../../repos';
import { authoringService } from '../../services/authoringService';
import { colors, spacing, sizes, radii } from '../../theme/tokens';

export function CreatorProjectDetailScreen({ navigation, route }) {
  const { projectId } = route.params;
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setProject(await creatorRepo.getMyProjectWithSteps(projectId, user.id));
    setLoading(false);
  }, [user, projectId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading || !project) {
    return <ScreenBackground><ActivityIndicator color={colors.cyan} style={{ marginTop: 80 }} /></ScreenBackground>;
  }

  const doStatus = async (fn) => { setBusy(true); try { await fn(); await load(); } finally { setBusy(false); } };

  return (
    <ScreenBackground>
      <AppHeader paddingBottom={spacing.md}>
        <View style={styles.titleRow}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}><Text style={styles.back}>←</Text></Pressable>
          <Text style={styles.title} numberOfLines={1}>{project.title}</Text>
        </View>
      </AppHeader>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <View style={styles.headerRow}>
          <StatusBadge status={project.status} />
          <Text style={styles.cat}>{project.category} · {project.difficulty}</Text>
        </View>

        <View style={styles.pills}>
          {[{ k: 'Enrolled', v: project.enrolled }, { k: 'Completion', v: `${project.completion}%` }, { k: 'Rating', v: project.rating || '—' }, { k: 'Steps', v: project.stepCount }].map((p) => (
            <View key={p.k} style={styles.pill}>
              <Text style={styles.pillVal}>{p.v}</Text>
              <Text style={styles.pillKey}>{p.k}</Text>
            </View>
          ))}
        </View>

        {project.description ? <Text style={styles.desc}>{project.description}</Text> : null}

        <SectionHeader title="Steps" icon="📋" />
        {project.steps.map((s) => (
          <View key={s.n} style={styles.stepRow}>
            <Text style={styles.stepNum}>{s.n}</Text>
            <Text style={styles.stepTitle} numberOfLines={1}>{s.title}</Text>
            <Text style={styles.stepXp}>+{s.xp} XP</Text>
          </View>
        ))}

        <View style={styles.cta}>
          <Button mode="contained" buttonColor={colors.teal} textColor={colors.white} onPress={() => navigation.navigate('CreatorEditProject', { projectId })}>Edit Project</Button>
          {project.status === 'draft' ? (
            <Button mode="contained" buttonColor={colors.yellow} textColor={colors.navy} loading={busy} style={{ marginTop: spacing.sm }} onPress={() => doStatus(() => authoringService.submitForReview({ user, projectId }))}>Submit for Review</Button>
          ) : null}
          {project.status === 'review' ? (
            <Button mode="outlined" textColor={colors.white} loading={busy} style={{ marginTop: spacing.sm, borderColor: colors.border }} onPress={() => doStatus(() => authoringService.withdraw({ user, projectId }))}>Withdraw to Draft</Button>
          ) : null}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '700' },
  title: { color: colors.white, fontSize: sizes.textXl, fontWeight: '900', flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  cat: { color: colors.textMuted, fontSize: sizes.textXs },
  pills: { flexDirection: 'row', gap: 8, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  pill: { flex: 1, alignItems: 'center', backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingVertical: spacing.sm },
  pillVal: { color: colors.white, fontSize: sizes.textMd, fontWeight: '900' },
  pillKey: { color: colors.textDim, fontSize: 9, textTransform: 'uppercase', marginTop: 2 },
  desc: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, color: colors.textMuted, fontSize: sizes.textSm, lineHeight: 20 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: spacing.lg, marginBottom: 6, padding: 12, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md },
  stepNum: { color: colors.cyan, fontWeight: '900', fontSize: sizes.textSm, width: 20 },
  stepTitle: { color: colors.white, fontSize: sizes.textSm, fontWeight: '700', flex: 1 },
  stepXp: { color: colors.yellow, fontSize: sizes.textXs, fontWeight: '800' },
  cta: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
});
```

- [ ] **Step 2: Parse-check + commit**

```bash
node scripts/parsecheck.cjs src/screens/creator/CreatorProjectDetailScreen.js
git add src/screens/creator/CreatorProjectDetailScreen.js
git commit -m "feat(creator): add Project Detail screen"
```

### Task 16: `CreatorNewProjectScreen.js` + `CreatorAddStepsScreen.js`

**Files:** Create `src/screens/creator/CreatorNewProjectScreen.js`, `src/screens/creator/CreatorAddStepsScreen.js` (port `ScreensCreator.jsx:424-451` + `353-421`, and AddSteps `1114-1284`)

- [ ] **Step 1: Write `CreatorNewProjectScreen.js`**

```js
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AppHeader } from '../../components/AppHeader';
import { FormTextField } from '../../components/FormTextField';
import { FormSelectField } from '../../components/FormSelectField';
import { useAuth } from '../../context/AuthContext';
import { authoringService } from '../../services/authoringService';
import { colors, spacing, sizes } from '../../theme/tokens';

const CATS = ['Electronics', 'Agriculture', 'Renewable Energy', 'Coding', 'Biology', 'Physics'];
const DIFFS = ['Easy', 'Medium', 'Hard'];
const DURS = ['1–2 hours', '3–5 hours', '1–2 days', '1 week', '2+ weeks'];

export function CreatorNewProjectScreen({ navigation }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ title: '', category: '', difficulty: 'Easy', duration: '3–5 hours', description: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const saveAndAddSteps = async () => {
    if (!form.title.trim() || !form.category) return;
    setBusy(true);
    try {
      const saved = await authoringService.saveProject({ user, project: form, steps: [], submit: false });
      navigation.replace('CreatorAddSteps', { projectId: saved.id });
    } finally { setBusy(false); }
  };

  return (
    <ScreenBackground>
      <AppHeader paddingBottom={spacing.md}>
        <View style={styles.titleRow}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}><Text style={styles.back}>←</Text></Pressable>
          <Text style={styles.title}>New Project</Text>
        </View>
      </AppHeader>

      <ScrollView contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing.xxl }}>
        <Text style={styles.hint}>ℹ️ Steps are added after saving the project metadata.</Text>
        <FormTextField label="Project Title" required value={form.title} onChangeText={set('title')} placeholder="e.g. Solar Phone Charger" />
        <FormSelectField label="Category" required value={form.category} options={CATS} onSelect={set('category')} placeholder="Select category…" />
        <FormSelectField label="Difficulty" value={form.difficulty} options={DIFFS} onSelect={set('difficulty')} />
        <FormSelectField label="Duration" value={form.duration} options={DURS} onSelect={set('duration')} />
        <FormTextField label="Description" value={form.description} onChangeText={set('description')} placeholder="Describe what learners will build…" multiline />
        <View style={styles.cover}>
          <Text style={styles.coverIcon}>🖼️</Text>
          <Text style={styles.coverLabel}>Upload cover image</Text>
          <Text style={styles.coverHint}>PNG / JPG · Max 5MB · 16:9 (coming soon)</Text>
        </View>
        <View style={styles.cta}>
          <Button mode="contained" buttonColor={colors.teal} textColor={colors.white} loading={busy} disabled={!form.title.trim() || !form.category} onPress={saveAndAddSteps}>Save & Add Steps →</Button>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '700' },
  title: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '900' },
  hint: { color: colors.textDim, fontSize: sizes.textXs, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  cover: { marginHorizontal: spacing.lg, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: 12, padding: spacing.xl, backgroundColor: colors.glass },
  coverIcon: { fontSize: 28 },
  coverLabel: { color: colors.textMuted, fontSize: sizes.textSm, marginTop: 6 },
  coverHint: { color: colors.textDim, fontSize: 10, marginTop: 2 },
  cta: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
});
```

- [ ] **Step 2: Write `CreatorAddStepsScreen.js`**

```js
import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AppHeader } from '../../components/AppHeader';
import { StepEditorSheet } from '../../components/StepEditorSheet';
import { useAuth } from '../../context/AuthContext';
import { creatorRepo } from '../../repos';
import { authoringService } from '../../services/authoringService';
import { colors, spacing, sizes, radii } from '../../theme/tokens';

export function CreatorAddStepsScreen({ navigation, route }) {
  const { projectId } = route.params;
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // { index } | null
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const p = await creatorRepo.getMyProjectWithSteps(projectId, user.id);
    setProject(p);
    setSteps(p ? p.steps.map((s) => ({ title: s.title, instruction: s.instruction, materials: s.materials.map((m) => m.name).join(', '), videoUrl: s.videoUrl || '', xp: String(s.xp) })) : []);
    setLoading(false);
  }, [user, projectId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onSaveStep = (draft) => {
    setSteps((prev) => editing.index == null ? [...prev, draft] : prev.map((s, i) => i === editing.index ? draft : s));
    setEditing(null);
  };
  const removeStep = (i) => setSteps((prev) => prev.filter((_, j) => j !== i));

  const persist = async (submit) => {
    setBusy(true);
    try {
      await authoringService.saveProject({ user, project, steps, submit });
      navigation.navigate('CreatorProjectDetail', { projectId });
    } finally { setBusy(false); }
  };

  if (loading || !project) {
    return <ScreenBackground><ActivityIndicator color={colors.cyan} style={{ marginTop: 80 }} /></ScreenBackground>;
  }

  return (
    <ScreenBackground>
      <AppHeader paddingBottom={spacing.md}>
        <View style={styles.titleRow}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}><Text style={styles.back}>←</Text></Pressable>
          <Text style={styles.title}>Add Steps</Text>
        </View>
      </AppHeader>

      <ScrollView contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing.xxl }}>
        <Text style={styles.sub}>{project.title} · {steps.length} steps</Text>
        {steps.map((s, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.num}>{i + 1}</Text>
            <Text style={styles.stepTitle} numberOfLines={1}>{s.title}</Text>
            <Pressable onPress={() => setEditing({ index: i })} hitSlop={8}><Text style={styles.edit}>Edit</Text></Pressable>
            <Pressable onPress={() => removeStep(i)} hitSlop={8}><Text style={styles.del}>🗑️</Text></Pressable>
          </View>
        ))}
        {steps.length === 0 ? <Text style={styles.empty}>No steps yet — add your first one.</Text> : null}

        <Pressable style={styles.add} onPress={() => setEditing({ index: null })}>
          <Text style={styles.addText}>＋ Add new step</Text>
        </Pressable>

        <View style={styles.cta}>
          <Button mode="outlined" textColor={colors.white} style={{ borderColor: colors.border }} loading={busy} onPress={() => persist(false)}>Save Draft</Button>
          <Button mode="contained" buttonColor={colors.yellow} textColor={colors.navy} style={{ marginTop: spacing.sm }} loading={busy} disabled={steps.length === 0} onPress={() => persist(true)}>Submit for Review</Button>
        </View>
      </ScrollView>

      <StepEditorSheet
        visible={editing !== null}
        initial={editing && editing.index != null ? steps[editing.index] : null}
        index={editing ? editing.index : null}
        onSave={onSaveStep}
        onCancel={() => setEditing(null)}
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '700' },
  title: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '900' },
  sub: { color: colors.textMuted, fontSize: sizes.textSm, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: spacing.lg, marginBottom: 6, padding: 12, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md },
  num: { color: colors.cyan, fontWeight: '900', width: 20 },
  stepTitle: { color: colors.white, fontSize: sizes.textSm, fontWeight: '700', flex: 1 },
  edit: { color: colors.cyan, fontSize: sizes.textXs, fontWeight: '800' },
  del: { fontSize: sizes.textSm },
  empty: { color: colors.textDim, textAlign: 'center', marginVertical: spacing.lg, fontSize: sizes.textSm },
  add: { marginHorizontal: spacing.lg, marginTop: 4, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: radii.md },
  addText: { color: colors.cyan, fontSize: sizes.textSm, fontWeight: '800' },
  cta: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
});
```

- [ ] **Step 3: Parse-check + commit**

```bash
node scripts/parsecheck.cjs src/screens/creator/CreatorNewProjectScreen.js src/screens/creator/CreatorAddStepsScreen.js
git add src/screens/creator/CreatorNewProjectScreen.js src/screens/creator/CreatorAddStepsScreen.js
git commit -m "feat(creator): add New Project + Add Steps screens"
```

### Task 17: `CreatorEditProjectScreen.js`

**Files:** Create `src/screens/creator/CreatorEditProjectScreen.js` (port `ScreensCreator.jsx:455-670`)

- [ ] **Step 1: Write the screen**

```js
import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AppHeader } from '../../components/AppHeader';
import { FormTextField } from '../../components/FormTextField';
import { FormSelectField } from '../../components/FormSelectField';
import { StepEditorSheet } from '../../components/StepEditorSheet';
import { useAuth } from '../../context/AuthContext';
import { creatorRepo } from '../../repos';
import { authoringService } from '../../services/authoringService';
import { colors, spacing, sizes, radii } from '../../theme/tokens';

const CATS = ['Electronics', 'Agriculture', 'Renewable Energy', 'Coding', 'Biology', 'Physics'];
const DIFFS = ['Easy', 'Medium', 'Hard'];
const DURS = ['1–2 hours', '3–5 hours', '1–2 days', '1 week', '2+ weeks'];

export function CreatorEditProjectScreen({ navigation, route }) {
  const { projectId } = route.params;
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [form, setForm] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const p = await creatorRepo.getMyProjectWithSteps(projectId, user.id);
    setProject(p);
    setForm(p ? { title: p.title, category: p.category, difficulty: p.difficulty, duration: p.duration || '3–5 hours', description: p.description || '' } : null);
    setSteps(p ? p.steps.map((s) => ({ title: s.title, instruction: s.instruction, materials: s.materials.map((m) => m.name).join(', '), videoUrl: s.videoUrl || '', xp: String(s.xp) })) : []);
    setLoading(false);
  }, [user, projectId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading || !project || !form) {
    return <ScreenBackground><ActivityIndicator color={colors.cyan} style={{ marginTop: 80 }} /></ScreenBackground>;
  }

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const onSaveStep = (draft) => { setSteps((prev) => editing.index == null ? [...prev, draft] : prev.map((s, i) => i === editing.index ? draft : s)); setEditing(null); };
  const removeStep = (i) => setSteps((prev) => prev.filter((_, j) => j !== i));

  const save = async () => {
    setBusy(true);
    try {
      await authoringService.saveProject({ user, project: { ...form, id: project.id, status: project.status, enrolled: project.enrolled, completion: project.completion, rating: project.rating }, steps, submit: false });
      navigation.navigate('CreatorProjectDetail', { projectId });
    } finally { setBusy(false); }
  };

  return (
    <ScreenBackground>
      <AppHeader paddingBottom={spacing.md}>
        <View style={styles.titleRow}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}><Text style={styles.back}>←</Text></Pressable>
          <Text style={styles.title}>Edit Project</Text>
        </View>
      </AppHeader>

      <ScrollView contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing.xxl }}>
        {project.enrolled > 0 ? (
          <View style={styles.warn}>
            <Text style={styles.warnText}>⚠️ This project has {project.enrolled} enrolled learners. Major step changes may affect their progress.</Text>
          </View>
        ) : null}

        <FormTextField label="Project Title" required value={form.title} onChangeText={set('title')} />
        <FormSelectField label="Category" required value={form.category} options={CATS} onSelect={set('category')} />
        <FormSelectField label="Difficulty" value={form.difficulty} options={DIFFS} onSelect={set('difficulty')} />
        <FormSelectField label="Duration" value={form.duration} options={DURS} onSelect={set('duration')} />
        <FormTextField label="Description" value={form.description} onChangeText={set('description')} multiline />

        <View style={styles.stepsHead}>
          <Text style={styles.stepsTitle}>Project Steps ({steps.length})</Text>
        </View>
        {steps.map((s, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.num}>{i + 1}</Text>
            <Text style={styles.stepTitle} numberOfLines={1}>{s.title}{s.videoUrl ? '  📹' : ''}</Text>
            <Pressable onPress={() => setEditing({ index: i })} hitSlop={8}><Text style={styles.edit}>Edit</Text></Pressable>
            <Pressable onPress={() => removeStep(i)} hitSlop={8}><Text style={styles.del}>🗑️</Text></Pressable>
          </View>
        ))}
        <Pressable style={styles.add} onPress={() => setEditing({ index: null })}><Text style={styles.addText}>＋ Add new step</Text></Pressable>

        <View style={styles.cta}>
          <Button mode="contained" buttonColor={colors.teal} textColor={colors.white} loading={busy} onPress={save}>
            {project.status === 'published' ? 'Save & Re-submit →' : 'Save & View Project'}
          </Button>
        </View>
      </ScrollView>

      <StepEditorSheet
        visible={editing !== null}
        initial={editing && editing.index != null ? steps[editing.index] : null}
        index={editing ? editing.index : null}
        onSave={onSaveStep}
        onCancel={() => setEditing(null)}
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '700' },
  title: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '900' },
  warn: { marginHorizontal: spacing.lg, marginBottom: spacing.md, padding: spacing.md, backgroundColor: 'rgba(245,158,11,0.12)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)', borderRadius: radii.md },
  warnText: { color: colors.yellow, fontSize: sizes.textXs, lineHeight: 18 },
  stepsHead: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  stepsTitle: { color: colors.white, fontSize: sizes.textMd, fontWeight: '900' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: spacing.lg, marginBottom: 6, padding: 12, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md },
  num: { color: colors.cyan, fontWeight: '900', width: 20 },
  stepTitle: { color: colors.white, fontSize: sizes.textSm, fontWeight: '700', flex: 1 },
  edit: { color: colors.cyan, fontSize: sizes.textXs, fontWeight: '800' },
  del: { fontSize: sizes.textSm },
  add: { marginHorizontal: spacing.lg, marginTop: 4, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: radii.md },
  addText: { color: colors.cyan, fontSize: sizes.textSm, fontWeight: '800' },
  cta: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
});
```

- [ ] **Step 2: Parse-check + commit**

```bash
node scripts/parsecheck.cjs src/screens/creator/CreatorEditProjectScreen.js
git add src/screens/creator/CreatorEditProjectScreen.js
git commit -m "feat(creator): add Edit Project screen"
```

### Task 18: `CreatorAnalyticsScreen.js`

**Files:** Create `src/screens/creator/CreatorAnalyticsScreen.js` (port `ScreensCreator.jsx:676-855`)

- [ ] **Step 1: Write the screen**

```js
import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AppHeader } from '../../components/AppHeader';
import { StatCard } from '../../components/StatCard';
import { SectionHeader } from '../../components/SectionHeader';
import { AnalyticsBars } from '../../components/AnalyticsBars';
import { useAuth } from '../../context/AuthContext';
import { creatorRepo } from '../../repos';
import { buildAnalytics } from '../../data/creatorStats';
import { colors, spacing, sizes } from '../../theme/tokens';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];

export function CreatorAnalyticsScreen() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setProjects(await creatorRepo.listMyProjects(user.id));
    setLoading(false);
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const a = buildAnalytics(projects);

  return (
    <ScreenBackground>
      <AppHeader paddingBottom={spacing.md}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.sub}>Across your published projects</Text>
      </AppHeader>

      {loading ? (
        <ActivityIndicator color={colors.cyan} style={{ marginTop: spacing.xl }} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing.xxl }}>
          <View style={styles.stats}>
            <StatCard value={a.totalStudents} label="Students" tone="teal" />
            <View style={{ width: spacing.sm }} />
            <StatCard value={`${a.avgCompletion}%`} label="Avg done" tone="yellow" />
            <View style={{ width: spacing.sm }} />
            <StatCard value={a.avgRating || '—'} label="Avg ★" tone="green" />
          </View>

          <SectionHeader title="Weekly Enrolments" icon="📈" />
          <AnalyticsBars bars={a.weeklyBars} labels={DAYS} />

          <SectionHeader title="Top Projects" icon="🔥" />
          {a.topProjects.map((p) => (
            <View key={p.id} style={styles.row}>
              <Text style={styles.rowTitle} numberOfLines={1}>{p.emoji} {p.title}</Text>
              <Text style={styles.rowMeta}>👥 {p.enrolled} · ✅ {p.completion}%</Text>
            </View>
          ))}
          {a.topProjects.length === 0 ? <Text style={styles.empty}>Publish a project to see analytics.</Text> : null}
        </ScrollView>
      )}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '900' },
  sub: { color: colors.textMuted, fontSize: sizes.textXs, marginTop: 2 },
  stats: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: spacing.lg, marginBottom: 6, padding: 12, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: 12 },
  rowTitle: { color: colors.white, fontSize: sizes.textSm, fontWeight: '700', flex: 1, marginRight: 8 },
  rowMeta: { color: colors.textMuted, fontSize: sizes.textXs, fontWeight: '700' },
  empty: { color: colors.textDim, textAlign: 'center', marginTop: spacing.lg, fontSize: sizes.textSm },
});
```

- [ ] **Step 2: Parse-check + commit**

```bash
node scripts/parsecheck.cjs src/screens/creator/CreatorAnalyticsScreen.js
git add src/screens/creator/CreatorAnalyticsScreen.js
git commit -m "feat(creator): add Analytics screen"
```

### Task 19: `CreatorProfileScreen.js`

**Files:** Create `src/screens/creator/CreatorProfileScreen.js` (port `ScreensCreator.jsx:855-953`, view-only)

- [ ] **Step 1: Write the screen**

```js
import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AppHeader } from '../../components/AppHeader';
import { StatCard } from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import { creatorRepo } from '../../repos';
import { buildAnalytics } from '../../data/creatorStats';
import { colors, spacing, sizes, radii, avatarColor, initials } from '../../theme/tokens';

export function CreatorProfileScreen() {
  const { user, signOut } = useAuth();
  const [projects, setProjects] = useState([]);

  const load = useCallback(async () => {
    if (!user) return;
    setProjects(await creatorRepo.listMyProjects(user.id));
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!user) return <ScreenBackground />;
  const stats = buildAnalytics(projects);

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <AppHeader paddingBottom={spacing.xl}>
          <Text style={styles.title}>Profile</Text>
        </AppHeader>

        <View style={styles.card}>
          <View style={[styles.avatar, { backgroundColor: avatarColor(user.id) }]}>
            <Text style={styles.avatarText}>{initials(user.fullName)}</Text>
          </View>
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.role}>{user.roleLabel} · {user.publicId}</Text>
          {user.organization ? <Text style={styles.meta}>🏢 {user.organization}</Text> : null}
          {user.expertise ? <Text style={styles.meta}>🎓 {user.expertise}</Text> : null}
          {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
        </View>

        <View style={styles.stats}>
          <StatCard value={projects.length} label="Projects" tone="teal" />
          <View style={{ width: spacing.sm }} />
          <StatCard value={stats.totalStudents} label="Students" tone="yellow" />
          <View style={{ width: spacing.sm }} />
          <StatCard value={stats.avgRating || '—'} label="Avg ★" tone="green" />
        </View>

        <View style={styles.cta}>
          <Button mode="outlined" textColor={colors.white} style={{ borderColor: colors.border }} onPress={signOut}>Sign out</Button>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '900' },
  card: { alignItems: 'center', marginHorizontal: spacing.lg, marginTop: -spacing.xl + 4, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: spacing.lg },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  avatarText: { color: colors.navy, fontSize: sizes.textXl, fontWeight: '900' },
  name: { color: colors.white, fontSize: sizes.textXl, fontWeight: '900' },
  role: { color: colors.cyan, fontSize: sizes.textXs, fontWeight: '700', marginTop: 2 },
  meta: { color: colors.textMuted, fontSize: sizes.textSm, marginTop: 6 },
  bio: { color: colors.textMuted, fontSize: sizes.textSm, marginTop: spacing.sm, textAlign: 'center', lineHeight: 19 },
  stats: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  cta: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
});
```

- [ ] **Step 2: Parse-check + commit**

```bash
node scripts/parsecheck.cjs src/screens/creator/CreatorProfileScreen.js
git add src/screens/creator/CreatorProfileScreen.js
git commit -m "feat(creator): add Profile screen (view-only)"
```

---

## Phase G — Navigation + docs

### Task 20: `CreatorStack.js` + wire navigation

**Files:** Create `src/navigation/CreatorStack.js`; Modify `src/navigation/CreatorTabs.js`, `src/navigation/RootNavigator.js`

- [ ] **Step 1: Create `src/navigation/CreatorStack.js`**

```js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CreatorTabs } from './CreatorTabs';
import { CreatorProjectDetailScreen } from '../screens/creator/CreatorProjectDetailScreen';
import { CreatorNewProjectScreen } from '../screens/creator/CreatorNewProjectScreen';
import { CreatorAddStepsScreen } from '../screens/creator/CreatorAddStepsScreen';
import { CreatorEditProjectScreen } from '../screens/creator/CreatorEditProjectScreen';

const Stack = createNativeStackNavigator();

export function CreatorStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <Stack.Screen name="Tabs" component={CreatorTabs} />
      <Stack.Screen name="CreatorProjectDetail" component={CreatorProjectDetailScreen} />
      <Stack.Screen name="CreatorNewProject" component={CreatorNewProjectScreen} />
      <Stack.Screen name="CreatorAddSteps" component={CreatorAddStepsScreen} />
      <Stack.Screen name="CreatorEditProject" component={CreatorEditProjectScreen} />
    </Stack.Navigator>
  );
}
```

- [ ] **Step 2: Wire real tabs in `src/navigation/CreatorTabs.js`**

Add imports:
```js
import { CreatorDashboardScreen } from '../screens/creator/CreatorDashboardScreen';
import { CreatorProjectsScreen } from '../screens/creator/CreatorProjectsScreen';
import { CreatorAnalyticsScreen } from '../screens/creator/CreatorAnalyticsScreen';
import { CreatorProfileScreen } from '../screens/creator/CreatorProfileScreen';
```
Change the four `<Tab.Screen ... component={PlaceholderScreen} />` lines to:
```js
      <Tab.Screen name="Dashboard" component={CreatorDashboardScreen} />
      <Tab.Screen name="Projects" component={CreatorProjectsScreen} />
      <Tab.Screen name="Analytics" component={CreatorAnalyticsScreen} />
      <Tab.Screen name="Profile" component={CreatorProfileScreen} />
```
Remove the now-unused `PlaceholderScreen` import from `CreatorTabs.js`.

- [ ] **Step 3: Route creators to `CreatorStack` in `src/navigation/RootNavigator.js`**

Add import: `import { CreatorStack } from './CreatorStack';`
In `RoleRouter`, change:
```js
  if (user.isCreator && user.isCreator()) return <CreatorTabs />;
```
to:
```js
  if (user.isCreator && user.isCreator()) return <CreatorStack />;
```
Remove the now-unused `CreatorTabs` import from `RootNavigator.js` (confirm with `grep -n CreatorTabs src/navigation/RootNavigator.js` → empty).

- [ ] **Step 4: Parse-check + commit**

```bash
node scripts/parsecheck.cjs src/navigation/CreatorStack.js src/navigation/CreatorTabs.js src/navigation/RootNavigator.js
git add src/navigation/CreatorStack.js src/navigation/CreatorTabs.js src/navigation/RootNavigator.js
git commit -m "feat(nav): mount creator stack (Dashboard/Projects/Detail/New/Edit/AddSteps)"
```

### Task 21: README Day 4 run order

**Files:** Modify `supabase/README.md`

- [ ] **Step 1: Append a Day 4 section** documenting that `schema_day4.sql` is run after `schema_day3.sql` (and seed) to enable creators to author/manage their own projects + steps. Note no new tables/seed are required; creators author their own content.

- [ ] **Step 2: Commit**

```bash
git add supabase/README.md
git commit -m "docs(db): document Day 4 schema run order"
```

---

## Phase H — Final verification + review + QA

### Task 22: Full test + parse-check sweep

**Files:** none (verification)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: `✓ OOP model: 22/22`, `✓ Auth: 11/11`, `✓ Data: 27/27`, exit 0.

- [ ] **Step 2: Parse-check every new/changed JS file**

Run:
```bash
node scripts/parsecheck.cjs src/data/categoryMeta.js src/data/creatorStats.js src/data/seedData.js src/data/localStore.js src/data/__datatest.js src/repos/creatorRepo.js src/repos/index.js src/services/authoringService.js src/components/StatusBadge.js src/components/CreatorProjectCard.js src/components/FormTextField.js src/components/FormSelectField.js src/components/StepEditorSheet.js src/components/AnalyticsBars.js src/screens/creator/*.js src/navigation/CreatorStack.js src/navigation/CreatorTabs.js src/navigation/RootNavigator.js
```
Expected: all `OK`, exit 0.

- [ ] **Step 3: Import-resolution check** — this is verified definitively by the offline web bundle in Task 24 (Metro fails the build on any unresolved import). No separate node script needed.

### Task 23: Final code review

**Files:** none (review)

- [ ] **Step 1: Dispatch a code reviewer** over `git diff <day3-final-sha>..HEAD -- src supabase` against this plan + the spec. Focus: dual-mode write-through correctness in `creatorRepo` (id assignment for new projects, full-replace steps, offline cache-wins), `authoringService` status transitions, screen↔repo wiring (id params, `useFocusEffect`), SQL RLS correctness. Fix any Critical/High findings (TDD where logic), re-run `npm test`.

### Task 24: Offline web-bundle browser QA

**Files:** none (QA) — see memory `offline-web-qa`

- [ ] **Step 1: Build a truly-offline web bundle**

```bash
mv .env .env.qabak && npx expo export --platform web --clear --output-dir /tmp/smib-day4 ; mv .env.qabak .env
```
Confirm `.env` restored (`ls .env`).

- [ ] **Step 2: Serve + drive with gstack as a creator**

Serve `/tmp/smib-day4` on a port; in gstack `goto` it, then inject a **creator** session:
```
storage set smib.local.user '{"id":"demo-creator-1","email":"ahmad@smib.app","display_name":"Ahmad Khalil","role":"creator","public_id":"CRT-0001","organization":"SMK Bandar Kuching","expertise":"Electronics","rating":4.9}'
```
reload. Verify: Dashboard (project/student/rating tiles + recent), Projects (status tabs filter; draft/review/published all present), Project Detail (status badge, stat pills, steps, Submit/Withdraw), New Project (form → Save & Add Steps), Add Steps (StepEditorSheet add/edit/delete, Submit), Edit Project (warning banner on enrolled project, Save & Re-submit on a published one), Analytics (tiles + bars + top projects), Profile (view-only + sign out). Screenshot each; check `console --errors` (only the benign `useNativeDriver` web warning is acceptable).

- [ ] **Step 3: Report** screenshots + any issues. Fix, re-verify, commit if needed.

---

## Self-Review (completed by plan author)

**Spec coverage:** schema_day4 RLS (Task 1) ✓ · SEED_CREATOR_PROJECTS + placeholderSteps export (Task 2) ✓ · creator localStore keys (Task 3) ✓ · categoryMeta (Task 4) ✓ · creatorStats (Task 5) ✓ · creatorRepo dual-mode write-through + full-replace + getMyProjectWithSteps (Task 6) ✓ · authoringService status lifecycle (Task 7) ✓ · components StatusBadge/CreatorProjectCard/FormTextField/FormSelectField/StepEditorSheet/AnalyticsBars (Tasks 8–12) ✓ · 8 screens (Tasks 13–19) ✓ · CreatorStack + tabs + RootNavigator (Task 20) ✓ · README (Task 21) ✓ · tests in data suite (Tasks 4–7) ✓ · verification/review/QA (Tasks 22–24) ✓. Deferred items (cover upload, tags, profile edit, OpenProject, review-queue) are intentionally absent.

**Placeholder scan:** No TBD/TODO; every code step shows complete code. The cover-image zone text "(coming soon)" is a user-facing label, not a deferred task.

**Type consistency:** `creatorRepo` exposes `listMyProjects`, `getMyProjectWithSteps(id, creatorId)`, `saveProject({projectRow, stepRows})`, `setStatus(id, status, creatorId)`, `deleteProject(id, creatorId)` — used with those exact shapes by screens and `authoringService`. `authoringService.saveProject({user, project, steps, submit})` / `submitForReview({user, projectId})` / `withdraw({user, projectId})` match all call sites. `buildAnalytics(projects)` returns `{totalStudents, avgCompletion, avgRating, ratedCount, topProjects, weeklyBars}` consumed by Dashboard/Analytics/Profile. `categoryMeta(category) → {emoji,color}` used by `authoringService`. Component props (`StatusBadge{status}`, `CreatorProjectCard{project,onPress}`, `FormTextField{label,value,onChangeText,...}`, `FormSelectField{label,value,options,onSelect}`, `StepEditorSheet{visible,initial,index,onSave,onCancel}`, `AnalyticsBars{bars,labels}`) match their usages.

**Known deviation:** none beyond the spec's stated deferrals. New-project ids come from `insert().select().single()` (online) or a `localStore` counter ≥1000 (offline), matching the spec.
