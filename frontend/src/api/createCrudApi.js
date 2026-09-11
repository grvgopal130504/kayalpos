import { baseApi } from './baseApi';

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
      useByIdQuery: api[`use${entity}ByIdQuery`],
      useCreateMutation: api[`use${entity}CreateMutation`],
      useUpdateMutation: api[`use${entity}UpdateMutation`],
      useDeleteMutation: api[`use${entity}DeleteMutation`],
    },
  };
}
