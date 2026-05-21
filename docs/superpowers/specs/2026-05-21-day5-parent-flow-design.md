# Day 5 — Parent Flow + Shared Screens (Dashboard, Child Progress, Project View, Activity, Profile, Link Child, Notifications + Settings/ProfileSettings/Language/NotifPrefs)

- **Date:** 2026-05-21
- **Status:** Approved (design)
- **Scope owner:** Day 5 of the S-MIB build
- **Prototype reference:** `.design-extracted/smib-app design/ScreensParent.jsx` (screens 26–29 + Link/ProjectView/ProfileSettings/Notifications), `SharedExtras.jsx` (Settings/Language/ProfileSettings + legal/support), `ScreensLearner.jsx` (`ScreenNotificationPreferences`, line 1577), `App.jsx` (`CHILDREN` 114, `PARENT_NOTIFS` 130, `ACTIVITY_FEED` 141; `CREATORS` lives in `SharedExtras.jsx`).
- **Builds on:** Day 3 (`…day3-learner-screens-design.md`) and Day 4 (`…day4-creator-flow-design.md`) — reuses the dual-mode data layer, the immersive-stack navigation pattern, shared components, and the `__datatest` harness.

## 1. Goal & scope

Build the parent-facing flow plus the remaining cross-role shared screens. Reuse the existing
`Parent` model (`linkChild`/`unlinkChild`/`linkedChildIds`, `prnId`, `phone`, `icNumber`) — **no model
rewrites**.

### In scope
- **Parent screens (7):** `ParentDashboardScreen` (Home tab), `ParentChildProgressScreen`,
  `ParentChildProjectViewScreen` (read-only), `ParentActivityScreen` (Activity tab),
  `ParentProfileScreen` (Profile tab), `ParentLinkChildScreen`, `ParentNotificationsScreen`.
- **Shared screens (4 named + hub + 5 stubs):** `SettingsScreen` (hub), `ProfileSettingsScreen`
  (role-aware), `LanguageScreen`, `NotifPrefsScreen`, and one reusable `InfoScreen` registered under 5
  legal/support route names (`PrivacySecurity`, `Terms`, `PrivacyPolicy`, `HelpCentre`,
  `ContactSupport`).
- **Data layer:** `parentRepo` (children list + real link lookup + link write), `parentStats` (pure),
  `parentActivity` (pure), and seed (`SEED_CHILDREN`, `SEED_PARENT_ACTIVITY`, `SEED_PARENT_NOTIFS`,
  `SEED_CREATORS`).
- **`schema_day5.sql`** — one `find_learner_by_public_id(text)` RPC (no table changes).
- **Navigation:** `ParentStack` above `ParentTabs` (all three parent tabs become real); a
  `getSharedScreens(Stack)` helper spread into Parent, Learner, and Creator stacks.
- **Tests:** extend the `data` suite.

### Out of scope (deferred)
Reading children's **live** progress online (RLS-gated cross-user reads); creator/learner profile-photo
upload (placeholder camera button only); legal/support page real content (stubs only); push/email
notification delivery (preferences are stored, not wired to a provider); unlinking a child from the UI
(model supports it; no screen yet); the AI-chat / leaderboard links from notifications (parent
notifications only deep-link to Child Progress).

## 2. Data strategy (decision: seed + real link lookup)

The prototype mocks all parent data, and current RLS is strictly owner-scoped (`progress_rw` →
`user_id = auth.uid()`; `profiles_select_own` → `auth.uid() = id`). Honoring the approved choice:

- **Children, stats, activity, notifications come from offline seed** — fully demoable offline, which is
  how the APK demo runs (see memory: offline-web-qa). `parentRepo.listChildren` returns `SEED_CHILDREN`
  overlaid with any **locally-linked** children (persisted in `localStore`).
- **Link Child performs a real online lookup.** Because `profiles_select_own` blocks reading another
  user's row, `schema_day5.sql` adds a single `find_learner_by_public_id(text)` **SECURITY DEFINER** RPC
  that returns only safe columns (`id, display_name, school_name, grade, level, public_id`) and only for
  learner roles. Writing the new id into `linked_child_ids` uses the existing `profiles_update_own`
  policy (the parent updates their **own** row). **No cross-user progress RLS is added** — the riskiest
  surface is intentionally avoided for the Day 6/7 runway.
- **Offline**, the link step matches the entered LRN id against `SEED_CHILDREN` (demo id `LRN-4821`).

## 3. Architecture

