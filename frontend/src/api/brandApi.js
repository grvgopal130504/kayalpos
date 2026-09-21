import { createCrudApi, useNextCodePreview } from './createCrudApi';

const { hooks } = createCrudApi({ entity: 'Brand', path: '/masters/brand' });

export const useGetBrandsQuery = hooks.useListQuery;
export const useGetBrandQuery = hooks.useByIdQuery;
export const useCreateBrandMutation = hooks.useCreateMutation;
export const useUpdateBrandMutation = hooks.useUpdateMutation;
export const useDeleteBrandMutation = hooks.useDeleteMutation;

// Live "BR-0011"-style preview for the Add Brand dialog's disabled Code
// field — matches brand.routes.js's codePrefix: 'BR' (default codeLength 4).
export function useNextBrandCode(enabled) {
  return useNextCodePreview(hooks.useListPageQuery, { prefix: 'BR', codeLength: 4, enabled });
}
