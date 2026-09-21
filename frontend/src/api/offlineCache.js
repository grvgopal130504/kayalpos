import Dexie from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';

/**
 * IndexedDB-backed offline cache for list queries, via Dexie (a thin,
 * well-established wrapper over the native IndexedDB API — chosen instead of
 * hand-rolling raw IndexedDB, which is notoriously painful to get right).
 *
 * This is deliberately separate from RTK Query's own (in-memory, cleared on
 * reload) cache: RTK Query answers "do I already have this in memory for
 * this session", Dexie answers "what was the last successful snapshot, even
 * across a reload or while the API is unreachable". Every entity built on
 * createCrudApi.js gets this for free — see its `onQueryStarted` — so this
 * file has no per-module code to duplicate.
 */
const db = new Dexie('nexora-pos-offline-cache');
db.version(1).stores({
  // `key` = `${entity}:${JSON.stringify(params)}` — one row per distinct
  // list query (e.g. Product list with no filters, Product list filtered by
  // status=ACTIVE are stored separately, exactly like RTK Query's own cache
  // keys work).
  listSnapshots: 'key, entity, savedAt',
});

export async function saveListSnapshot(key, entity, rows) {
  try {
    await db.listSnapshots.put({ key, entity, rows, savedAt: Date.now() });
  } catch {
    // IndexedDB can be unavailable (private browsing, storage quota, etc.) —
    // this cache is a resilience nice-to-have, never a hard dependency, so a
    // failed write is silently ignored rather than surfaced as an app error.
  }
}

export async function getListSnapshot(key) {
  try {
    return await db.listSnapshots.get(key);
  } catch {
    return undefined;
  }
}

/** Reactive read of the last saved snapshot for a given cache key, or undefined. */
export function useOfflineListSnapshot(key) {
  return useLiveQuery(() => db.listSnapshots.get(key), [key]);
}

export function buildListCacheKey(entity, params) {
  return `${entity}:${JSON.stringify(params || {})}`;
}
