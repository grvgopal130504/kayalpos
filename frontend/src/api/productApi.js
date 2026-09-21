import { createCrudApi, useInfiniteList, useNextCodePreview } from './createCrudApi';

const { api, hooks } = createCrudApi({ entity: 'Product', path: '/masters/product' });

// Bulk-import endpoint — one call per chunk from ProductBulkImportDialog.
// Kept as its own injected mutation (rather than part of createCrudApi,
// which every module shares) since bulk import is Product-specific for now.
const productBulkApi = api.injectEndpoints({
  endpoints: (builder) => ({
    ProductBulkImport: builder.mutation({
      // arg: { rows, invalidate } — callers pass invalidate: false for every
      // chunk except the last one, so a multi-chunk import doesn't refetch
      // the list after every single chunk.
      query: ({ rows }) => ({ url: '/masters/product/bulk', method: 'POST', body: { rows } }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, arg) => (arg?.invalidate === false ? [] : [{ type: 'Product', id: 'LIST' }]),
    }),
  }),
});

export const useGetProductsQuery = hooks.useListQuery;
export const useGetProductQuery = hooks.useByIdQuery;
export const useCreateProductMutation = hooks.useCreateMutation;
export const useUpdateProductMutation = hooks.useUpdateMutation;
export const useDeleteProductMutation = hooks.useDeleteMutation;
export const useProductBulkImportMutation = productBulkApi.useProductBulkImportMutation;

// Infinite-scroll variant for once the product catalog is large (see
// useInfiniteList's own doc comment) — kicks in past ~1,000 rows.
export function useInfiniteProducts(baseParams, pageSize, enabled) {
  return useInfiniteList(hooks.useListPageQuery, baseParams, pageSize, enabled);
}

// Live "PROD-0011"-style preview for the Add Product dialog's disabled Code
// field — matches product.routes.js's codePrefix: 'PROD', codeLength: 4.
export function useNextProductCode(enabled) {
  return useNextCodePreview(hooks.useListPageQuery, { prefix: 'PROD', codeLength: 4, enabled });
}
