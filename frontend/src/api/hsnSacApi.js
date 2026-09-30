import { createCrudApi } from './createCrudApi';

// HSN/SAC — code is user-entered (10019010, 995433, ...), not auto-generated;
// see backend/src/modules/hsn-sac/hsnSac.routes.js's comment for why no
// codePrefix is used here either.
const { hooks: hsnSacHooks } = createCrudApi({ entity: 'HsnSac', path: '/masters/hsn-sac' });

export const useGetHsnSacCodesQuery = hsnSacHooks.useListQuery;
export const useGetHsnSacQuery = hsnSacHooks.useByIdQuery;
export const useCreateHsnSacMutation = hsnSacHooks.useCreateMutation;
export const useUpdateHsnSacMutation = hsnSacHooks.useUpdateMutation;
export const useDeleteHsnSacMutation = hsnSacHooks.useDeleteMutation;
