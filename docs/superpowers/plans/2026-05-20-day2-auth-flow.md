# Day 2 Auth Flow + Supabase Schema — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the 4-screen registration flow (role select → details → OTP → success), polish the login screen, and ship the Supabase `profiles` schema — all working in both real-Supabase and offline-demo modes.

**Architecture:** React Navigation route params carry registration state (no globals). A small pure-logic layer (`src/auth/registration.js`) resolves roles and builds `User` subclass instances; screens stay thin. Supabase mode uses `signUp` → email OTP (`verifyOtp`) → a `handle_new_user` DB trigger that creates the profile row with a sequential public ID. Offline mode stubs OTP and builds the model locally via `setLocalUser`.

**Tech Stack:** Expo SDK 55, React Native 0.83, react-native-paper 5, @react-navigation/native-stack 7, @supabase/supabase-js 2, expo-linear-gradient. PostgreSQL (Supabase) for the schema.

---

## Test strategy (read first)

This project has **no Node/Jest runner** — the source uses extensionless ESM imports and an internal `require()` that only the Metro bundler resolves. The proven harness (Day 1, "21/21") is an in-app self-test rendered by a badge. We keep that:

- **Logic tests** live in `src/auth/__regtest.js` → `runAuthSmokeTest()` returning `{ ok, results:[{name,ok,error?}] }`, mirroring `src/models/__smoketest.js`.
- A badge renders the result. **TDD loop:** run the web app once (`npx expo start --web`, kept running — Metro hot-reloads on save); after each edit, reload the page and read the badge. Use the **gstack** skill to drive the browser headlessly and assert pass/fail text.
- **Screens** (RN UI) are not unit-testable in this toolchain; verify them functionally via gstack click-throughs on web at the integration checkpoints (Tasks 16–17).
- **SQL** is reviewed for correctness and (optionally) applied with `supabase db push` when a project exists; no DB is available in-dev.

Keep the existing model smoke test green (21/21) at all times.

**Screen code note:** The screens are a faithful React Native port of the already-committed web design at `/tmp/smib-design/smib-app design/ScreensAuth.jsx` (extracted from `smib-app design.zip`) using the styling patterns in `src/screens/auth/LoginScreen.js`. Rather than duplicate ~800 lines of JSX here, screen tasks specify exact props, state, params, fields, and acceptance criteria, and cite the design source by section. Match `src/theme/tokens.js` for all colors/spacing/sizes.

---

## File Structure

**Create**
- `src/auth/registration.js` — pure helpers: `resolveLearnerRole`, `resolveRole`, `roleMeta`, `buildUserModel`, `makeOfflinePublicId`.
- `src/auth/__regtest.js` — `runAuthSmokeTest()`.
- `src/components/AuthHeader.js` — shared auth header (back, brand, title/sub, progress dots).
- `src/components/OtpInput.js` — 6-box code input.
- `src/components/ForgotPasswordModal.js` — reset-password sheet.
- `src/screens/auth/RegStep1.js`, `RegStep2.js`, `RegVerify.js`, `RegSuccess.js`.
- `supabase/schema.sql`, `supabase/README.md`.

**Modify**
- `src/components/SmokeBadge.js` — also run + render `runAuthSmokeTest()`.
- `src/context/AuthContext.js` — add `signUpWithProfile`, `verifyEmailOtp`, `resendOtp`, `fetchMyProfile`, `resetPassword`.
- `src/models/User.js` — `fromRow` parent case: restore `phone` + `icNumber`.
- `src/navigation/AuthStack.js` — wire real reg screens.
- `src/screens/auth/LoginScreen.js` — V2 title/sub + Forgot Password + disabled Google + demo shortcuts under a "Dev" heading.

---

## Phase A — Pure logic (TDD via the auth badge)

### Task 1: Auth test harness + visible badge

**Files:**
- Create: `src/auth/__regtest.js`
- Modify: `src/components/SmokeBadge.js`

- [ ] **Step 1: Create the harness skeleton (no cases yet).**

`src/auth/__regtest.js`:
```js
/**
 * Runtime self-test of the registration logic layer (src/auth/registration.js).
 * Mirrors src/models/__smoketest.js. Returns { ok, results }.
 */
import {
  resolveLearnerRole,
  resolveRole,
  buildUserModel,
  makeOfflinePublicId,
} from './registration';
import { User } from '../models';

function check(name, fn, results) {
  try { fn(); results.push({ name, ok: true }); }
  catch (err) { results.push({ name, ok: false, error: err.message || String(err) }); }
}

export function runAuthSmokeTest() {
  const r = [];
  // cases added in later tasks
  const ok = r.every(x => x.ok);
  return { ok, results: r };
}
```

