# Day 4 — Creator Authoring Flow (Dashboard, Projects, Detail, New/Edit/Add-Steps, Profile, Analytics)

- **Date:** 2026-05-21
- **Status:** Approved (design)
- **Scope owner:** Day 4 of the S-MIB build
- **Prototype reference:** `.design-extracted/smib-app design/ScreensCreator.jsx` (screens 21–28), `App.jsx` (`CREATOR_PROJECTS` at lines 100–112), `styles.css`
- **Builds on:** Day 3 (`docs/superpowers/specs/2026-05-20-day3-learner-screens-design.md`) — reuses the dual-mode data layer, models, shared components, and the immersive-stack navigation pattern.

## 1. Goal & scope

Build the creator-facing authoring flow: eight screens plus the creator **write** data layer (Day 3
was read-only), creator-write RLS, offline creator seed, and pure-logic tests. Reuse existing domain
models — `Creator.intendedPublishStatus()`, `VerifiedCreator.canPublishDirectly()`, and
`ContentMentor.reviewSubmission()` already model the lifecycle. **No model rewrites.**

### In scope
- Screens: `CreatorDashboardScreen`, `CreatorProjectsScreen`, `CreatorProjectDetailScreen`,
  `CreatorNewProjectScreen`, `CreatorAddStepsScreen`, `CreatorEditProjectScreen`,
  `CreatorAnalyticsScreen`, `CreatorProfileScreen` (view-only).
- Data layer: `creatorRepo` (dual-mode writes), `authoringService` (save + status lifecycle),
  `creatorStats` (pure analytics aggregation), `SEED_CREATOR_PROJECTS`.
- `schema_day4.sql` — creator-write RLS on `projects` and `steps` (no new tables).
- Navigation: `CreatorStack` above `CreatorTabs`; all four creator tabs become real screens.
- Reusable form/authoring components.
- Tests: extend the `data` suite.

### Out of scope (deferred)
Cover-image upload (placeholder zone only), tags (no schema column), Creator Profile **editing**
(separate prototype screen), Content-Mentor review queue of *other* creators' submissions, OpenProject
authoring (creator projects default `type='guided'`), real enrolment time-series, recomputing
`enrolled`/`completion`/`rating` from learner activity (those stay as seeded/zero), Creator
Notifications / Guidelines / Submission-Status screens.

## 2. Architecture

```
RoleRouter(creator) → CreatorStack (native stack, headerShown:false)
   ├─ Tabs (= CreatorTabs: Dashboard · Projects · Analytics · Profile — all real)
   ├─ CreatorProjectDetail   (params: { projectId })
   ├─ CreatorNewProject      (params: none)
   ├─ CreatorAddSteps        (params: { projectId })
   └─ CreatorEditProject     (params: { projectId })

Screens ─▶ creatorRepo (dual-mode, write-through/LWW)  ─▶ Supabase / offline seed
        ─▶ authoringService.saveProject(...)            (status via Creator model)
        ─▶ creatorStats.buildAnalytics(projects)        (pure)
```

- **Dual-mode** mirrors Day 3: local AsyncStorage write is optimistic + authoritative; Supabase write
  fires after (errors logged, swallowed — LWW). Repos take injectable `{ store, db, configured }`.
- **Online creators start empty** and author real projects; **offline mode** shows
  `SEED_CREATOR_PROJECTS` owned by the demo creator (a base `Creator`, so the submit→review flow shows).

## 3. Data layer

### `src/repos/creatorRepo.js`
- `listMyProjects(creatorId)` → `Project[]` (all statuses). Online: `db.from('projects').select('*')
  .eq('creator_id', creatorId).order('id')`. Offline: `SEED_CREATOR_PROJECTS` mapped via
  `Project.fromRow`.
- `saveProject({ projectRow, stepRows })` → returns the saved `Project` (with id):
  1. **Project upsert.** If `projectRow.id == null` (new): online `db.from('projects').insert(rowNoId)
     .select().single()` to obtain the generated bigint id; offline assign an id from a `localStore`
     counter (`smib.creator.nextid`, starts at 1000 to avoid seed collisions). If id present: upsert
     `onConflict: 'id'`.
  2. **Full-replace steps.** `db.from('steps').delete().eq('project_id', id)` then insert `stepRows`
     re-numbered `step_n = 1..N`. Offline: write the step list to `localStore` (`smib.creator.steps.<id>`).
  3. Write-through: the project row and steps are written to the local creator cache
     (`smib.creator.projects` map keyed by id) first; Supabase ops fire after.
