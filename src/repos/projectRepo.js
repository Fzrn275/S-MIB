import { isSupabaseConfigured, supabase as defaultDb } from '../services/supabase';
import { Project } from '../models';
import { SEED_PROJECTS, SEED_STEPS } from '../data/seedData';

export function makeProjectRepo({ db = defaultDb, configured = isSupabaseConfigured() } = {}) {
  async function listProjects() {
    if (configured && db) {
      const { data, error } = await db.from('projects').select('*').eq('status', 'published').order('id');
      if (!error && data) return data.map((row) => Project.fromRow(row, []));
    }
    return SEED_PROJECTS.map((row) => Project.fromRow(row, []));
  }

  async function getProjectWithSteps(id) {
    if (configured && db) {
      const { data: pRows, error } = await db.from('projects').select('*').eq('id', id).limit(1);
      const pRow = !error && pRows ? pRows[0] : null;
      if (pRow) {
        const { data: sRows } = await db.from('steps').select('*').eq('project_id', id).order('step_n');
        return Project.fromRow(pRow, sRows || []);
      }
    }
    const seedP = SEED_PROJECTS.find((row) => String(row.id) === String(id));
    if (!seedP) return null;
    return Project.fromRow(seedP, SEED_STEPS[seedP.id] || []);
  }

  return { listProjects, getProjectWithSteps };
}

export const projectRepo = makeProjectRepo();