- [ ] **Step 2: Render it from SmokeBadge.** In `src/components/SmokeBadge.js`, import `runAuthSmokeTest` and run it alongside the model test; render a second titled line + its failures. Replace the component body so it shows two badges (model, auth) inside one card, each green/red independently.

```js
import { runModelSmokeTest } from '../models/__smoketest';
import { runAuthSmokeTest } from '../auth/__regtest';
// ...
const [report, setReport] = useState(null);
const [auth, setAuth] = useState(null);
useEffect(() => { setReport(runModelSmokeTest()); setAuth(runAuthSmokeTest()); }, []);
```
Render the existing model line as-is, then a second line:
`{auth.ok ? '✓' : '✗'} Auth smoke test: {pass}/{total} passing` with the same failure list pattern. Border green only if **both** ok.

- [ ] **Step 3: Make the badge reachable without logging in.** In `src/screens/auth/LoginScreen.js`, import `SmokeBadge` and render `<SmokeBadge />` at the bottom of the existing demo card (dev-only aid; stays for the rest of Day 2).

- [ ] **Step 4: Verify.** Run `npx expo start --web` (keep running). Open the app with gstack; on the Login screen the card shows "Auth smoke test: 0/0 passing" (green, empty) and "OOP smoke test: 21/21 passing". 

- [ ] **Step 5: Commit.**
```
git add src/auth/__regtest.js src/components/SmokeBadge.js src/screens/auth/LoginScreen.js
git commit -F <msgfile>   # "test: add auth smoke-test harness + badge"
```
(Heredocs are blocked by a hook — write commit messages to a temp file and use `git commit -F`.)

---

### Task 2: `resolveLearnerRole` + `resolveRole`

**Files:**
- Create: `src/auth/registration.js`
- Modify: `src/auth/__regtest.js`

- [ ] **Step 1: Add failing cases** to `runAuthSmokeTest()` (before the `ok` line):
```js
check('resolveLearnerRole: Form 1-3 -> junior', () => {
  if (resolveLearnerRole({ grade: 'Form 2' }) !== 'junior_learner') throw new Error('Form 2');
  if (resolveLearnerRole({ grade: 'Form 4' }) !== 'senior_learner') throw new Error('Form 4');
}, r);
check('resolveLearnerRole: age fallback', () => {
  if (resolveLearnerRole({ age: 12 }) !== 'junior_learner') throw new Error('age 12');
  if (resolveLearnerRole({ age: 17 }) !== 'senior_learner') throw new Error('age 17');
  if (resolveLearnerRole({}) !== 'senior_learner') throw new Error('empty default');
}, r);
check('resolveRole: maps UI role to final role', () => {
  if (resolveRole({ role: 'learner', grade: 'Form 1' }) !== 'junior_learner') throw new Error('learner');
  if (resolveRole({ role: 'creator' }) !== 'creator') throw new Error('creator');
  if (resolveRole({ role: 'parent' }) !== 'parent') throw new Error('parent');
}, r);
```

- [ ] **Step 2: Verify it fails.** Reload the app via gstack; auth badge is red with "resolveLearnerRole ... is not a function" (module/exports missing).

- [ ] **Step 3: Implement** `src/auth/registration.js` (this and the next two tasks share the file; create with these two functions first):
```js
import { JuniorLearner } from '../models/JuniorLearner';
import { SeniorLearner } from '../models/SeniorLearner';
import { Creator } from '../models/Creator';
import { Parent } from '../models/Parent';

const JUNIOR_GRADES = new Set(['Form 1', 'Form 2', 'Form 3']);
const SENIOR_GRADES = new Set(['Form 4', 'Form 5', 'Form 6']);

/** Form 1-3 (or age < 16) -> junior; else senior (safe default). */
export function resolveLearnerRole({ grade, age } = {}) {
  if (grade && JUNIOR_GRADES.has(grade)) return 'junior_learner';
  if (grade && SENIOR_GRADES.has(grade)) return 'senior_learner';
  const n = Number(age);
  if (Number.isFinite(n) && n > 0) return n < 16 ? 'junior_learner' : 'senior_learner';
  return 'senior_learner';
}

/** Map the RegStep1 UI role to the final model role string. */
export function resolveRole({ role, grade, age } = {}) {
  switch (role) {
    case 'learner': return resolveLearnerRole({ grade, age });
    case 'creator': return 'creator';      // unverified; verification is later/admin
    case 'parent':  return 'parent';
    default:        return 'user';
  }
}
```

- [ ] **Step 4: Verify it passes.** Reload via gstack; those 3 auth cases pass.

- [ ] **Step 5: Commit.** `git commit -F` → "feat: add role resolution helpers".

---

