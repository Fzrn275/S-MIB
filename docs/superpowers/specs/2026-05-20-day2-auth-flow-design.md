# Day 2 — Auth Flow + Supabase Schema (Design Spec)

**Date:** 2026-05-20
**Branch:** `day2-auth-flow`
**Status:** Approved, ready for implementation

## 1. Goal & Scope

Build the full registration flow on top of the Day-1 scaffold, plus the Supabase
SQL schema that backs it. Everything works in **two modes**, mirroring the
existing `AuthContext` dual-mode pattern:

- **Supabase mode** (`isSupabaseConfigured() === true`): real `signUp` →
  email 6-digit OTP → profile row created by a DB trigger → session.
- **Offline demo mode** (no env vars): stubbed OTP, local `User` model built
  client-side and persisted via `setLocalUser`.

### Deliverables
1. Four registration screens: `RegStep1`, `RegStep2`, `RegVerify`, `RegSuccess`.
2. `LoginScreen` V2 polish (Sign In title/sub + Forgot Password modal),
   **keeping** the demo-role shortcuts in a clearly-marked dev section.
3. Supabase schema: `supabase/schema.sql` + `supabase/README.md` setup notes.
4. Registration self-test (`src/auth/__regtest.js`) surfaced via `SmokeBadge`.

### Out of scope (YAGNI)
- Google SSO (rendered disabled "coming soon" only, to match the design).
- The login-error screen variant and password-strength meter.
- Real parent↔child account linking (Day 3+).
- Public/leaderboard read access to `profiles` (Day 3+; noted in SQL file).

## 2. Architecture & Data Flow

State passes through **React Navigation route params** — the prototype's
`window.__regRole` global is removed entirely.

```
Login ──▶ RegStep1
RegStep1  ──{ role: 'learner' | 'creator' | 'parent' }──▶ RegStep2
RegStep2  ── Supabase: signUpWithProfile(email, password, role, profile) → sends OTP
          ──{ role, email, profile, resolvedRole }──▶ RegVerify   (password is consumed in RegStep2; never travels onward)
RegVerify ── Supabase: verifyEmailOtp(email, token) → session; fetchMyProfile() → public_id
          ──{ role: resolvedRole, publicId, displayName }──▶ RegSuccess
RegSuccess ── CTA → hydrate user → RootNavigator swaps AuthStack → Main
```

**Why `user` stays null until the success CTA:** `RootNavigator` switches from
`AuthStack` to `Main` the moment `user` becomes non-null. If we hydrated the
user during `RegVerify`, `RegSuccess` (which lives inside `AuthStack`) would be
unmounted before it could render. So:
- Supabase mode: after `verifyOtp` the *session* exists and the profile row
  exists (created by the trigger), but we do **not** call `refreshProfile()`
  until the user taps the `RegSuccess` CTA.
- Offline mode: the model instance is built and `setLocalUser` is called only on
  the `RegSuccess` CTA.

### Offline-mode flow
- `RegStep2` "Create Account": no backend call; pass `{ role, email, profile,
  resolvedRole }` to `RegVerify`.
- `RegVerify`: any 6 digits pass (stub); pass `{ role, email, profile,
  resolvedRole }` to `RegSuccess`. Display ID is derived client-side.
- `RegSuccess` CTA: `buildUserModel(...)` → `setLocalUser(instance)`.

## 3. AuthContext additions

Thin wrappers over the existing `supabase` client, each guarding on
`configured` and resolving to a stub when offline. Added to the context value
and `useMemo` deps:

| Method | Supabase behavior | Offline behavior |
| --- | --- | --- |
| `signUpWithProfile({ email, password, role, profile })` | `supabase.auth.signUp({ email, password, options: { data: metadata } })` where `metadata` is the snake_cased profile + `role` (the resolved role) + `locale`. Returns `{ otpRequired: true }`. | returns `{ otpRequired: false }` (no-op) |
| `verifyEmailOtp({ email, token })` | `supabase.auth.verifyOtp({ email, token, type: 'signup' })` | resolves `{}` (any code accepted by the caller) |
| `resendOtp({ email })` | `supabase.auth.resend({ type: 'signup', email })` | no-op |
| `fetchMyProfile()` | `select('*').eq('id', session.user.id).maybeSingle()` → row | `null` |
| `resetPassword(email)` | `supabase.auth.resetPasswordForEmail(email)` | no-op (modal still shows the success state) |

The existing `signUp` is superseded by `signUpWithProfile`; remove or keep as an
internal helper — do not break `hydrateProfile`/`refreshProfile`/`setLocalUser`.

## 4. Supabase SQL Schema (`supabase/schema.sql`)

Single-table inheritance, columns chosen to exactly match `User.toRow()` /
`User.fromRow()` across all subclasses.

### `public.profiles`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` PK | `references auth.users(id) on delete cascade` |
| `email` | `text` | |
| `display_name` | `text` | |
| `avatar_url` | `text` | nullable |
| `role` | `text not null` | CHECK ∈ `junior_learner, senior_learner, creator, verified_creator, content_mentor, parent, user` |
| `public_id` | `text unique` | assigned by trigger (e.g. `LRN-0001`) |
| `locale` | `text default 'en'` | |
| `created_at` | `timestamptz default now()` | |
| `updated_at` | `timestamptz default now()` | touched by trigger |
| `school_name` | `text` | learner |
| `grade` | `text` | learner |
| `xp` | `int default 0` | learner |
| `level` | `int default 1` | learner |
| `streak` | `int default 0` | learner |
| `organization` | `text` | creator |
| `bio` | `text` | creator |
| `expertise` | `text` | creator |
| `rating` | `numeric default 0` | creator |
| `years_experience` | `int` | creator (persisted; not yet on the model) |
| `phone` | `text` | parent |
| `ic_number` | `text` | parent |
| `linked_child_ids` | `text[] default '{}'` | parent |

