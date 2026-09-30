import { baseApi } from './baseApi';
import { createCrudApi, useNextCodePreview } from './createCrudApi';

// Authenticated CRUD for the Masters > Outlet screens (the List page and
// the create/edit detail page).
const { hooks } = createCrudApi({ entity: 'Outlet', path: '/outlets' });

export const useGetOutletsQuery = hooks.useListQuery;
export const useGetOutletsPageQuery = hooks.useListPageQuery;
export const useGetOutletQuery = hooks.useByIdQuery;
export const useCreateOutletMutation = hooks.useCreateMutation;
export const useUpdateOutletMutation = hooks.useUpdateMutation;
export const useDeleteOutletMutation = hooks.useDeleteMutation;

// Live "OUT001"-style preview for the detail page's disabled Code field in
// "new" mode — matches outlet.routes.js's codePrefix: 'OUT' (codeLength 3,
// the crudFactory default).
export function useNextOutletCode(enabled) {
  return useNextCodePreview(hooks.useListPageQuery, { prefix: 'OUT', codeLength: 3, enabled });
}

// Separate, unauthenticated endpoint for the login screen's outlet
// dropdown — there's no token yet at that point, so this can't reuse the
// tenant-scoped CRUD list above (which requires auth).
export const publicOutletApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublicOutlets: builder.query({
      query: () => '/outlets/public',
      transformResponse: (response) => response.data,
    }),
  }),
});

export const { useGetPublicOutletsQuery } = publicOutletApi;

// Contact Person sub-resource — not covered by createCrudApi (which only
// knows the parent Outlet shape), so hand-rolled the same way Company's
// contacts are (see companyApi.js). Each invalidates the specific Outlet
// row's tag so the detail page's GET /outlets/:id (which includes
// `contacts`, see outlet.routes.js's detailInclude) refetches with the
// change.
const outletContactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    AddOutletContact: builder.mutation({
      query: ({ outletId, ...body }) => ({ url: `/outlets/${outletId}/contacts`, method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { outletId }) => [{ type: 'Outlet', id: outletId }],
    }),
    UpdateOutletContact: builder.mutation({
      query: ({ outletId, id, ...body }) => ({ url: `/outlets/${outletId}/contacts/${id}`, method: 'PUT', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { outletId }) => [{ type: 'Outlet', id: outletId }],
    }),
    DeleteOutletContact: builder.mutation({
      query: ({ outletId, id }) => ({ url: `/outlets/${outletId}/contacts/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, { outletId }) => [{ type: 'Outlet', id: outletId }],
    }),
  }),
});

export const useAddOutletContactMutation = outletContactApi.useAddOutletContactMutation;
export const useUpdateOutletContactMutation = outletContactApi.useUpdateOutletContactMutation;
export const useDeleteOutletContactMutation = outletContactApi.useDeleteOutletContactMutation;
