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
