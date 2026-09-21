import { baseApi } from './baseApi';

// Hand-rolled (not createCrudApi) because Promotion's list needs a `status`
// query param that's computed live on the backend (active/upcoming/expired
// derived from dates — see backend/src/modules/promotion/promotion.service's
// computeStatus()), not a stored column the generic crudFactory pattern
// assumes. Everything else follows the same list/get/create/update/delete
// shape as every other module's API file.
const promotionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    PromotionList: builder.query({
      query: (params) => ({ url: '/promotions', params }),
      transformResponse: (response) => response.data,
      providesTags: (result = []) => [
        ...result.map((row) => ({ type: 'Promotion', id: row.id })),
        { type: 'Promotion', id: 'LIST' },
      ],
    }),
    PromotionById: builder.query({
      query: (id) => `/promotions/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'Promotion', id }],
    }),
    NextPromotionCode: builder.query({
      query: () => '/promotions/next-code',
      transformResponse: (response) => response.data.code,
      providesTags: [{ type: 'Promotion', id: 'NEXT' }],
    }),
    PromotionCreate: builder.mutation({
      query: (body) => ({ url: '/promotions', method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: [{ type: 'Promotion', id: 'LIST' }, { type: 'Promotion', id: 'NEXT' }],
    }),
    PromotionUpdate: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/promotions/${id}`, method: 'PUT', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { id }) => [{ type: 'Promotion', id }, { type: 'Promotion', id: 'LIST' }],
    }),
    PromotionDelete: builder.mutation({
      query: (id) => ({ url: `/promotions/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [{ type: 'Promotion', id }, { type: 'Promotion', id: 'LIST' }],
    }),
  }),
});

export const useGetPromotionsQuery = promotionApi.usePromotionListQuery;
export const useGetPromotionQuery = promotionApi.usePromotionByIdQuery;
export const useNextPromotionCodeQuery = promotionApi.useNextPromotionCodeQuery;
export const useCreatePromotionMutation = promotionApi.usePromotionCreateMutation;
export const useUpdatePromotionMutation = promotionApi.usePromotionUpdateMutation;
export const useDeletePromotionMutation = promotionApi.usePromotionDeleteMutation;
