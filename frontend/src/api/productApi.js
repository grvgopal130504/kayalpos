import { createCrudApi } from './createCrudApi';

const { hooks } = createCrudApi({ entity: 'Product', path: '/masters/product' });

export const useGetProductsQuery = hooks.useListQuery;
export const useGetProductQuery = hooks.useByIdQuery;
export const useCreateProductMutation = hooks.useCreateMutation;
export const useUpdateProductMutation = hooks.useUpdateMutation;
export const useDeleteProductMutation = hooks.useDeleteMutation;
