import { createCrudApi } from './createCrudApi';

// Tax Code — the code is user-entered (not auto-generated).
const { hooks: taxCodeHooks } = createCrudApi({ entity: 'TaxCode', path: '/masters/tax-code' });

export const useGetTaxCodesQuery = taxCodeHooks.useListQuery;
export const useGetTaxCodeQuery = taxCodeHooks.useByIdQuery;
export const useCreateTaxCodeMutation = taxCodeHooks.useCreateMutation;
export const useUpdateTaxCodeMutation = taxCodeHooks.useUpdateMutation;
export const useDeleteTaxCodeMutation = taxCodeHooks.useDeleteMutation;
