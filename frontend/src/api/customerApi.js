import { createCrudApi, useNextCodePreview } from './createCrudApi';

const { hooks } = createCrudApi({ entity: 'Customer', path: '/customers' });

export const useGetCustomersQuery = hooks.useListQuery;
// Paginated/server-search variant — {search, page, pageSize} -> {rows, meta}.
// Used by the Line Sale customer Autocomplete (CustomerSearchBar) so a large
// customer table is searched server-side instead of loading every row into
// the browser (see useGetCustomersQuery above, which the admin Customer
// module still uses for its own table).
export const useGetCustomersPageQuery = hooks.useListPageQuery;
export const useGetCustomerQuery = hooks.useByIdQuery;
export const useCreateCustomerMutation = hooks.useCreateMutation;
export const useUpdateCustomerMutation = hooks.useUpdateMutation;
export const useDeleteCustomerMutation = hooks.useDeleteMutation;

// Live "CUS-0011"-style preview for the Add New Customer page's disabled
// Code field — matches customer.routes.js's codePrefix: 'CUS' (default codeLength 4).
export function useNextCustomerCode(enabled) {
  return useNextCodePreview(hooks.useListPageQuery, { prefix: 'CUS', codeLength: 4, enabled });
}