### Task 3: `roleMeta` + `makeOfflinePublicId`

**Files:**
- Modify: `src/auth/registration.js`, `src/auth/__regtest.js`

- [ ] **Step 1: Add failing cases:**
```js
check('roleMeta: prefixes and perks', () => {
  if (roleMeta.learner.prefix !== 'LRN') throw new Error('LRN');
  if (roleMeta.creator.prefix !== 'CRT') throw new Error('CRT');
  if (roleMeta.parent.prefix !== 'PRN') throw new Error('PRN');
  if (roleMeta.learner.perks.length !== 3) throw new Error('perks');
}, r);
check('makeOfflinePublicId: prefix + 4 digits', () => {
  const id = makeOfflinePublicId('learner');
  if (!/^LRN-\d{4}$/.test(id)) throw new Error(id);
  if (!/^PRN-\d{4}$/.test(makeOfflinePublicId('parent'))) throw new Error('parent id');
}, r);
```
Add `roleMeta, makeOfflinePublicId` to the import from `./registration` at the top of `__regtest.js`.

- [ ] **Step 2: Verify fails** (gstack reload → red).

- [ ] **Step 3: Implement** (append to `registration.js`). `roleMeta` carries everything the role-select cards and success screen need (icon, label, sub, prefix, accent color from tokens, perks, home hint). Source the perks/labels/icons from `ScreensAuth.jsx` `perksByRole`/`roles` and colors from `src/theme/tokens.js`:
```js
import { colors } from '../theme/tokens';

export const roleMeta = {
  learner: {
    prefix: 'LRN', icon: '🎓', label: 'Learner', accent: colors.cyan,
    sub: 'I want to learn & build STEM projects',
    perks: [
      { icon: '🚀', title: 'Build hands-on STEM projects', sub: 'Robotics, coding, electronics & more' },
      { icon: '🏆', title: 'Earn XP, badges & certificates', sub: 'Level up as you complete projects' },
      { icon: '🤖', title: 'AI mentor available 24/7', sub: 'Get unstuck anytime, anywhere' },
    ],
    greeting: "You're all set!\nStart your maker journey today.",
    cta: 'Start Exploring →',
  },
  creator: {
    prefix: 'CRT', icon: '🔧', label: 'Creator', accent: colors.yellow,
    sub: 'I create & publish learning projects',
    perks: [
      { icon: '✏️', title: 'Publish your own projects', sub: 'Reach thousands of learners across Sarawak' },
      { icon: '📊', title: 'Track student progress', sub: 'See engagement & completion analytics' },
      { icon: '🔧', title: 'Build your creator profile', sub: 'Ratings, reviews & direct feedback' },
    ],
    greeting: 'Welcome aboard!\nReady to inspire the next generation?',
    cta: 'Go to Dashboard →',
  },
  parent: {
    prefix: 'PRN', icon: '👨‍👩‍👧', label: 'Parent', accent: colors.green,
    sub: "I monitor my child's learning progress",
    perks: [
      { icon: '👀', title: "Monitor your child's journey", sub: 'Real-time progress & activity feed' },
      { icon: '🎯', title: 'Celebrate achievements', sub: 'Get notified for every milestone' },
      { icon: '🔒', title: 'Safe, supervised learning', sub: 'Vetted creators & age-appropriate content' },
    ],
    greeting: "You're connected!\nLet's support your child's STEM journey.",
    cta: 'View My Children →',
  },
};

export function makeOfflinePublicId(uiRole) {
  const prefix = (roleMeta[uiRole] || {}).prefix || 'USR';
  const n = Math.floor(1000 + Math.random() * 9000); // 4 digits
  return `${prefix}-${n}`;
}
```

- [ ] **Step 4: Verify passes** (gstack reload → green).
- [ ] **Step 5: Commit.** "feat: add roleMeta + offline public id".

---

### Task 4: `buildUserModel`

**Files:** Modify `src/auth/registration.js`, `src/auth/__regtest.js`

