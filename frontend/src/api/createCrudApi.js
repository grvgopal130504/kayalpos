import { useEffect, useRef, useState } from 'react';
import { baseApi } from './baseApi';
import { saveListSnapshot, buildListCacheKey } from './offlineCache';

/**
 * Generic RTK Query CRUD injector — the frontend half of the backend's
 * crudFactory.js. Every master-data module (Brand, Product, Supplier, ...)
 * hits the same list/get/create/update/delete shape against its own path,
 * so this one factory replaces a hand-written *Api.js per module.
 *
 * Endpoint keys are namespaced by `entity` (e.g. "Brand") because every
 * module injects into the SAME baseApi instance — plain names like "list"
 * or "create" would collide across modules.
 *
 * @param {object} opts
 * @param {string} opts.entity - PascalCase entity name, e.g. 'Brand'. Used
 *   to build unique endpoint keys and the RTK Query tag type.
 * @param {string} opts.path - API path, e.g. '/masters/brand'.
 */
export function createCrudApi({ entity, path }) {
  const tagType = entity;

  const api = baseApi.injectEndpoints({
    endpoints: (builder) => ({
      [`${entity}List`]: builder.query({
        query: (params) => ({ url: path, params }),
        transformResponse: (response) => response.data,
        providesTags: (result = []) => [
          ...result.map((row) => ({ type: tagType, id: row.id })),
          { type: tagType, id: 'LIST' },
        ],
        // Persist every successful list response into IndexedDB (see
        // offlineCache.js) so a later network failure — offline, backend
        // briefly down — can still show the last known-good data instead of
        // a blank error state.
        async onQueryStarted(params, { queryFulfilled }) {
          try {
            const { data } = await queryFulfilled;
            saveListSnapshot(buildListCacheKey(entity, params), entity, data);
          } catch {
            // Request failed — nothing new to cache; consumers fall back to
            // whatever snapshot (if any) is already saved.
          }
        },
      }),
      // Paginated variant of the list query, for infinite-scroll / large
      // datasets — kept separate from `${entity}List` above so every
      // existing page that calls the plain list hook (expecting a flat
      // array with no `meta`) is completely unaffected. Only used once a
      // page opts into `useInfiniteList` below.
      [`${entity}ListPage`]: builder.query({
        query: (params) => ({ url: path, params }),
        transformResponse: (response) => ({ rows: response.data, meta: response.meta }),
        providesTags: (result) => [
          ...(result?.rows || []).map((row) => ({ type: tagType, id: row.id })),
          { type: tagType, id: 'LIST' },
        ],
      }),
      [`${entity}ById`]: builder.query({
        query: (id) => `${path}/${id}`,
        transformResponse: (response) => response.data,
        providesTags: (result, error, id) => [{ type: tagType, id }],
      }),
      [`${entity}Create`]: builder.mutation({
        query: (body) => ({ url: path, method: 'POST', body }),
        transformResponse: (response) => response.data,
        invalidatesTags: [{ type: tagType, id: 'LIST' }],
      }),
      [`${entity}Update`]: builder.mutation({
        query: ({ id, ...body }) => ({ url: `${path}/${id}`, method: 'PUT', body }),
        transformResponse: (response) => response.data,
        invalidatesTags: (result, error, { id }) => [{ type: tagType, id }, { type: tagType, id: 'LIST' }],
      }),
      [`${entity}Delete`]: builder.mutation({
        query: (id) => ({ url: `${path}/${id}`, method: 'DELETE' }),
        invalidatesTags: (result, error, id) => [{ type: tagType, id }, { type: tagType, id: 'LIST' }],
      }),
    }),
  });

  return {
    api,
    hooks: {
      useListQuery: api[`use${entity}ListQuery`],
      useListPageQuery: api[`use${entity}ListPageQuery`],
      useByIdQuery: api[`use${entity}ByIdQuery`],
      useCreateMutation: api[`use${entity}CreateMutation`],
      useUpdateMutation: api[`use${entity}UpdateMutation`],
      useDeleteMutation: api[`use${entity}DeleteMutation`],
    },
  };
}

