import { createCrudApi, useNextCodePreview } from './createCrudApi';

// Masters > Employee — backed by the real backend module (see
// backend/src/modules/employee). Plain crudFactory-backed CRUD (its
// listSelect/detailInclude fold in the related Outlet's name), same
// convention as Warehouse/Brand's own API wrappers.
const { hooks } = createCrudApi({ entity: 'Employee', path: '/masters/employee' });

export const useGetEmployeesQuery = hooks.useListQuery;
export const useGetEmployeesPageQuery = hooks.useListPageQuery;
export const useGetEmployeeQuery = hooks.useByIdQuery;
export const useCreateEmployeeMutation = hooks.useCreateMutation;
export const useUpdateEmployeeMutation = hooks.useUpdateMutation;
export const useDeleteEmployeeMutation = hooks.useDeleteMutation;

// Live "EMP-001"-style preview for the Add Employee dialog's disabled Code
// field — matches employee.routes.js's codePrefix: 'EMP' (codeLength 3, the
// crudFactory default).
export function useNextEmployeeCode(enabled) {
  return useNextCodePreview(hooks.useListPageQuery, { prefix: 'EMP', codeLength: 3, enabled });
}
