import { createCrudApi } from './createCrudApi';

// Masters > Batch or Serial Number — backed by the real backend module (see
// backend/src/modules/batch-serial). No `code` field on this master (a
// batch/serial row is identified by its own `number`, not a system-generated
// code), so there's no useNextCodePreview export to go with it, same as
// Selling Price. The backend route doesn't use utils/crudFactory.js (it
// needs the Product/Warehouse joins and the five-tile stats aggregate), but
// its response shapes match crudFactory's exactly, so the generic
// createCrudApi injector below still works.
const { hooks } = createCrudApi({ entity: 'BatchSerial', path: '/masters/batch-serial' });

export const useGetBatchSerialsQuery = hooks.useListQuery;
export const useGetBatchSerialsPageQuery = hooks.useListPageQuery;
export const useGetBatchSerialQuery = hooks.useByIdQuery;
export const useCreateBatchSerialMutation = hooks.useCreateMutation;
export const useUpdateBatchSerialMutation = hooks.useUpdateMutation;
export const useDeleteBatchSerialMutation = hooks.useDeleteMutation;
