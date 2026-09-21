import { baseApi } from './baseApi';

// Hand-rolled (not createCrudApi), same reason as Promotion/GiftVoucher: the
// list needs a `status` query param that's partly computed live on the
// backend ('expired' is derived from validTill, not a stored column — see
// backend/src/modules/sales-quotation's computeStatus()), plus dedicated
// summary endpoints the generic crudFactory pattern doesn't have a place for.
const salesQuotationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    SalesQuotationList: builder.query({
      query: (params) => ({ url: '/sales-quotations', params }),
      transformResponse: (response) => response.data,
      providesTags: (result = []) => [
        ...result.map((row) => ({ type: 'SalesQuotation', id: row.id })),
        { type: 'SalesQuotation', id: 'LIST' },
      ],
    }),
    SalesQuotationById: builder.query({
      query: (id) => `/sales-quotations/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'SalesQuotation', id }],
    }),
    NextSalesQuotationCode: builder.query({
      query: () => '/sales-quotations/next-code',
      transformResponse: (response) => response.data.code,
      providesTags: [{ type: 'SalesQuotation', id: 'NEXT' }],
    }),
    // Feeds the "All Quotations" page's top 5-tile summary strip.
    SalesQuotationSummary: builder.query({
      query: () => '/sales-quotations/summary',
      transformResponse: (response) => response.data,
      providesTags: [{ type: 'SalesQuotation', id: 'SUMMARY' }],
    }),
    // Feeds the Draft/Converted/Expired status pages' 4-tile strip, one
    // status ('draft' | 'pending' | 'converted' | 'expired') at a time.
    SalesQuotationStatusSummary: builder.query({
      query: (status) => `/sales-quotations/status-summary/${status}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, status) => [{ type: 'SalesQuotation', id: `STATUS_SUMMARY_${status}` }],
    }),
    SalesQuotationCreate: builder.mutation({
      query: (body) => ({ url: '/sales-quotations', method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: [
        { type: 'SalesQuotation', id: 'LIST' },
        { type: 'SalesQuotation', id: 'NEXT' },
        { type: 'SalesQuotation', id: 'SUMMARY' },
      ],
    }),
    SalesQuotationUpdate: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/sales-quotations/${id}`, method: 'PUT', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'SalesQuotation', id },
        { type: 'SalesQuotation', id: 'LIST' },
        { type: 'SalesQuotation', id: 'SUMMARY' },
      ],
    }),
    SalesQuotationDelete: builder.mutation({
      query: (id) => ({ url: `/sales-quotations/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [
        { type: 'SalesQuotation', id },
        { type: 'SalesQuotation', id: 'LIST' },
        { type: 'SalesQuotation', id: 'SUMMARY' },
      ],
    }),
  }),
});

export const useGetSalesQuotationsQuery = salesQuotationApi.useSalesQuotationListQuery;
export const useGetSalesQuotationQuery = salesQuotationApi.useSalesQuotationByIdQuery;
export const useNextSalesQuotationCodeQuery = salesQuotationApi.useNextSalesQuotationCodeQuery;
export const useSalesQuotationSummaryQuery = salesQuotationApi.useSalesQuotationSummaryQuery;
export const useSalesQuotationStatusSummaryQuery = salesQuotationApi.useSalesQuotationStatusSummaryQuery;
export const useCreateSalesQuotationMutation = salesQuotationApi.useSalesQuotationCreateMutation;
export const useUpdateSalesQuotationMutation = salesQuotationApi.useSalesQuotationUpdateMutation;
export const useDeleteSalesQuotationMutation = salesQuotationApi.useSalesQuotationDeleteMutation;
