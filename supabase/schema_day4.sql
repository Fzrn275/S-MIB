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
