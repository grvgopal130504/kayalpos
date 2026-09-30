import { createCrudApi } from './createCrudApi';

// Masters > Selling Price — backed by the real backend module (see
// backend/src/modules/selling-price). No `codePrefix` here (SellingPrice has
// no `code` field, unlike Brand/Product/Outlet) so there's no
// useNextCodePreview export to go with it.
//
// The backend route (sellingPrice.routes.js) doesn't use utils/crudFactory.js
// — it has its own list/get/create/update/delete with Product/Outlet joins
// and server-side price recalculation — but its response shapes
// ({success,data} / {success,data,meta}) match crudFactory's exactly, so the
// generic createCrudApi injector below still works against it unchanged.
const { hooks } = createCrudApi({ entity: 'SellingPrice', path: '/masters/selling-price' });

export const useGetSellingPricesQuery = hooks.useListQuery;
export const useGetSellingPricesPageQuery = hooks.useListPageQuery;
export const useGetSellingPriceQuery = hooks.useByIdQuery;
export const useCreateSellingPriceMutation = hooks.useCreateMutation;
export const useUpdateSellingPriceMutation = hooks.useUpdateMutation;
export const useDeleteSellingPriceMutation = hooks.useDeleteMutation;