- [ ] **Step 1: Add failing cases:**
```js
check('buildUserModel: learner -> JuniorLearner with toRow shape', () => {
  const u = buildUserModel({ role: 'junior_learner', id: 'id1', publicId: 'LRN-0001',
    profile: { displayName: 'Nurul', email: 'n@s.my', schoolName: 'SMK BK', grade: 'Form 2' } });
  if (u.roleLabel !== 'Junior Learner') throw new Error(u.roleLabel);
  const row = u.toRow();
  if (row.role !== 'junior_learner') throw new Error('row.role');
  if (row.public_id !== 'LRN-0001') throw new Error('row.public_id');
  if (row.school_name !== 'SMK BK' || row.grade !== 'Form 2') throw new Error('student cols');
}, r);
check('buildUserModel: creator + parent', () => {
  const c = buildUserModel({ role: 'creator', id: 'id2', publicId: 'CRT-0001',
    profile: { displayName: 'Cikgu A', email: 'a@s.my', organization: 'SMK BK', expertise: 'Robotics' } });
  if (c.toRow().organization !== 'SMK BK' || c.toRow().expertise !== 'Robotics') throw new Error('creator cols');
  if (c.toRow().public_id !== 'CRT-0001') throw new Error('crt id');
  const p = buildUserModel({ role: 'parent', id: 'id3', publicId: 'PRN-0001',
    profile: { displayName: 'Encik H', email: 'h@e.my', phone: '+60123', icNumber: '850101-13-5678' } });
  if (p.toRow().phone !== '+60123' || p.toRow().ic_number !== '850101-13-5678') throw new Error('parent cols');
}, r);
```
Add `buildUserModel` to the import.

- [ ] **Step 2: Verify fails** (gstack reload → red).

- [ ] **Step 3: Implement** (append to `registration.js`). `role` is the **resolved** role string:
```js
export function buildUserModel({ role, id, publicId, profile = {} }) {
  const base = { id, email: profile.email, displayName: profile.displayName, locale: profile.locale || 'en' };
  switch (role) {
    case 'junior_learner':
      return new JuniorLearner({ ...base, lrnId: publicId, schoolName: profile.schoolName, grade: profile.grade });
    case 'senior_learner':
      return new SeniorLearner({ ...base, lrnId: publicId, schoolName: profile.schoolName, grade: profile.grade });
    case 'creator':
      return new Creator({ ...base, crtId: publicId, organization: profile.organization, expertise: profile.expertise, bio: profile.bio || null });
    case 'parent':
      return new Parent({ ...base, prnId: publicId, phone: profile.phone, icNumber: profile.icNumber });
    default:
      throw new Error(`buildUserModel: unsupported role ${role}`);
  }
}
```

- [ ] **Step 4: Verify passes** (gstack reload → green).
- [ ] **Step 5: Commit.** "feat: add buildUserModel".

---

### Task 5: `User.fromRow` parent round-trip fix

**Files:** Modify `src/models/User.js`, `src/auth/__regtest.js`

- [ ] **Step 1: Add failing case:**
```js
check('User.fromRow restores parent phone + ic', () => {
  const row = { id: 'p1', email: 'p@a.b', display_name: 'Pat', role: 'parent',
    public_id: 'PRN-0001', phone: '+60123', ic_number: '850101-13-5678', linked_child_ids: ['LRN-1'] };
  const u = User.fromRow(row);
  if (u.phone !== '+60123') throw new Error('phone');
  if (u.icNumber !== '850101-13-5678') throw new Error('ic');
  if (u.linkedChildIds.length !== 1) throw new Error('children');
}, r);
```

- [ ] **Step 2: Verify fails** (`phone` undefined → red).

- [ ] **Step 3: Implement.** In `src/models/User.js`, the `case 'parent':` of `fromRow` currently reads:
```js
return new Parent({ ...base, prnId: row.public_id, linkedChildIds: row.linked_child_ids || [] });
```
Change to:
```js
return new Parent({ ...base, prnId: row.public_id, linkedChildIds: row.linked_child_ids || [], phone: row.phone, icNumber: row.ic_number });
```

- [ ] **Step 4: Verify passes** (gstack reload → green; model badge still 21/21).
- [ ] **Step 5: Commit.** "fix: restore parent phone/ic in User.fromRow".

---

## Phase B — Supabase schema

### Task 6: `profiles` table + RLS + public-id + triggers

**Files:** Create `supabase/schema.sql`

