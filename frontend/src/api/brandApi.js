import { createCrudApi } from './createCrudApi';

const { hooks } = createCrudApi({ entity: 'Brand', path: '/masters/brand' });

export const useGetBrandsQuery = hooks.useListQuery;
export const useGetBrandQuery = hooks.useByIdQuery;
export const useCreateBrandMutation = hooks.useCreateMutation;
export const useUpdateBrandMutation = hooks.useUpdateMutation;
export const useDeleteBrandMutation = hooks.useDeleteMutation;
