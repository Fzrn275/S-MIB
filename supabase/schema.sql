-- ============================================================================
-- S-MIB — Supabase schema (Day 2)
-- Single-table inheritance for the OOP user layer. Columns map 1:1 to
-- User.toRow() / User.fromRow() across every subclass (see src/models/).
-- Run this in the Supabase SQL editor, then follow supabase/README.md.
-- ============================================================================

-- ── profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  email             text,
  display_name      text,
  avatar_url        text,
  role              text not null default 'user'
                      check (role in (
                        'junior_learner', 'senior_learner',
                        'creator', 'verified_creator', 'content_mentor',
                        'parent', 'user'
                      )),
  public_id         text unique,
  locale            text default 'en',
  created_at        timestamptz default now(),
  updated_at        timestamptz default now(),

  -- learner (Student)
  school_name       text,
  grade             text,
  xp                integer default 0,
  level             integer default 1,
  streak            integer default 0,

  -- creator (Creator)
  organization      text,
  bio               text,
  expertise         text,
  rating            numeric default 0,
  years_experience  integer,

  -- parent (Parent)
  phone             text,
  ic_number         text,
  linked_child_ids  text[] default '{}'
);

-- ── Row Level Security ───────────────────────────────────────────────────────
alter table public.profiles enable row level security;

-- Owners can read and update their own profile.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- No INSERT policy on purpose: rows are created by the SECURITY DEFINER trigger
-- below (handle_new_user), which bypasses RLS. A limited public-read policy or a
-- safe view (display_name, public_id, role, xp, level, avatar_url) for the
-- leaderboard is deferred to Day 3.

-- ── Human-friendly public IDs (LRN-0001, CRT-0001, PRN-0001) ─────────────────
create sequence if not exists public.lrn_seq;
create sequence if not exists public.crt_seq;
create sequence if not exists public.prn_seq;
create sequence if not exists public.usr_seq;

create or replace function public.next_public_id(p_role text)
returns text
language plpgsql
as $$
declare
  prefix  text;
  seqname text;
begin
  if p_role in ('junior_learner', 'senior_learner') then
    prefix := 'LRN'; seqname := 'public.lrn_seq';
  elsif p_role in ('creator', 'verified_creator', 'content_mentor') then
    prefix := 'CRT'; seqname := 'public.crt_seq';
  elsif p_role = 'parent' then
    prefix := 'PRN'; seqname := 'public.prn_seq';
  else
    prefix := 'USR'; seqname := 'public.usr_seq';
  end if;
  return prefix || '-' || lpad(nextval(seqname)::text, 4, '0');
end;
$$;

-- ── Create the profile row from signup metadata ──────────────────────────────
-- Fires when Supabase Auth inserts the user (at signUp time, before email
-- confirmation). The app passes role + fields via signUp options.data, which
-- land in auth.users.raw_user_meta_data.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  m       jsonb;
  v_role  text;
begin
  m := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_role := coalesce(m->>'role', 'user');

  insert into public.profiles (
    id, email, display_name, role, public_id, locale,
    school_name, grade,
    organization, expertise, years_experience,
    phone, ic_number
  ) values (
    new.id,
    new.email,
    m->>'display_name',
    v_role,
    public.next_public_id(v_role),
    coalesce(m->>'locale', 'en'),
    m->>'school_name',
    m->>'grade',
    m->>'organization',
    m->>'expertise',
    nullif(m->>'years_experience', '')::integer,
    m->>'phone',
    m->>'ic_number'
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Keep updated_at fresh ────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
