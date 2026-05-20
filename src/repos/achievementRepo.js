import { isSupabaseConfigured, supabase as defaultDb } from '../services/supabase';
import { SEED_BADGES, SEED_EARNED_CODES } from '../data/seedData';

export function makeAchievementRepo({ db = defaultDb, configured = isSupabaseConfigured() } = {}) {
  async function listCatalog() {
    if (configured && db) {
      const { data, error } = await db.from('achievements').select('*');
      if (!error && data && data.length) return data;
    }
    return SEED_BADGES;
  }

  async function listEarnedCodes(userId) {
    if (configured && db) {
      const { data, error } = await db.from('user_achievements').select('achievement_code').eq('user_id', userId);
      if (!error && data) return data.map((row) => row.achievement_code);
    }
    return SEED_EARNED_CODES;
  }

  return { listCatalog, listEarnedCodes };
}

export const achievementRepo = makeAchievementRepo();
