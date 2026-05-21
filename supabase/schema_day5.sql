-- ============================================================================
-- S-MIB — Supabase schema (Day 5): parent flow.
-- No new tables: `profiles.linked_child_ids` already exists (schema.sql) and
-- `profiles_update_own` already lets a parent write their own row. This adds a
-- single narrow lookup so a parent can find a learner by their public LRN id
-- WITHOUT a broad profiles read policy. Run AFTER schema.sql.
-- ============================================================================

-- find_learner_by_public_id(text)
-- SECURITY DEFINER bypasses RLS, but the function returns only non-sensitive
-- columns and only matches learner roles — so it cannot be used to read another
-- user's private data (xp, email, parent/creator fields, etc.). It is the only
-- cross-user read the parent flow performs; live progress reads stay owner-only.
create or replace function public.find_learner_by_public_id(p_public_id text)
returns table (
  id           uuid,
  display_name text,
  school_name  text,
  grade        text,
  level        integer,
  public_id    text
)
language sql
security definer
set search_path = public
as $$
  select p.id, p.display_name, p.school_name, p.grade, p.level, p.public_id
  from public.profiles p
  where p.public_id = upper(trim(p_public_id))
    and p.role in ('junior_learner', 'senior_learner')
  limit 1;
$$;

-- Only signed-in users may call it (not anon); never the broad public.
revoke all on function public.find_learner_by_public_id(text) from public;
grant execute on function public.find_learner_by_public_id(text) to authenticated;