```
RoleRouter(parent) → ParentStack (native stack, headerShown:false)
   ├─ Tabs (= ParentTabs: Home · Activity · Profile — all real)
   ├─ ParentChildProgress     (params: { child })
   ├─ ParentChildProjectView  (params: { child, project })
   ├─ ParentLinkChild         (params: none)
   ├─ ParentNotifications      (params: none)
   └─ [shared] Settings · ProfileSettings · Language · NotifPrefs · Info×5

Screens ─▶ parentRepo.listChildren(parent)            (seed + local-link overlay)
        ─▶ parentRepo.lookupChildByPublicId(id)        (online RPC / offline seed)
        ─▶ parentRepo.linkChild(parent, child)         (write-through: setLocalUser + profiles.update)
        ─▶ parentStats.aggregate(children)             (pure)
        ─▶ parentActivity.filterAndGroup(feed, child)  (pure)
```

- **Dual-mode** mirrors Days 3–4: repos take injectable `{ store, db, configured }`; local write is
  optimistic + authoritative, Supabase write fires after (errors logged, swallowed — LWW).
- Shared screens are registered once via `getSharedScreens(Stack)` and spread into each role stack so
  every flow's Settings/Profile links resolve (additive route registration — low risk).

## 4. Data layer

### `src/repos/parentRepo.js`
- `listChildren(parent)` → `Child[]` (plain seed objects, see §6). Reads `SEED_CHILDREN`, then overlays
  any locally-linked children stored at `keys.parentLinks(parent.id)` (deduped by `id`). Online and
  offline return the same seed-backed list (live online reads deferred).
- `lookupChildByPublicId(publicId)` → `{ found, child? , error? }`:
  - Normalizes/validates the `LRN-####` shape; returns `{ found:false, error }` if malformed.
  - **Online:** `db.rpc('find_learner_by_public_id', { p_public_id })` → maps the row to a `Child` view
    shape; `{ found:false }` if no row.
  - **Offline:** matches `SEED_CHILDREN` by `publicId` (case-insensitive). Demo: `LRN-4821`.
- `linkChild(parent, child)` → updated `Parent`:
  1. `parent.linkChild(child.id)` (model dedupes); persist the child view to `keys.parentLinks(parent.id)`.
  2. Write-through: `setLocalUser(parent)` is the screen's job; the repo writes the local link cache and,
     online, `db.from('profiles').update({ linked_child_ids }).eq('id', parent.id)` (errors warned).
  3. Returns the parent (with the new id) for the screen to push into `setLocalUser`.

### `src/data/parentStats.js` (pure)
`aggregate(children)` → `{ totalActive, totalDone, totalBadges }` = sums of `active_proj`, `done_proj`,
`badges`. Empty list → all zeros.

### `src/data/parentActivity.js` (pure)
- `childTabs(feed)` → `['All', ...uniqueChildNames]`.
- `filterAndGroup(feed, childFilter)` → `[{ group, items[] }]` preserving feed order, filtered by child
  (prefix match, mirroring the prototype) and grouped by `group` (`Today`/`Yesterday`/`This Week`).

### `src/data/seedData.js` (additions)
- `SEED_CHILDREN` — 2 children mirroring `App.jsx` `CHILDREN` (id, name, `public_id`, grade, school,
  level, rank, xp, xpMax, active, lastSeen, init, color, active_proj, done_proj, badges, streak, goal,
  goalDate). Demo child #1 carries `public_id:'LRN-4821'`.
- `SEED_PARENT_ACTIVITY` — mirrors `ACTIVITY_FEED` (child, init, color, icon, type, title, sub, time,
  group, unread).
- `SEED_PARENT_NOTIFS` — mirrors `PARENT_NOTIFS` (type, icon, bg, title, sub, time, unread, group).
- `SEED_CREATORS` — registry keyed by creator full name (init, color, role, org, bio, projects,
  students, rating, badges, id) for the view-creator modal.

### `src/data/localStore.js` (keys)
Add `lang: 'smib.lang'`, `notifPrefs: (userId) => 'smib.notifprefs.'+userId`,
`parentLinks: (userId) => 'smib.parent.links.'+userId`.

## 5. `schema_day5.sql` (one RPC, no table changes)

