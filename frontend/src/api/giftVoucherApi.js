import { baseApi } from './baseApi';

// Hand-rolled (not createCrudApi) for the same reason as Promotion: the list
// needs a `status` query param that's computed live on the backend
// (active/upcoming/expired/inactive derived from dates + the Active
// checkbox — see backend/src/modules/gift-voucher's computeStatus()), not a
// stored column the generic crudFactory pattern assumes.
const giftVoucherApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    GiftVoucherList: builder.query({
      query: (params) => ({ url: '/gift-vouchers', params }),
      transformResponse: (response) => response.data,
      providesTags: (result = []) => [
        ...result.map((row) => ({ type: 'GiftVoucher', id: row.id })),
        { type: 'GiftVoucher', id: 'LIST' },
      ],
    }),
    GiftVoucherById: builder.query({
      query: (id) => `/gift-vouchers/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'GiftVoucher', id }],
    }),
    NextGiftVoucherCode: builder.query({
      query: () => '/gift-vouchers/next-code',
      transformResponse: (response) => response.data.code,
      providesTags: [{ type: 'GiftVoucher', id: 'NEXT' }],
    }),
    GiftVoucherCreate: builder.mutation({
      query: (body) => ({ url: '/gift-vouchers', method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: [{ type: 'GiftVoucher', id: 'LIST' }, { type: 'GiftVoucher', id: 'NEXT' }],
    }),
    GiftVoucherUpdate: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/gift-vouchers/${id}`, method: 'PUT', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { id }) => [{ type: 'GiftVoucher', id }, { type: 'GiftVoucher', id: 'LIST' }],
    }),
    GiftVoucherDelete: builder.mutation({
      query: (id) => ({ url: `/gift-vouchers/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [{ type: 'GiftVoucher', id }, { type: 'GiftVoucher', id: 'LIST' }],
    }),
  }),
});

export const useGetGiftVouchersQuery = giftVoucherApi.useGiftVoucherListQuery;
export const useGetGiftVoucherQuery = giftVoucherApi.useGiftVoucherByIdQuery;
export const useNextGiftVoucherCodeQuery = giftVoucherApi.useNextGiftVoucherCodeQuery;
export const useCreateGiftVoucherMutation = giftVoucherApi.useGiftVoucherCreateMutation;
export const useUpdateGiftVoucherMutation = giftVoucherApi.useGiftVoucherUpdateMutation;
export const useDeleteGiftVoucherMutation = giftVoucherApi.useGiftVoucherDeleteMutation;
