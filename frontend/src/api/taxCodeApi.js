import { createCrudApi, useNextCodePreview } from './createCrudApi';

// Tax Code — code auto-generated (TAX001, ...), same convention as Brand/UomGroup.
const { hooks: taxCodeHooks } = createCrudApi({ entity: 'TaxCode', path: '/masters/tax-code' });

export const useGetTaxCodesQuery = taxCodeHooks.useListQuery;
export const useGetTaxCodeQuery = taxCodeHooks.useByIdQuery;
export const useCreateTaxCodeMutation = taxCodeHooks.useCreateMutation;
export const useUpdateTaxCodeMutation = taxCodeHooks.useUpdateMutation;
export const useDeleteTaxCodeMutation = taxCodeHooks.useDeleteMutation;

export function useNextTaxCodeCode(enabled) {
  return useNextCodePreview(taxCodeHooks.useListPageQuery, { prefix: 'TAX', codeLength: 3, enabled });
}
