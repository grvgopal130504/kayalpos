import { baseApi } from './baseApi';

// Hand-rolled (not createCrudApi) for the same reason as Promotion/GiftVoucher
// — the list needs a `status` query param and edit mode always resubmits the
// full form, matching those modules' shape rather than the generic
// crudFactory pattern's flat master-data assumptions.
const loyaltyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    LoyaltyProgramList: builder.query({
      query: (params) => ({ url: '/loyalty-programs', params }),
      transformResponse: (response) => response.data,
      providesTags: (result = []) => [
        ...result.map((row) => ({ type: 'LoyaltyProgram', id: row.id })),
        { type: 'LoyaltyProgram', id: 'LIST' },
      ],
    }),
    LoyaltyProgramById: builder.query({
      query: (id) => `/loyalty-programs/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'LoyaltyProgram', id }],
    }),
    NextLoyaltyProgramCode: builder.query({
      query: () => '/loyalty-programs/next-code',
      transformResponse: (response) => response.data.code,
      providesTags: [{ type: 'LoyaltyProgram', id: 'NEXT' }],
    }),
    LoyaltyProgramCreate: builder.mutation({
      query: (body) => ({ url: '/loyalty-programs', method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: [{ type: 'LoyaltyProgram', id: 'LIST' }, { type: 'LoyaltyProgram', id: 'NEXT' }],
    }),
    LoyaltyProgramUpdate: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/loyalty-programs/${id}`, method: 'PUT', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { id }) => [{ type: 'LoyaltyProgram', id }, { type: 'LoyaltyProgram', id: 'LIST' }],
    }),
    LoyaltyProgramDelete: builder.mutation({
      query: (id) => ({ url: `/loyalty-programs/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [{ type: 'LoyaltyProgram', id }, { type: 'LoyaltyProgram', id: 'LIST' }],
    }),
  }),
});

export const useGetLoyaltyProgramsQuery = loyaltyApi.useLoyaltyProgramListQuery;
export const useGetLoyaltyProgramQuery = loyaltyApi.useLoyaltyProgramByIdQuery;
export const useNextLoyaltyProgramCodeQuery = loyaltyApi.useNextLoyaltyProgramCodeQuery;
export const useCreateLoyaltyProgramMutation = loyaltyApi.useLoyaltyProgramCreateMutation;
export const useUpdateLoyaltyProgramMutation = loyaltyApi.useLoyaltyProgramUpdateMutation;
export const useDeleteLoyaltyProgramMutation = loyaltyApi.useLoyaltyProgramDeleteMutation;
