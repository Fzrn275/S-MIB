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