```sql
-- Safe, narrow lookup so a parent can find a learner by their public LRN id
-- without a broad profiles read policy. SECURITY DEFINER bypasses RLS but
-- returns only non-sensitive columns and only for learner roles.
create or replace function public.find_learner_by_public_id(p_public_id text)
returns table (id uuid, display_name text, school_name text, grade text, level integer, public_id text)
language sql
security definer
set search_path = public
as $$
  select p.id, p.display_name, p.school_name, p.grade, p.level, p.public_id
  from public.profiles p
  where p.public_id = upper(trim(p_public_id))
    and p.role in ('junior_learner','senior_learner')
  limit 1;
$$;

revoke all on function public.find_learner_by_public_id(text) from public;
grant execute on function public.find_learner_by_public_id(text) to authenticated;
```

`linked_child_ids` already exists (schema.sql) and `profiles_update_own` already permits the parent to
write it — no new write policy needed.

## 6. Children as plain view objects (no `Child` model)

Children are a denormalized demo concept with **no DB table**, so no `Child` model / `fromRow` is added
(YAGNI, consistent with the prototype). `parentRepo` returns plain objects shaped like `SEED_CHILDREN`
rows; screens read them directly. `lookupChildByPublicId` maps an RPC row into the same shape (with
seed-style defaults for fields the RPC doesn't expose: `active_proj`/`done_proj`/`badges`/`streak` → 0,
`xpMax` derived from level).

## 7. Screens & navigation

`ParentTabs` (all real): Home, Activity, Profile. `ParentStack` wraps the tabs and adds the pushed
screens + shared screens. Tab screens refresh on focus (`useFocusEffect`); params carry the selected
`child`/`project` object (small, denormalized — no id round-trip needed for seed data).

- **ParentDashboardScreen** — header (greeting "Welcome back, <name>", linked-children pill), aggregate
  stat tiles (Active / Completed / Badges from `parentStats.aggregate`), `ChildCard` list (tap → Child
  Progress), "+ Link Another Child" (→ ParentLinkChild), bell (→ ParentNotifications), avatar (→
  Profile tab).
- **ParentChildProgressScreen** — `ChildHeader` (avatar, level, rank, XP bar), 4 stat tiles
  (Active/Done/Badges/Streak), `GoalCard`, Active Projects (read-only note; each row tappable → Child
  Project View; per-card "by <creator> · View profile" → `CreatorPublicProfileModal`), Recently
  Completed, Earned Badges (horizontal scroll). Active/completed projects derived from the existing
  `projectRepo` published list, sliced by the child's `active_proj`/`done_proj` (demo mapping, mirrors
  prototype).
- **ParentChildProjectViewScreen** — read-only banner, project header (emoji/title/cat·diff·steps),
  description, child progress bar, steps overview (done/active/locked styling). Steps from
  `projectRepo.getProjectWithSteps`; per-step done/active derived from a deterministic split based on
  the project's percent (demo).
- **ParentActivityScreen** — header ("Activity" + subtitle, "Mark all read"), child filter tabs
  (`parentActivity.childTabs`), grouped feed (`parentActivity.filterAndGroup`) of `ActivityRow`.
- **ParentProfileScreen** — hero (parent gradient, PRN id pill), stat tiles (Children / Completed /
  Badges), `SettingsRow` list (Profile Settings → ProfileSettings; Add a Child → ParentLinkChild;
  Notifications → ParentNotifications; Settings → Settings), Sign Out (confirm modal → `signOut`).
- **ParentLinkChildScreen** — explainer + "how to find the Learner ID" guide, LRN id input, Search
  (`lookupChildByPublicId`, spinner, inline error), found-result card, "Link this child"
  (`linkChild` + `setLocalUser`) → success → back to Dashboard.
- **ParentNotificationsScreen** — back header + "Mark all read", grouped `NotifRow` list (local unread
  state), tap → expand modal with optional "View Child Progress" deep-link to the first child.

### Shared
- **SettingsScreen** — grouped (Account / Privacy / Support / Danger). Account → ProfileSettings
  (role-aware via `user.role`), Language, NotifPrefs. Privacy/Support → the `InfoScreen` stubs. Danger →
  Sign Out + Delete Account confirm modals (both route to `signOut`). Footer "S-MIB v1.0.0".
- **ProfileSettingsScreen** — role-aware fields: parent (Full Name, Email, Phone, IC + PRN read-only);
  learner (Full Name, Email, School, Grade, Bio + LRN read-only w/ copy); creator (Full Name, Email,
  Organization, Expertise, Bio + CRT read-only). Save → `setLocalUser(updated)` + online
  `profiles.update`. Avatar shows initials with a (non-functional) camera affordance.
