import { createCrudApi, useNextCodePreview } from './createCrudApi';

// Masters > Price List — backed by the real backend module (see
// backend/src/modules/price-list). The backend route doesn't use
// utils/crudFactory.js (it needs the basePriceList self-relation join and
// the computed itemCount), but its response shapes match crudFactory's
// exactly, so the generic createCrudApi injector below still works.
const { hooks } = createCrudApi({ entity: 'PriceList', path: '/masters/price-list' });

export const useGetPriceListsQuery = hooks.useListQuery;
export const useGetPriceListsPageQuery = hooks.useListPageQuery;
export const useGetPriceListQuery = hooks.useByIdQuery;
export const useCreatePriceListMutation = hooks.useCreateMutation;
export const useUpdatePriceListMutation = hooks.useUpdateMutation;
export const useDeletePriceListMutation = hooks.useDeleteMutation;

// Live "PL-001"-style preview for the Add Price List dialog's disabled Code
// field — matches priceList.service.js's nextCode(): prefix 'PL', 3 digits.
export function useNextPriceListCode(enabled) {
  return useNextCodePreview(hooks.useListPageQuery, { prefix: 'PL', codeLength: 3, enabled });
}
