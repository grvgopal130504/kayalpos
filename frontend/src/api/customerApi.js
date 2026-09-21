import { createCrudApi, useNextCodePreview } from './createCrudApi';

const { hooks } = createCrudApi({ entity: 'Customer', path: '/customers' });

export const useGetCustomersQuery = hooks.useListQuery;
export const useGetCustomerQuery = hooks.useByIdQuery;
export const useCreateCustomerMutation = hooks.useCreateMutation;
export const useUpdateCustomerMutation = hooks.useUpdateMutation;
export const useDeleteCustomerMutation = hooks.useDeleteMutation;

// Live "CUS-0011"-style preview for the Add New Customer page's disabled
// Code field — matches customer.routes.js's codePrefix: 'CUS' (default codeLength 4).
export function useNextCustomerCode(enabled) {
  return useNextCodePreview(hooks.useListPageQuery, { prefix: 'CUS', codeLength: 4, enabled });
}
