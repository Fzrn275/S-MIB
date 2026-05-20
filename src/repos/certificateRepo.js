import { isSupabaseConfigured, supabase as defaultDb } from '../services/supabase';
import { localStore as defaultStore, keys } from '../data/localStore';
import { Certificate } from '../models';

export function makeCertificateRepo({ store = defaultStore, db = defaultDb, configured = isSupabaseConfigured() } = {}) {
  async function listCertificates(userId) {
    const cache = (await store.getJSON(keys.certs(userId), [])) || [];

    if (configured && db) {
      const { data, error } = await db.from('certificates').select('*').eq('user_id', userId);
      if (!error && data) {
        // Merge remote with local cache (write-through, LWW): keep any locally
        // issued cert the remote hasn't returned yet so dedup stays correct.
        const map = {};
        cache.forEach((row) => { map[row.project_id] = row; });
        data.forEach((row) => { map[row.project_id] = row; });
        const merged = Object.values(map);
        await store.setJSON(keys.certs(userId), merged);
        return merged.map(Certificate.fromRow);
      }
    }
    return cache.map(Certificate.fromRow);
  }

  async function issueCertificate(cert) {
    const row = cert.toRow();
    const userId = row.user_id;
    const existing = await listCertificates(userId);
    const dup = existing.find((c) => String(c.projectId) === String(row.project_id));
    if (dup) return dup;

    const cache = (await store.getJSON(keys.certs(userId), [])) || [];
    cache.push(row);
    await store.setJSON(keys.certs(userId), cache);

    if (configured && db) {
      let payload = row;
      if (row.id == null) { const { id, ...rest } = row; payload = rest; }
      const { error } = await db.from('certificates').upsert(payload, { onConflict: 'user_id,project_id' });
      if (error) console.warn('[certificateRepo] upsert failed:', error.message);
    }
    return cert;
  }

  return { listCertificates, issueCertificate };
}

export const certificateRepo = makeCertificateRepo();
