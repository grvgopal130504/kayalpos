import { createCrudApi, useNextCodePreview } from './createCrudApi';

// UOM Group — code auto-generated (GRP0001, ...), same convention as Brand.
const { hooks: uomGroupHooks } = createCrudApi({ entity: 'UomGroup', path: '/masters/uom-groups' });

export const useGetUomGroupsQuery = uomGroupHooks.useListQuery;
export const useGetUomGroupQuery = uomGroupHooks.useByIdQuery;
export const useCreateUomGroupMutation = uomGroupHooks.useCreateMutation;
export const useUpdateUomGroupMutation = uomGroupHooks.useUpdateMutation;
export const useDeleteUomGroupMutation = uomGroupHooks.useDeleteMutation;

export function useNextUomGroupCode(enabled) {
  return useNextCodePreview(uomGroupHooks.useListPageQuery, { prefix: 'GRP', codeLength: 3, enabled });
}

// UOM — code is user-entered (KG, PC, LTR, ...), not auto-generated; see
// backend/src/modules/uom/uom.routes.js's comment for why no codePrefix is
// used here either.
const { hooks: uomHooks } = createCrudApi({ entity: 'Uom', path: '/masters/uom' });

export const useGetUomsQuery = uomHooks.useListQuery;
export const useGetUomQuery = uomHooks.useByIdQuery;
export const useCreateUomMutation = uomHooks.useCreateMutation;
export const useUpdateUomMutation = uomHooks.useUpdateMutation;
export const useDeleteUomMutation = uomHooks.useDeleteMutation;