/**
 * Live preview of the code a new record will get, shown in the disabled
 * "Code" field on an Add form instead of a bare "Auto generated" label — so
 * the user sees e.g. "CUS0011" before they even save. Mirrors the backend's
 * own count-based nextCode() in crudFactory.js exactly (same PREFIXNNNN
 * shape, same "count of existing tenant rows + 1" logic), so the preview
 * matches what gets saved in the common case; it's still only a preview,
 * not a reservation, so a second admin saving at the same moment could in
 * theory land on the same number — see crudFactory's own doc comment on why
 * that's an accepted tradeoff for now.
 *
 * Uses a page=1/pageSize=1 call to the SAME paginated endpoint used for
 * infinite-scroll, purely to read `meta.total` cheaply — it never fetches
 * real rows for this.
 *
 * @param {Function} useListPageQuery - e.g. hooks.useListPageQuery from createCrudApi
 * @param {object} opts
 * @param {string} opts.prefix - e.g. 'CUS' (bare, no dash — matches crudFactory's codePrefix)
 * @param {number} [opts.codeLength] - zero-pad width (default 4, matching crudFactory's default)
 * @param {boolean} [opts.enabled] - pass false (e.g. in Edit mode, or while the dialog is closed) to skip the request entirely
 */
export function useNextCodePreview(useListPageQuery, { prefix, codeLength = 4, enabled = true }) {
  const { data, isFetching } = useListPageQuery({ page: 1, pageSize: 1 }, { skip: !enabled });
  if (!enabled || isFetching || !data) return null;
  const total = data.meta?.total ?? 0;
  return `${prefix}${String(total + 1).padStart(codeLength, '0')}`;
}

/**
 * Client-side "infinite scroll" over a paginated list endpoint (the
 * `useListPageQuery` hook from createCrudApi). Accumulates pages into one
 * array as `loadMore()` is called, rather than pulling RTK Query's newer
 * (and, as of this app's RTK version, less battle-tested) built-in infinite
 * query API — this is a small, easy-to-follow amount of code doing exactly
 * one thing.
 *
 * Only worth using once a table's row count crosses roughly 1,000 — below
 * that, the plain `useListQuery` (single unpaginated call, already
 * server-capped at 1,000 rows — see backend/src/utils/crudFactory.js) is
 * simpler and fine.
 *
 * @param {Function} useListPageQuery - e.g. hooks.useListPageQuery from createCrudApi
 * @param {object} baseParams - filters other than page/pageSize (search, status, ...)
 * @param {number} [pageSize]
 * @param {boolean} [enabled] - pass false to skip firing the query entirely
 *   (e.g. while a cheaper check has already established the dataset is small
 *   enough not to need pagination) — avoids a wasted request in the common case.
 */
export function useInfiniteList(useListPageQuery, baseParams = {}, pageSize = 100, enabled = true) {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const paramsKey = JSON.stringify(baseParams);
  const prevParamsKey = useRef(paramsKey);

  // Filters changed (new search/status) — start over from page 1 instead of
  // appending onto results from a different filter set.
  if (prevParamsKey.current !== paramsKey) {
    prevParamsKey.current = paramsKey;
    if (page !== 1) setPage(1);
    if (rows.length) setRows([]);
  }

  const { data, isFetching, isError } = useListPageQuery({ ...baseParams, page, pageSize }, { skip: !enabled });

  useEffect(() => {
    if (!data) return;
    setRows((prev) => (page === 1 ? data.rows : [...prev, ...data.rows]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, page]);

  const total = data?.meta?.total ?? rows.length;
  const hasMore = rows.length < total;

  return {
    rows,
    total,
    hasMore,
    isFetching,
    isError,
    loadMore: () => { if (hasMore && !isFetching) setPage((p) => p + 1); },
  };
}
