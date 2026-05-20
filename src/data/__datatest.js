/**
 * Runtime self-test of the Day 3 data layer (repos, services, pure helpers).
 * Mirrors src/models/__smoketest.js. Returns { ok, results }.
 * Run headlessly with `npm test data`.
 */

function check(name, fn, results) {
  return Promise.resolve()
    .then(fn)
    .then(() => results.push({ name, ok: true }))
    .catch((err) => results.push({ name, ok: false, error: err.message || String(err) }));
}

/** In-memory AsyncStorage shim for tests. */
function memStore() {
  const m = new Map();
  return {
    async getItem(k) { return m.has(k) ? m.get(k) : null; },
    async setItem(k, v) { m.set(k, v); },
    async removeItem(k) { m.delete(k); },
    _map: m,
  };
}

/** Minimal chainable Supabase fake. Records upserts/updates. */
function fakeDb(rowsByTable = {}) {
  const calls = { upserts: [], updates: [] };
  const api = {
    calls,
    from(table) {
      return {
        select() {
          const q = {
            _table: table,
            eq() { return q; },
            order() { return q; },
            limit() { return q; },
            then(resolve) { return Promise.resolve({ data: rowsByTable[table] || [], error: null }).then(resolve); },
          };
          return q;
        },
        upsert(payload, opts) { calls.upserts.push({ table, payload, opts }); return Promise.resolve({ error: null }); },
        update(payload) { return { eq() { calls.updates.push({ table, payload }); return Promise.resolve({ error: null }); } }; },
        insert(payload) { calls.upserts.push({ table, payload }); return Promise.resolve({ error: null }); },
      };
    },
  };
  return api;
}

export async function runDataSmokeTest() {
  const r = [];
  // tests added in later tasks
  const ok = r.every((x) => x.ok);
  return { ok, results: r };
}

export { memStore, fakeDb, check };
