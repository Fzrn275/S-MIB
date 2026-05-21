import { isSupabaseConfigured, supabase as defaultDb } from '../services/supabase';
import { localStore as defaultStore, keys } from '../data/localStore';
import { SEED_CHILDREN } from '../data/seedData';
import { initials, avatarColor } from '../theme/tokens';

const LRN_RE = /^LRN-\d{3,}$/;

/** Normalize a typed learner id: trim + uppercase. */
function normalizeId(raw) {
  return String(raw || '').trim().toUpperCase();
}

/** Map an RPC/profile row into the plain child view shape the screens consume. */
function childFromRow(row) {
  const level = row.level || 1;
  return {
    id: String(row.id),
    public_id: row.public_id,
    name: row.display_name || 'Learner',
    init: initials(row.display_name),
    color: avatarColor(row.id),
    grade: row.grade || '',
    school: row.school_name || '',
    level,
    rank: '',
    xp: 0,
    xpMax: level * 250,
    active: false,
    lastSeen: 'Just linked',
    active_proj: 0,
    done_proj: 0,
    badges: 0,
    streak: 0,
    goal: '',
    goalDate: '',
  };
}

export function makeParentRepo({ store = defaultStore, db = defaultDb, configured = isSupabaseConfigured() } = {}) {
  /** Read the local link cache (id -> child view) for a parent. */
  async function readLinkCache(parentId) {
    return (await store.getJSON(keys.parentLinks(parentId), {})) || {};
  }

  /**
   * Children to display: the offline seed list, overlaid with any locally-linked
   * children not already present in the seed (deduped by id). Online live reads
   * are deferred (see Day 5 spec).
   */
  async function listChildren(parent) {
    const out = [...SEED_CHILDREN];
    const seen = new Set(out.map((c) => String(c.id)));
    if (parent?.id) {
      const cache = await readLinkCache(parent.id);
      for (const child of Object.values(cache)) {
        if (!seen.has(String(child.id))) {
          out.push(child);
          seen.add(String(child.id));
        }
      }
    }
    return out;
  }

  /**
   * Look up a learner by their public LRN id. Online uses the
   * find_learner_by_public_id RPC (safe columns only); offline matches the seed.
   * Returns { found, child? , error? }.
   */
  async function lookupChildByPublicId(rawId) {
    const id = normalizeId(rawId);
    if (!LRN_RE.test(id)) {
      return { found: false, error: 'Please enter a valid Learner ID (e.g. LRN-4821)' };
    }

    if (configured && db) {
      const { data, error } = await db.rpc('find_learner_by_public_id', { p_public_id: id });
      if (error) return { found: false, error: 'Lookup failed. Please try again.' };
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) return { found: false, error: notFoundMsg };
      return { found: true, child: childFromRow(row) };
    }

    const match = SEED_CHILDREN.find((c) => normalizeId(c.public_id) === id);
    if (!match) return { found: false, error: notFoundMsg };
    return { found: true, child: match };
  }

  /**
   * Link a child to the parent. Mutates the Parent model (dedupes), caches the
   * child view locally, and (online) writes linked_child_ids on the own profile
   * row. Returns the parent so the caller can persist via setLocalUser.
   */
  async function linkChild(parent, child) {
    if (!parent || !child) throw new Error('parent and child required');
    parent.linkChild(String(child.id));

    const cache = await readLinkCache(parent.id);
    cache[String(child.id)] = child;
    await store.setJSON(keys.parentLinks(parent.id), cache);

    if (configured && db) {
      const { error } = await db
        .from('profiles')
        .update({ linked_child_ids: parent.linkedChildIds })
        .eq('id', parent.id);
      if (error) console.warn('[parentRepo] link persist failed:', error.message);
    }
    return parent;
  }

  return { listChildren, lookupChildByPublicId, linkChild };
}

const notFoundMsg =
  'No learner found with that ID. Ask your child to share their Learner ID from their Profile screen.';

export const parentRepo = makeParentRepo();
