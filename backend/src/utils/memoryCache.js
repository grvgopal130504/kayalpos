/**
 * Minimal in-process TTL cache — no external dependency (node-cache/lru-cache
 * etc. would be one more package for something ~15 lines does). Used to
 * absorb bursty repeat reads of the same list query (e.g. a page re-rendering,
 * multiple tabs open) without hammering Postgres, while staying correct: any
 * write through the same router clears the whole cache instance immediately
 * (see crudFactory.js), so nobody ever reads stale data after a save/delete.
 *
 * Deliberately process-local, not shared across server instances — fine for
 * this app's current single-instance deployment. If it's ever horizontally
 * scaled, swap this for a shared cache (Redis) rather than trusting
 * per-instance TTLs to agree.
 */
export function createMemoryCache({ ttlMs = 15_000 } = {}) {
  const store = new Map();

  return {
    get(key) {
      const entry = store.get(key);
      if (!entry) return undefined;
      if (entry.expiresAt < Date.now()) {
        store.delete(key);
        return undefined;
      }
      return entry.value;
    },
    set(key, value) {
      store.set(key, { value, expiresAt: Date.now() + ttlMs });
    },
    clear() {
      store.clear();
    },
  };
}
