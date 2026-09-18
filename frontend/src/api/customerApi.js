import { createCrudApi } from './createCrudApi';

const { hooks } = createCrudApi({ entity: 'Customer', path: '/customers' });

export const useGetCustomersQuery = hooks.useListQuery;
export const useGetCustomerQuery = hooks.useByIdQuery;
export const useCreateCustomerMutation = hooks.useCreateMutation;
export const useUpdateCustomerMutation = hooks.useUpdateMutation;
export const useDeleteCustomerMutation = hooks.useDeleteMutation;