- [ ] **Step 1: Write `supabase/schema.sql`** exactly as below (columns match `User.toRow()`/`fromRow()` across all subclasses):
```sql
-- S-MIB profiles schema (Day 2). Single-table inheritance matching the OOP layer.

create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  email             text,
  display_name      text,
  avatar_url        text,
  role              text not null default 'user'
                    check (role in ('junior_learner','senior_learner','creator',
                                    'verified_creator','content_mentor','parent','user')),
  public_id         text unique,
  locale            text default 'en',
  created_at        timestamptz default now(),
  updated_at        timestamptz default now(),
  -- learner
  school_name       text,
  grade             text,
  xp                integer default 0,
  level             integer default 1,
  streak            integer default 0,
  -- creator
  organization      text,
  bio               text,
  expertise         text,
  rating            numeric default 0,
  years_experience  integer,
  -- parent
  phone             text,
  ic_number         text,
  linked_child_ids  text[] default '{}'
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
-- No INSERT policy: rows are created by the SECURITY DEFINER trigger below.
-- Day 3 (leaderboard) may add a limited public read policy / view.

-- Per-role sequences for human-friendly public IDs.
create sequence if not exists public.lrn_seq;
create sequence if not exists public.crt_seq;
create sequence if not exists public.prn_seq;
create sequence if not exists public.usr_seq;

create or replace function public.next_public_id(p_role text)
returns text language plpgsql as $$
declare prefix text; seqname text;
begin
  if p_role in ('junior_learner','senior_learner') then prefix := 'LRN'; seqname := 'public.lrn_seq';
  elsif p_role in ('creator','verified_creator','content_mentor') then prefix := 'CRT'; seqname := 'public.crt_seq';
  elsif p_role = 'parent' then prefix := 'PRN'; seqname := 'public.prn_seq';
  else prefix := 'USR'; seqname := 'public.usr_seq';
  end if;
  return prefix || '-' || lpad(nextval(seqname)::text, 4, '0');
end; $$;

-- Create the profile row from signup metadata.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare m jsonb; v_role text;
begin
  m := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_role := coalesce(m->>'role', 'user');
  insert into public.profiles (
    id, email, display_name, role, public_id, locale,
    school_name, grade, organization, expertise, years_experience, phone, ic_number
  ) values (
    new.id, new.email, m->>'display_name', v_role, public.next_public_id(v_role), coalesce(m->>'locale','en'),
    m->>'school_name', m->>'grade', m->>'organization', m->>'expertise',
    nullif(m->>'years_experience','')::integer, m->>'phone', m->>'ic_number'
  );
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at touch
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
```

- [ ] **Step 2: Verify (best-effort syntax).** If `psql` is available against any throwaway Postgres, run `psql -f supabase/schema.sql`; otherwise review against the column list in the spec §4 and confirm every `toRow()` key has a matching column (`id,email,display_name,avatar_url,role,public_id,locale,created_at` + `public_id,school_name,grade,xp,level,streak` + `organization,bio,expertise,rating` + `linked_child_ids,phone,ic_number`). Confirm present.

- [ ] **Step 3: Commit.** "feat: add Supabase profiles schema + triggers".

---

### Task 7: Supabase setup README

**Files:** Create `supabase/README.md`