### RLS
- `enable row level security`.
- Policy `profiles_select_own`: `select using (auth.uid() = id)`.
- Policy `profiles_update_own`: `update using (auth.uid() = id) with check (auth.uid() = id)`.
- **No** client INSERT policy — inserts happen only via the `SECURITY DEFINER`
  trigger. (A public leaderboard read policy is left commented for Day 3.)

### Public-ID generation
- Three sequences: `lrn_seq`, `crt_seq`, `prn_seq` (and a `usr_seq` fallback).
- `public.next_public_id(role text) returns text`: maps role → prefix
  (`junior_learner`/`senior_learner`→`LRN`, `creator`/`verified_creator`/
  `content_mentor`→`CRT`, `parent`→`PRN`, else `USR`) and returns
  `prefix || '-' || lpad(nextval(seq)::text, 4, '0')`.

### Triggers
- `handle_new_user()` `SECURITY DEFINER`, `after insert on auth.users`:
  reads `new.raw_user_meta_data` (`role`, `display_name`, `school_name`,
  `grade`, `organization`, `expertise`, `years_experience`, `phone`,
  `ic_number`, `locale`), defaults `role` to `'user'`, computes `public_id` via
  `next_public_id(role)`, and inserts the `profiles` row (`id = new.id`,
  `email = new.email`).
- `set_updated_at()` `before update` → `new.updated_at = now()`.

### `supabase/README.md`
Setup steps: run `schema.sql`; in Auth settings enable **Confirm email**; edit
the *Confirm signup* email template to send the 6-digit token
(`{{ .Token }}`) so `verifyOtp({ type: 'signup' })` works; copy URL + anon key
into `.env`.

## 5. Files

**New**
- `src/screens/auth/RegStep1.js` — role select (3 cards: Learner/Creator/Parent),
  ID-prefix preview, info note, Continue.
- `src/screens/auth/RegStep2.js` — role-specific fields (per the design's
  `fieldsByRole`), password + confirm + validation, terms checkbox, Create.
- `src/screens/auth/RegVerify.js` — `OtpInput` + resend countdown (45s) +
  verify; dual-mode.
- `src/screens/auth/RegSuccess.js` — role badge, generated ID display,
  role-specific perks, CTA → enter app.
- `src/components/AuthHeader.js` — shared header: back chevron, brand, centered
  title/sub, optional `step`/`totalSteps` progress dots.
- `src/components/OtpInput.js` — 6 single-char boxes; auto-advance, backspace to
  previous, paste-aware (multi-char `onChangeText` distributes digits). No new
  dependency.
- `src/components/ForgotPasswordModal.js` — RN Paper `Portal` + `Modal`;
  calls `resetPassword`; shows "check your email" success state.
- `src/auth/registration.js` — pure helpers:
  - `resolveLearnerRole({ grade, age })` → `'junior_learner' | 'senior_learner'`.
  - `resolveRole({ role, grade, age })` → final role string.
  - `roleMeta` → per UI-role `{ prefix, label, color, perks, homeHint }`.
  - `buildUserModel({ role, id, publicId, profile })` → correct `User` subclass.
- `src/auth/__regtest.js` — `runAuthSmokeTest()` returning `{ ok, results }`.

**Modified**
- `src/context/AuthContext.js` — add the methods in §3.
- `src/navigation/AuthStack.js` — replace placeholders with real screens
  (keep `RegSuccess` `fade_from_bottom`).
- `src/screens/auth/LoginScreen.js` — V2 title/sub, Forgot Password link+modal,
  disabled Google button, demo shortcuts retained under a "Dev / demo entry"
  heading.
- `src/models/User.js` — `fromRow` parent case: also pass
  `phone: row.phone, icNumber: row.ic_number` (round-trip fix).

## 6. Role resolution

```
resolveLearnerRole({ grade, age }):
  if grade ∈ {Form 1, Form 2, Form 3} → 'junior_learner'
  if grade ∈ {Form 4, Form 5, Form 6} → 'senior_learner'
  else if age != null → age < 16 ? 'junior_learner' : 'senior_learner'
  else → 'senior_learner'   // safe default (no parental-consent gate falsely set)

resolveRole({ role, grade, age }):
  'learner' → resolveLearnerRole(...)
  'creator' → 'creator'        // unverified; verification is a later admin step
  'parent'  → 'parent'
```

## 7. Testing

`src/auth/__regtest.js` → `runAuthSmokeTest()`, same shape/harness as
`src/models/__smoketest.js`, surfaced through the existing `SmokeBadge`. Cases:
- `resolveLearnerRole`: Form 2 → junior; Form 5 → senior; age 12 → junior;
  age 17 → senior; empty → senior.
- `resolveRole`: creator → creator; parent → parent; learner+Form1 → junior.
- `buildUserModel`: each UI role builds the right subclass; `toRow()` contains
  the role-specific columns; `publicId` carries the right prefix.
- Parent round-trip: `User.fromRow(parentRow)` restores `phone` + `icNumber`.

The existing 21/21 model smoke test must stay green.

## 8. Expo v55 note

Per `AGENTS.md`, before writing screen code, verify the specific Expo SDK 55 /
react-native-paper APIs used (Paper `TextInput`/`Button`/`Portal`/`Modal`,
`expo-linear-gradient`) against the versioned docs. Match the patterns already
proven in the Day-1 codebase (`ScreenBackground`, `LoginScreen`).
