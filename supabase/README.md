# Supabase setup — S-MIB

The app runs in **offline demo mode** until these credentials are set, so this
is optional for local dogfooding. Follow it to enable real sign-up / sign-in.

## 1. Create a project
Create a project at <https://supabase.com/dashboard>. Note the **Project URL**
and the **anon public** key (Project Settings → API).

## 2. Run the schema
Open **SQL Editor**, paste the contents of [`schema.sql`](./schema.sql), and run
it. This creates `public.profiles`, its RLS policies, the per-role public-ID
sequences, and the `handle_new_user` / `set_updated_at` triggers.

## 3. Require email confirmation
**Authentication → Providers → Email**: enable **Confirm email**. This makes
`signUp` send a verification email and withhold the session until the code is
entered (the RegVerify screen).

## 4. Send a 6-digit code (not a magic link)
The RegVerify screen calls `verifyOtp({ type: 'signup' })`, which checks a code —
not a link. **Authentication → Email Templates → Confirm signup**: replace the
default body with one that surfaces the token, e.g.:

```html
<h2>Confirm your S-MIB account</h2>
<p>Your verification code is:</p>
<p style="font-size:24px;font-weight:bold;letter-spacing:4px">{{ .Token }}</p>
<p>This code expires in 10 minutes.</p>
```

The key piece is `{{ .Token }}` — it renders the 6-digit OTP.

## 5. Wire the app
Copy `.env.example` to `.env` and fill in:

```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

Restart the Expo dev server. `isSupabaseConfigured()` will now be true and the
login/registration screens switch from offline-demo behavior to the real
Supabase auth path.

## Day 3 — projects, steps, progress & badges
Day 3 adds the learner project flow. Run these in the **SQL Editor** in order,
after the Day 2 [`schema.sql`](./schema.sql):

1. [`schema.sql`](./schema.sql) — Day 2 base (`profiles`, RLS, sequences). Skip
   if you already ran it.
2. [`schema_day3.sql`](./schema_day3.sql) — `projects`, `steps`, `progress`,
   `certificates`, `achievements`, `user_achievements`, the
   `profiles.last_active_on` column, and their RLS policies.
3. [`seed.sql`](./seed.sql) — global shared data only: 12 published projects,
   their steps, and the 16-badge catalog. It also bumps the projects id
   sequence so new creator projects don't collide with the seeded ids.

### Optional: a demo learner with progress
The bottom of [`seed.sql`](./seed.sql) has a commented-out block that backfills
one learner's progress and earned badges. To use it: register a learner in the
app first, then edit the email in that block (`'demo@smib.app'` → the learner's
real email), uncomment it, and run it on its own.

Real learners are **not** seeded — they start with empty progress and zero
earned badges, and accrue XP, levels, streaks and certificates as they complete
steps. Until the credentials in step 5 are set, the app reads its offline seed
(`src/data/seedData.js`) instead of these tables.

## Day 4 — creator authoring
Day 4 lets creators author and manage their own projects + steps. Run this in
the **SQL Editor** after [`schema_day3.sql`](./schema_day3.sql) (and `seed.sql`):

4. [`schema_day4.sql`](./schema_day4.sql) — adds creator-write RLS:
   INSERT/UPDATE/DELETE on `projects` for the owning creator (`creator_id =
   auth.uid()`), and INSERT/UPDATE/DELETE on `steps` whose parent project the
   caller owns. **No new tables and no new seed** — creators author their own
   content from the app, so there is nothing to pre-populate.

The Day 3 `seed.sql` already bumps the projects id sequence so creator-authored
projects don't collide with the seeded ids. Until the credentials in step 5 are
set, creator authoring runs against the offline store (`src/data/localStore.js`)
instead of these tables.

## Day 5 — parent flow
Day 5 adds the parent experience (link a child, view their progress). Run this in
the **SQL Editor** after [`schema_day4.sql`](./schema_day4.sql):

5. [`schema_day5.sql`](./schema_day5.sql) — adds one `find_learner_by_public_id`
   SECURITY DEFINER function so a parent can look up a learner by their public
   `LRN-####` id (returning only `display_name`, `school_name`, `grade`, `level`,
   `public_id` — no private data). Linking writes the id into the parent's own
   `linked_child_ids` via the existing `profiles_update_own` policy. **No new
   tables.**

Children's progress is **not** read live online in this build (no cross-user
progress RLS): the parent dashboard, child progress, activity feed and
notifications run from the offline seed (`src/data/seedData.js`) so the demo works
without a second linked account. The link lookup itself is real when the
credentials in step 5 are set.

## How registration maps to the DB
1. `RegStep2` → `supabase.auth.signUp(email, password, { data: metadata })`,
   where `metadata` carries the resolved `role` plus the role-specific fields.
2. The `on_auth_user_created` trigger inserts the matching `profiles` row and
   assigns a `public_id` (`LRN-/CRT-/PRN-####`).
3. `RegVerify` → `verifyOtp` confirms the email and establishes the session.
4. `RegSuccess` → `refreshProfile()` hydrates the `User` model and enters the app.

## Notes
- `years_experience` is stored on `profiles` but is not yet read back into the
  OOP model (no model field for it). It's there for future use.
- A public/leaderboard read policy is intentionally **not** included — owner-only
  RLS for Day 2. Add it in Day 3 when the leaderboard needs it.
