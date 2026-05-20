import { isSupabaseConfigured, supabase as defaultDb } from '../services/supabase';
import { localStore as defaultStore, keys } from '../data/localStore';
import { Progress } from '../models';
import { SEED_DEMO_PROGRESS } from '../data/seedData';

export function makeProgressRepo({ store = defaultStore, db = defaultDb, configured = isSupabaseConfigured() } = {}) {
  async function getAllProgress(userId) {
    const cache = (await store.getJSON(keys.progress(userId), {})) || {};

    if (configured && db) {
      const { data, error } = await db.from('progress').select('*').eq('user_id', userId);
      if (!error && data) {
        const map = {};
        data.forEach((row) => { map[row.project_id] = row; });              // remote baseline
        Object.values(cache).forEach((row) => { map[row.project_id] = row; }); // local wins (write-through, LWW)
        await store.setJSON(keys.progress(userId), map);
        return Object.values(map).map(Progress.fromRow);
      }
      return Object.values(cache).map(Progress.fromRow);
    }

    // Offline: seed demo defaults, overlaid by local cache (cache wins).
    const map = {};
    SEED_DEMO_PROGRESS.forEach((row) => { map[row.project_id] = { ...row, user_id: userId }; });
    Object.values(cache).forEach((row) => { map[row.project_id] = row; });
    return Object.values(map).map(Progress.fromRow);
  }

  async function getProgress(userId, projectId) {
    const all = await getAllProgress(userId);
    return all.find((p) => String(p.projectId) === String(projectId)) || null;
  }

  async function saveProgress(progress) {
    const row = progress.toRow();
    const userId = row.user_id;

    const cache = (await store.getJSON(keys.progress(userId), {})) || {};
    cache[row.project_id] = row;
    await store.setJSON(keys.progress(userId), cache);

    if (configured && db) {
      let payload = row;
      if (row.id == null) { const { id, ...rest } = row; payload = rest; }
      const { error } = await db.from('progress').upsert(payload, { onConflict: 'user_id,project_id' });
      if (error) console.warn('[progressRepo] upsert failed:', error.message);
    }
    return progress;
  }

  return { getAllProgress, getProgress, saveProgress };
}

export const progressRepo = makeProgressRepo();
