import { baseApi } from './baseApi';
import { createCrudApi } from './createCrudApi';

// Authenticated CRUD for the Masters > Outlet screen.
const { hooks } = createCrudApi({ entity: 'Outlet', path: '/outlets' });

export const useGetOutletsQuery = hooks.useListQuery;
export const useGetOutletQuery = hooks.useByIdQuery;
export const useCreateOutletMutation = hooks.useCreateMutation;
export const useUpdateOutletMutation = hooks.useUpdateMutation;
export const useDeleteOutletMutation = hooks.useDeleteMutation;

// Separate, unauthenticated endpoint for the login screen's outlet
// dropdown — there's no token yet at that point, so this can't reuse the
// tenant-scoped CRUD list above (which requires auth).
export const publicOutletApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublicOutlets: builder.query({
      query: () => '/outlets/public',
      transformResponse: (response) => response.data,
    }),
  }),
});

export const { useGetPublicOutletsQuery } = publicOutletApi;
