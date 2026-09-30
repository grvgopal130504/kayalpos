import { baseApi } from './baseApi';
import { createCrudApi, useNextCodePreview } from './createCrudApi';

// Authenticated CRUD for the Masters > Warehouse screens (the List page and
// the create/edit detail page) — same generic injector Outlet/Brand/etc.
// already use (see createCrudApi.js).
const { hooks } = createCrudApi({ entity: 'Warehouse', path: '/warehouses' });

export const useGetWarehousesQuery = hooks.useListQuery;
export const useGetWarehousesPageQuery = hooks.useListPageQuery;
export const useGetWarehouseQuery = hooks.useByIdQuery;
export const useCreateWarehouseMutation = hooks.useCreateMutation;
export const useUpdateWarehouseMutation = hooks.useUpdateMutation;
export const useDeleteWarehouseMutation = hooks.useDeleteMutation;

// Live "WH001"-style preview for the detail page's disabled Code field in
// "new" mode — matches warehouse.routes.js's codePrefix: 'WH' (codeLength 3,
// the crudFactory default), same convention as useNextOutletCode.
export function useNextWarehouseCode(enabled) {
  return useNextCodePreview(hooks.useListPageQuery, { prefix: 'WH', codeLength: 3, enabled });
}

// Contact Person sub-resource — not covered by createCrudApi (which only
// knows the parent Warehouse shape), so hand-rolled the same way Outlet's
// contacts are (see outletApi.js). Each invalidates the specific Warehouse
// row's tag so the detail page's GET /warehouses/:id (which includes
// `contacts`, see warehouse.routes.js's detailInclude) refetches with the
// change.
const warehouseContactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    AddWarehouseContact: builder.mutation({
      query: ({ warehouseId, ...body }) => ({ url: `/warehouses/${warehouseId}/contacts`, method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { warehouseId }) => [{ type: 'Warehouse', id: warehouseId }],
    }),
    UpdateWarehouseContact: builder.mutation({
      query: ({ warehouseId, id, ...body }) => ({ url: `/warehouses/${warehouseId}/contacts/${id}`, method: 'PUT', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { warehouseId }) => [{ type: 'Warehouse', id: warehouseId }],
    }),
    DeleteWarehouseContact: builder.mutation({
      query: ({ warehouseId, id }) => ({ url: `/warehouses/${warehouseId}/contacts/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, { warehouseId }) => [{ type: 'Warehouse', id: warehouseId }],
    }),
  }),
});

export const useAddWarehouseContactMutation = warehouseContactApi.useAddWarehouseContactMutation;
export const useUpdateWarehouseContactMutation = warehouseContactApi.useUpdateWarehouseContactMutation;
export const useDeleteWarehouseContactMutation = warehouseContactApi.useDeleteWarehouseContactMutation;