- `setStatus(projectId, status)` → update `projects.status` (write-through).
- `deleteProject(projectId)` → delete project (steps cascade) + remove from local cache.
- `getMyProjectWithSteps(id)` → `Project` with steps, used by the detail/edit/add-steps screens (NOT
  Day 3's `projectRepo.getProjectWithSteps`, which is offline-blind to creator projects). Online: the
  same project + steps queries as Day 3 (Day 3 RLS lets a creator read their own non-published rows).
  Offline: the local creator cache → `SEED_CREATOR_PROJECTS` (steps from the cache → `SEED_STEPS[id]` if
  present, else generated placeholders by `step_count`).

### `src/services/authoringService.js`
- `saveProject({ user, project, steps, submit })`:
  - Build `projectRow` from `project` (a `Project` instance or plain data): `creator_id = user.id`,
    `creator_name = user.fullName`, `emoji`/`color` derived from category (see §7), `type = 'guided'`,
    `step_count = steps.length`, `enrolled/completion/rating` preserved or 0 for new.
  - Compute next status:
    - `submit === true` → `user.intendedPublishStatus()` (`'review'` base, `'published'` verified).
    - else if the project was `published` → `'review'` (base) / `'published'` (verified) [re-review].
    - else → `'draft'`.
  - `stepRows` built from each step: `{ title, instruction, tip, materials, xp, video_url,
    proof_required }` (materials parsed from comma-separated input into `[{name}]`).
  - Calls `creatorRepo.saveProject({ projectRow, stepRows })`; returns the saved `Project`.
- `submitForReview({ user, projectId })` → `creatorRepo.setStatus(projectId, user.intendedPublishStatus())`.
- `withdraw({ projectId })` → `creatorRepo.setStatus(projectId, 'draft')`.

### `src/data/creatorStats.js` (pure)
`buildAnalytics(projects)` → `{ totalStudents, avgCompletion, avgRating, ratedCount, topProjects,
weeklyBars }`:
- `published = projects.filter(isPublished)`; `totalStudents = Σ enrolled`;
  `avgCompletion = round(Σ completion / published.length)`.
- `avgRating` = average of `rating` over published with `rating > 0`, 1-dp, or `null` if none.
- `topProjects` = published sorted by `enrolled` desc, top 4.
- `weeklyBars` = 7 proportional heights derived from `totalStudents` (clearly-mock; comment says real
  time-series is deferred).

## 4. `schema_day4.sql` (creator-write RLS, no new tables)

Day 3 enabled RLS + read policies (`projects_read` allows `status='published' or creator_id=auth.uid()`;
`steps_read` mirrors it). Day 4 adds write policies:

```sql
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

## 5. Status lifecycle (full-replace step caveat)

- New project: created `draft` (via "Save & Add Steps").
- Submit: `draft → review` (base Creator) or `draft → published` (Verified) via
  `intendedPublishStatus()`.
- Edit a `published` project + save: `→ review` (base) / stays `published` (Verified) — the Edit screen's
  primary CTA reads "Save & Re-submit" when currently published.
- Withdraw (from detail): `review → draft`.
- **Full-replace caveat:** saving steps deletes and re-inserts them renumbered `1..N`. For a project with
  enrolled learners this can desync their `completed_step_numbers`. The Edit screen shows the prototype's
  "⚠️ N enrolled students" warning banner. Accepted for MVP; diff-merge is the future upgrade.

## 6. Screens & navigation

`CreatorTabs` (all real): Dashboard, Projects, Analytics, Profile. `CreatorStack` wraps the tabs and adds
the pushed authoring screens. Screens load by id from repos and refresh on focus (`useFocusEffect`).
Params carry ids only.

- **CreatorDashboardScreen** — header (greeting, CRT id), stat tiles (total projects, total students,
  avg rating), "+ New Project" action, recent projects (`CreatorProjectCard`), link to Analytics.
- **CreatorProjectsScreen** — status filter tabs (All / Published / In Review / Draft) with counts,
  `CreatorProjectCard` list, "+ New Project".
- **CreatorProjectDetailScreen** — header + `StatusBadge`, stat pills (enrolled/completion/rating),
  read-only step list, CTAs: Edit, Submit for review (draft) / Withdraw (review) / Edit (published).
- **CreatorNewProjectScreen** — `ProjectFormFields` (title/category/difficulty/duration/description;
  cover placeholder; no tags) → "Save & Add Steps" calls `authoringService.saveProject({submit:false})`
  to create the draft, then pushes `AddSteps` with the new id.
- **CreatorAddStepsScreen** — step builder (`StepEditorSheet` add/edit/delete; empty-state prompt),
  then "Save Draft" or "Submit for Review" → `authoringService.saveProject({ submit })` → detail.
- **CreatorEditProjectScreen** — metadata form + inline step list editor (shared `StepEditorSheet`) +
  enrolled-warning banner; Save → `authoringService.saveProject` (re-review if published).
- **CreatorAnalyticsScreen** — time-filter tabs (visual only), stat tiles, `AnalyticsBars` weekly chart,
  top projects, recent activity — all from `creatorStats.buildAnalytics(myProjects)`.
- **CreatorProfileScreen** — view-only: avatar, name, CRT id, organization/expertise/bio, rating,
  totals (projects/students), sign out. No editing.

## 7. Components

New (`src/components/`): `CreatorProjectCard` (thumb, title, status badge, enrolled/completion/rating
meta), `StatusBadge` (draft/review/published/rejected colors), `FormTextField` (label + TextInput),
`FormSelectField` (label + dropdown; react-native-paper Menu or a simple modal list), `StepEditorSheet`
(modal: title*, instructions, materials csv, video URL, XP number), `AnalyticsBars` (mini weekly bar
chart). Reuse `AppHeader`, `SectionHeader`, `StatCard`, `DifficultyPill`, `ScreenBackground`.

Category → emoji/color derivation (`src/theme/tokens.js` helper or inline map): Electronics → ⚡/teal-img,
Agriculture → 🌱/green-img, Renewable → ♻️/green-img, Coding → 🤖/purple-img, Biology → 🔬/green-img,
Physics → 📡/amber-img; default → 🛠️/teal-img.

## 8. Offline creator seed

`SEED_CREATOR_PROJECTS` in `seedData.js` mirrors `CREATOR_PROJECTS` (11 rows, mixed
`draft`/`review`/`published`, enrolled/completion/rating, `step_count`), each with `creator_id` = the
offline demo creator id and `creator_name` set. `creatorRepo` offline: `listMyProjects` → these
(regardless of id, offline = single demo creator); `getMyProjectWithSteps` → cache → seed (+ steps from
`SEED_STEPS[id]` or generated placeholders); `saveProject`/`setStatus`/`deleteProject` → `localStore`
overlay (cache-wins) so authored/edited projects persist in the demo.

## 9. Testing

Extend `src/data/__datatest.js` (`runDataSmokeTest`) with fake `store`/`db`:
- `creatorRepo.listMyProjects` offline returns the 11 seed projects.
- `creatorRepo.saveProject` for a **new** project: assigns an id, writes the local cache, fires the
  project insert and step inserts; for an **existing** project: full-replaces steps (a `delete` then
  `insert` on `steps`).
- `creatorRepo.setStatus` updates status (cache + update call).
- `authoringService.saveProject` status transitions: new+`submit:false` → `draft`; base Creator +
  `submit:true` → `review`; VerifiedCreator + `submit:true` → `published`; edit published → `review`.
- `creatorStats.buildAnalytics`: totalStudents/avgCompletion correct; avgRating ignores unrated and is
  `null` when none; topProjects sorted/limited.

Keep existing suites green (model 22, auth 11, data 16 → ~28). Screens verified by
`node scripts/parsecheck.cjs` + offline web-bundle browser QA (see memory: offline-web-qa).

## 10. File manifest

**New**
- `supabase/schema_day4.sql`
- `src/repos/creatorRepo.js`
- `src/services/authoringService.js`
- `src/data/creatorStats.js`
- `src/navigation/CreatorStack.js`
- `src/components/CreatorProjectCard.js`, `StatusBadge.js`, `FormTextField.js`, `FormSelectField.js`, `StepEditorSheet.js`, `AnalyticsBars.js`
- `src/screens/creator/CreatorDashboardScreen.js`, `CreatorProjectsScreen.js`, `CreatorProjectDetailScreen.js`, `CreatorNewProjectScreen.js`, `CreatorAddStepsScreen.js`, `CreatorEditProjectScreen.js`, `CreatorAnalyticsScreen.js`, `CreatorProfileScreen.js`

**Modified**
- `src/data/seedData.js` (`SEED_CREATOR_PROJECTS`)
- `src/repos/index.js` (export `creatorRepo`)
- `src/navigation/CreatorTabs.js` (real screens), `src/navigation/RootNavigator.js` (creator → `CreatorStack`)
- `src/data/__datatest.js` (creator tests)
- `supabase/README.md` (Day 4 run order)

## 11. Resolved decisions
- Cover image deferred (placeholder); tags dropped (no column); Creator Profile view-only.
- Analytics aggregates from the creator's project rows + mock weekly trend.
- Step persistence = full replace (delete + re-insert), enrolled-warning banner only.
- Demo creator = base `Creator` (review flow); Verified-publish implemented in the model.
- New project ids: online via `insert().select().single()`; offline via a `localStore` counter (≥1000).
- Creator projects default `type='guided'`; emoji/color derived from category.