- [ ] **Step 1: Write `supabase/README.md`** documenting: (1) create a project; (2) run `schema.sql` in the SQL editor; (3) Auth → Providers → Email: enable "Confirm email"; (4) Auth → Email Templates → "Confirm signup": replace the magic-link body with one that shows the 6-digit code, e.g. `Your S-MIB verification code is: {{ .Token }}` (this is what `verifyOtp({ type: 'signup' })` checks); (5) copy Project URL + anon key into `.env` (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`); (6) note that without these the app runs in offline demo mode.

- [ ] **Step 2: Commit.** "docs: add Supabase setup README".

---

## Phase C — AuthContext methods

### Task 8: Add registration/auth methods to AuthContext

**Files:** Modify `src/context/AuthContext.js`

- [ ] **Step 1: Replace `signUp`** with `signUpWithProfile` and add the four other methods. Keep `PENDING_REG_KEY` import/usage only if still referenced; otherwise remove it. New methods (place near the existing mutations, add all to the context value object **and** the `useMemo` dependency array):
```js
const signUpWithProfile = useCallback(async ({ email, password, role, profile }) => {
  if (!configured) return { otpRequired: false };
  const metadata = {
    role,
    display_name: profile.displayName,
    locale: profile.locale || 'en',
    school_name: profile.schoolName,
    grade: profile.grade,
    organization: profile.organization,
    expertise: profile.expertise,
    years_experience: profile.yearsExperience,
    phone: profile.phone,
    ic_number: profile.icNumber,
  };
  const { error } = await supabase.auth.signUp({ email, password, options: { data: metadata } });
  if (error) throw error;
  return { otpRequired: true };
}, [configured]);

const verifyEmailOtp = useCallback(async ({ email, token }) => {
  if (!configured) return {};
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
  if (error) throw error;
  return data;
}, [configured]);

const resendOtp = useCallback(async ({ email }) => {
  if (!configured) return;
  const { error } = await supabase.auth.resend({ type: 'signup', email });
  if (error) throw error;
}, [configured]);

const fetchMyProfile = useCallback(async () => {
  if (!configured || !session?.user) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
  if (error) throw error;
  return data;
}, [configured, session]);

const resetPassword = useCallback(async (email) => {
  if (!configured) return;
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}, [configured]);
```
Update the `value`/`useMemo` to include: `signUpWithProfile, verifyEmailOtp, resendOtp, fetchMyProfile, resetPassword` (and drop `signUp` if removed) — keep `signIn, signOut, refreshProfile, setLocalUser, user, session, loading, configured`.

- [ ] **Step 2: Verify no regressions.** gstack-reload the app: Login still renders, demo-role buttons still enter the app (they use `setLocalUser`), badge still green. (Offline mode → new methods are no-ops; nothing should break.)

- [ ] **Step 3: Commit.** "feat: add registration methods to AuthContext".

---

## Phase D — Screens & navigation

### Task 9: `AuthHeader` component

**Files:** Create `src/components/AuthHeader.js`
Design source: `ScreensAuth.jsx` lines 9–39 (`AuthHeader`).

- [ ] **Step 1: Implement.** Props: `{ navigation, onBack, title, sub, step, totalSteps }`. Render inside `SafeAreaView edges={['top']}`: a row with an optional back chevron (`‹`, calls `onBack || navigation.goBack`) on the left, centered brand `S-MIB` with a 🦅 logo, a spacer on the right for symmetry. Below: centered `title` (white, bold, ~`sizes.text2xl`) and `sub` (`colors.textMuted`, `sizes.textSm`). If `step` and `totalSteps` are set, render a row of `totalSteps` thin bars; first `step` bars are `colors.teal`, rest `rgba(255,255,255,0.15)`. Use `colors`/`spacing`/`sizes` from tokens. No external deps.

- [ ] **Step 2: Verify it imports cleanly.** Temporarily not rendered anywhere yet; confirm the web bundle still builds (gstack reload → no red error overlay).

- [ ] **Step 3: Commit.** "feat: add AuthHeader component".

---

### Task 10: `OtpInput` component

**Files:** Create `src/components/OtpInput.js`
Design source: `ScreensAuth.jsx` lines 550–640 (6-digit logic).

- [ ] **Step 1: Implement.** Props: `{ value, onChange, length = 6, disabled }`. `value` is a string; render `length` boxes (RN `TextInput` from react-native-paper or core `TextInput`) showing `value[i]`. Maintain `refs` array. On a box's `onChangeText(t)`:
  - If `t.length > 1` (paste/autofill): take digits only, slice to `length`, call `onChange(digits)`, focus the last filled box. (This is the paste path — no `expo-clipboard` needed.)
  - Else set digit `i` to `t` (digits only), rebuild the string, `onChange(next)`, and if `t` is non-empty and `i < length-1` focus box `i+1`.
  - `onKeyPress` Backspace with empty box → focus `i-1`.
  Style boxes per `LoginScreen` input aesthetic: glass background, `colors.border`, focus → `colors.teal`; filled box slightly scaled/teal border. `keyboardType="number-pad"`, `maxLength={1}` per box (the paste path still receives multi-char via autofill on web).

- [ ] **Step 2: Verify build** (gstack reload → no error overlay).
- [ ] **Step 3: Commit.** "feat: add OtpInput component".

---

### Task 11: `RegStep1` — role select

**Files:** Create `src/screens/auth/RegStep1.js`; Modify `src/navigation/AuthStack.js`
Design source: `ScreensAuth.jsx` lines 261–380.

- [ ] **Step 1: Implement `RegStep1`.** Uses `ScreenBackground` + `AuthHeader` (`title="Create Account"`, `sub="Step 1 of 3 — Choose your role"`, `step={1} totalSteps={3}`, back → `navigation.goBack()`). Body: a vertical list of 3 role cards driven by `roleMeta` (`learner`, `creator`, `parent`) — each card shows `icon`, `label`, `sub`, and an `ID: {prefix}-XXXX` pill; selected card gets a teal check + teal border (track `selected` in state). Below: the info note ("Each account gets a unique ID … Parents use their child's Learner ID to link accounts."). A `Continue →` button (disabled until `selected`) → `navigation.navigate('RegStep2', { role: selected })`. Colors/spacing from tokens; match `LoginScreen` card styling.

- [ ] **Step 2: Wire into `AuthStack`.** Replace the `RegStep1` placeholder import/usage with the real screen:
```js
import { RegStep1 } from '../screens/auth/RegStep1';
// ...
<Stack.Screen name="RegStep1" component={RegStep1} />
```

- [ ] **Step 3: Verify via gstack.** From Login → "Create new account" → RegStep1 renders; selecting a role enables Continue; Continue navigates (next screen is still placeholder/real depending on order). Confirm progress bar shows 1/3.

- [ ] **Step 4: Commit.** "feat: add RegStep1 role-select screen".

---

### Task 12: `RegStep2` — role-specific details

**Files:** Create `src/screens/auth/RegStep2.js`; Modify `src/navigation/AuthStack.js`
Design source: `ScreensAuth.jsx` lines 388–546.

- [ ] **Step 1: Implement `RegStep2`.** Read `route.params.role` (`'learner'|'creator'|'parent'`). `AuthHeader` (`title="Your Details"`, `sub="Step 2 of 3 — {Label} information"`, `step={2} totalSteps={3}`, back → goBack). Render the role's fields per the design's `fieldsByRole`:
  - **learner:** Full Name, Email, School Name, Age (number), Grade/Form (select: Form 1–6).
  - **creator:** Full Name, Email, Organisation/School, Field of Expertise (select: Robotics, Coding, Electronics, Engineering, Science, Maths, Agriculture, Other), Years of Experience (number).
  - **parent:** Full Name, Email, Phone Number, IC Number (with note "Used to verify your identity as a guardian").
  Plus Password + Confirm Password (show/hide eye) and a Terms checkbox. Use react-native-paper `TextInput` (match `LoginScreen`). For selects, use a simple paper `Menu`/`Button` dropdown or a segmented set of chips — keep it dependency-free (a paper `Menu` is fine).
  - **Validation** before continue: all required fields non-empty, valid email shape, password ≥ 8, password === confirm, terms checked. Show inline `HelperText` errors; disable the button until valid (mirror `LoginScreen`'s error pattern).
  - **On "Create Account":** build `profile` object (camelCase keys: `displayName, email, schoolName, grade, age, organization, expertise, yearsExperience, phone, icNumber`) and `resolvedRole = resolveRole({ role, grade, age })`. Then:
    - `const { otpRequired } = await signUpWithProfile({ email, password, role: resolvedRole, profile });`
    - `navigation.navigate('RegVerify', { role, resolvedRole, email, profile });` (password is NOT passed onward).
  - Wrap the call in try/catch → show error via `HelperText`; use a `busy` flag like `LoginScreen`.

- [ ] **Step 2: Wire into `AuthStack`** (`import { RegStep2 } …; <Stack.Screen name="RegStep2" component={RegStep2} />`).

- [ ] **Step 3: Verify via gstack.** For each role from RegStep1: correct fields show; validation blocks until satisfied; submitting (offline mode → no network) navigates to RegVerify. Progress bar 2/3.

- [ ] **Step 4: Commit.** "feat: add RegStep2 details screen".

---

### Task 13: `RegVerify` — OTP

**Files:** Create `src/screens/auth/RegVerify.js`; Modify `src/navigation/AuthStack.js`
Design source: `ScreensAuth.jsx` lines 550–681.

- [ ] **Step 1: Implement `RegVerify`.** Read `route.params: { role, resolvedRole, email, profile }`. `AuthHeader` (`title="Verify your email"`, `sub="Step 3 of 3 — Enter the 6-digit code"`, `step={3} totalSteps={3}`, back → goBack). Body: floating 📩, "We sent a verification code to **{email}**", "Code expires in 10 minutes", `<OtpInput value={code} onChange={setCode} />`, a resend row with a 45s countdown (`useEffect` timer; when 0 → "Resend code" link calling `resendOtp({ email })` and resetting to 45), and a `Verify Email →` button enabled when `code.length === 6`.
  - **On verify:** `const { configured } = useAuth();`
    - If `configured`: `await verifyEmailOtp({ email, token: code });` then `const profileRow = await fetchMyProfile();` → derive `publicId = profileRow?.public_id` and `resolvedRole2 = profileRow?.role || resolvedRole`.
    - If offline: accept any 6 digits; `publicId = makeOfflinePublicId(role)`.
    - Navigate: `navigation.navigate('RegSuccess', { role, resolvedRole: <resolved>, email, profile, publicId });`
  - try/catch around verify → show inline error ("Invalid or expired code").

- [ ] **Step 2: Wire into `AuthStack`.**
- [ ] **Step 3: Verify via gstack** (offline): enter any 6 digits → navigates to RegSuccess. Resend countdown ticks. Progress 3/3.
- [ ] **Step 4: Commit.** "feat: add RegVerify OTP screen".

---

### Task 14: `RegSuccess` — welcome + enter app

**Files:** Create `src/screens/auth/RegSuccess.js`; Modify `src/navigation/AuthStack.js`
Design source: `ScreensAuth.jsx` lines 684–789.

- [ ] **Step 1: Implement `RegSuccess`.** Read `route.params: { role, resolvedRole, email, profile, publicId }`. Use `roleMeta[role]` for label/accent/perks/greeting/cta. Body (centered, no progress bar): floating 🦅, "Welcome to S-MIB!", `greeting` (whitespace-pre-line), role badge (`{icon} {label}`) + (learner only) "Level 1 · Starter" badge, the unique-ID card (label "Your {Label} ID", value `publicId` in `roleMeta.accent` monospace, plus the contextual hint: parent → "Ask your child for their LRN-XXXX ID to link them"; learner → "Share this with your parent to link accounts"; creator → "Your unique creator identifier"), the 3 perk rows, and the CTA button (`roleMeta.cta`).
  - **On CTA:** get `{ configured, fetchMyProfile, refreshProfile, setLocalUser }` from `useAuth()`.
    - If `configured`: `await refreshProfile();` (session already exists from verify; this hydrates `user` → RootNavigator swaps to Main).
    - If offline: `const u = buildUserModel({ role: resolvedRole, id: \`demo-${resolvedRole}-${Date.now()}\`, publicId, profile }); await setLocalUser(u);` → `user` set → Main.
  - Use `busy` state on the CTA.

- [ ] **Step 2: Wire into `AuthStack`** (keep `options={{ animation: 'fade_from_bottom' }}`).
- [ ] **Step 3: Verify via gstack** (offline): completing the flow as a learner lands on the Learner tabs; the post-login PlaceholderScreen shows the new user's name/role/public ID; badge green.
- [ ] **Step 4: Commit.** "feat: add RegSuccess screen".

---

### Task 15: LoginScreen V2 polish + Forgot Password modal

**Files:** Create `src/components/ForgotPasswordModal.js`; Modify `src/screens/auth/LoginScreen.js`
Design source: `ScreensAuth.jsx` lines 44–146 (login) + 208–257 (forgot modal).

- [ ] **Step 1: Implement `ForgotPasswordModal`.** Props `{ visible, onDismiss }`. react-native-paper `Portal` + `Modal`. Two states: form (email input + "Send Reset Link" → `resetPassword(email)` then success) and success ("Check your email!" + Done). Match glass styling.

- [ ] **Step 2: Update `LoginScreen`.** Change card title to "Sign In", sub "Continue your maker journey". Add a "Forgot password?" text link (right-aligned) opening the modal. Add a disabled "Continue with Google (Coming soon)" outlined button below the sign-in button (non-functional, `disabled`). Keep the existing email/password/sign-in logic. Move the demo-role buttons under a clearly labelled "Dev / demo entry (no backend)" heading (already a separate card — just retitle). Keep the `SmokeBadge` from Task 1.

- [ ] **Step 3: Verify via gstack.** Login shows "Sign In"; Forgot Password opens modal and shows success; Google button is visibly disabled; demo buttons still enter the app; "Create new account" → RegStep1.

- [ ] **Step 4: Commit.** "feat: LoginScreen V2 polish + forgot-password modal".

---

## Phase E — Integration verification

### Task 16: Full offline flow for all three roles (gstack)

- [ ] **Step 1:** With `npx expo start --web` running, use gstack to run three end-to-end registrations (offline mode):
  - **Learner:** Login → Create account → Learner → fill (e.g. Form 2 → expect junior path) → any password ≥8 + confirm + terms → Create → enter 6 digits → Verify → success shows `LRN-####` → CTA → lands on **Learner tabs**; PlaceholderScreen shows role "Junior Learner".
  - **Creator:** same path → success shows `CRT-####` → lands on **Creator tabs**; role "Creator".
  - **Parent:** fill phone + IC → success shows `PRN-####` → lands on **Parent tabs**; role "Parent / Guardian".
  - Sign out between runs.
- [ ] **Step 2:** Capture a screenshot of each success screen as evidence. Note any deviations and fix before proceeding.

### Task 17: Regression + cleanup

- [ ] **Step 1:** Confirm both badges green (model 21/21, auth all passing) on Login.
- [ ] **Step 2:** Confirm demo-role shortcuts still work and the four role tabs still navigate (Day-1 guarantee).
- [ ] **Step 3:** Decide on the dev-only `SmokeBadge` on Login — keep for now (Day 3 will remove). Note in commit.
- [ ] **Step 4:** Final commit if any fixes: "chore: Day 2 integration fixes".

---

## Self-review checklist (done while writing — all covered)
- Spec §1–§8 each map to tasks: screens (11–15), schema (6–7), AuthContext (8), role logic (2–4), model fix (5), tests (1–5, 16–17), login (15), Expo-v55 verify (in screen tasks).
- Method/property names consistent across tasks: `signUpWithProfile`, `verifyEmailOtp`, `resendOtp`, `fetchMyProfile`, `resetPassword`, `resolveRole`, `resolveLearnerRole`, `buildUserModel`, `roleMeta`, `makeOfflinePublicId`.
- Params consistent: RegStep1→`{role}`; RegStep2→`{role,resolvedRole,email,profile}`; RegVerify→`{role,resolvedRole,email,profile,publicId}`.
- No placeholders/TBD; SQL columns cover every `toRow()` key.