- **LanguageScreen** — EN / Bahasa Malaysia selector; persists to `keys.lang` and (online)
  `profiles.locale`; beta note.
- **NotifPrefsScreen** — grouped `Toggle` rows (General / Activity / Community); persists the prefs map
  to `keys.notifPrefs(user.id)`.
- **InfoScreen** — back header + title + placeholder body; one component registered under
  `PrivacySecurity`, `Terms`, `PrivacyPolicy`, `HelpCentre`, `ContactSupport` via `initialParams`.

## 8. Components

New (`src/components/`): `ChildCard`, `ChildHeader`, `GoalCard`, `ActivityRow`, `NotifRow`,
`SettingsRow`, `Toggle`, `CreatorPublicProfileModal`. Reuse `ScreenBackground`, `AppHeader`, `StatCard`,
`SectionHeader`, `DifficultyPill`. The pushed-screen back header reuses the established
`AppHeader` + `←` `Pressable` pattern (as in `CreatorProjectDetailScreen`).

## 9. Persistence summary

| Surface | Local | Online |
|---|---|---|
| Link child | `keys.parentLinks(id)` + `setLocalUser` | `profiles.update(linked_child_ids)` |
| Language | `keys.lang` | `profiles.update(locale)` |
| Notif prefs | `keys.notifPrefs(id)` | — (delivery deferred) |
| Profile edits | `setLocalUser` | `profiles.update(role fields)` |

## 10. Testing

Extend `src/data/__datatest.js` (`runDataSmokeTest`); add `rpc(name, args)` support to the existing
`fakeDb`:
- `parentStats.aggregate` — totals over `SEED_CHILDREN`; zeros on `[]`.
- `parentActivity.childTabs` includes `All` + unique names; `filterAndGroup` filters by child and groups
  by day preserving order.
- `parentRepo.lookupChildByPublicId` — offline matches `LRN-4821` from seed; offline not-found returns
  `{found:false}`; malformed id returns an error; online uses the rpc row.
- `parentRepo.linkChild` — appends to `linked_child_ids` (model dedupe), writes the local link cache, and
  fires a `profiles` update when configured.
- `parentRepo.listChildren` — offline returns seed (2) plus a locally-linked child overlay (deduped).

Keep existing suites green (model 22, auth 11, data ~28 → ~36). Screens verified by
`node scripts/parsecheck.cjs` + offline web-bundle browser QA (memory: offline-web-qa).

## 11. File manifest

**New**
- `supabase/schema_day5.sql`
- `src/repos/parentRepo.js`
- `src/data/parentStats.js`, `src/data/parentActivity.js`
- `src/navigation/ParentStack.js`, `src/navigation/sharedScreens.js`
- `src/components/ChildCard.js`, `ChildHeader.js`, `GoalCard.js`, `ActivityRow.js`, `NotifRow.js`, `SettingsRow.js`, `Toggle.js`, `CreatorPublicProfileModal.js`
- `src/screens/parent/ParentDashboardScreen.js`, `ParentChildProgressScreen.js`, `ParentChildProjectViewScreen.js`, `ParentActivityScreen.js`, `ParentProfileScreen.js`, `ParentLinkChildScreen.js`, `ParentNotificationsScreen.js`
- `src/screens/shared/SettingsScreen.js`, `ProfileSettingsScreen.js`, `LanguageScreen.js`, `NotifPrefsScreen.js`, `InfoScreen.js`

**Modified**
- `src/data/seedData.js` (`SEED_CHILDREN`, `SEED_PARENT_ACTIVITY`, `SEED_PARENT_NOTIFS`, `SEED_CREATORS`)
- `src/data/localStore.js` (keys)
- `src/repos/index.js` (export `parentRepo`)
- `src/navigation/ParentTabs.js` (real screens), `RootNavigator.js` (parent → `ParentStack`),
  `LearnerStack.js` + `CreatorStack.js` (register shared screens)
- `src/data/__datatest.js` (parent tests + `rpc` fake)
- `supabase/README.md` (Day 5 run order)

## 12. Resolved decisions
- Children data offline-seed; link lookup is a real RPC (no broad profiles read policy, no cross-user
  progress RLS).
- One role-aware `ProfileSettingsScreen` replaces the prototype's three static variants.
- Shared screens registered into all three role stacks now (additive).
- One `InfoScreen` backs all five legal/support stubs.
- Children are plain view objects (no `Child` model / table).
- Notif prefs + language persisted; actual delivery/translation deferred.
