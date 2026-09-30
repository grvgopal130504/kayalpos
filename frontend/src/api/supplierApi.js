import { createCrudApi, useNextCodePreview } from './createCrudApi';

const { hooks } = createCrudApi({ entity: 'Supplier', path: '/masters/supplier' });

export const useGetSuppliersQuery = hooks.useListQuery;
export const useGetSupplierQuery = hooks.useByIdQuery;
export const useCreateSupplierMutation = hooks.useCreateMutation;
export const useUpdateSupplierMutation = hooks.useUpdateMutation;
export const useDeleteSupplierMutation = hooks.useDeleteMutation;

// Live "SUPP-0011"-style preview for the Add Supplier dialog's disabled Code
// field — matches supplier.routes.js's codePrefix: 'SUPP' (default codeLength 4).
export function useNextSupplierCode(enabled) {
  return useNextCodePreview(hooks.useListPageQuery, { prefix: 'SUPP', codeLength: 4, enabled });
}
