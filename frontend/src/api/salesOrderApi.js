import { baseApi } from './baseApi';

// Hand-rolled (not createCrudApi), same reason as Sales Quotation: dedicated
// summary endpoints the generic crudFactory pattern doesn't have a place
// for, plus a `status` list filter.
const salesOrderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    SalesOrderList: builder.query({
      query: (params) => ({ url: '/sales-orders', params }),
      transformResponse: (response) => response.data,
      providesTags: (result = []) => [
        ...result.map((row) => ({ type: 'SalesOrder', id: row.id })),
        { type: 'SalesOrder', id: 'LIST' },
      ],
    }),
    SalesOrderById: builder.query({
      query: (id) => `/sales-orders/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'SalesOrder', id }],
    }),
    NextSalesOrderCode: builder.query({
      query: () => '/sales-orders/next-code',
      transformResponse: (response) => response.data.code,
      providesTags: [{ type: 'SalesOrder', id: 'NEXT' }],
    }),
    // Feeds the "Sales Order" page's top 5-tile summary strip.
    SalesOrderSummary: builder.query({
      query: () => '/sales-orders/summary',
      transformResponse: (response) => response.data,
      providesTags: [{ type: 'SalesOrder', id: 'SUMMARY' }],
    }),
    // Feeds the Pending/Confirmed/Delivered status pages' 4-tile strip, one
    // status at a time.
    SalesOrderStatusSummary: builder.query({
      query: (status) => `/sales-orders/status-summary/${status}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, status) => [{ type: 'SalesOrder', id: `STATUS_SUMMARY_${status}` }],
    }),
    SalesOrderCreate: builder.mutation({
      query: (body) => ({ url: '/sales-orders', method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: [
        { type: 'SalesOrder', id: 'LIST' },
        { type: 'SalesOrder', id: 'NEXT' },
        { type: 'SalesOrder', id: 'SUMMARY' },
      ],
    }),
    SalesOrderUpdate: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/sales-orders/${id}`, method: 'PUT', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'SalesOrder', id },
        { type: 'SalesOrder', id: 'LIST' },
        { type: 'SalesOrder', id: 'SUMMARY' },
      ],
    }),
    SalesOrderDelete: builder.mutation({
      query: (id) => ({ url: `/sales-orders/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [
        { type: 'SalesOrder', id },
        { type: 'SalesOrder', id: 'LIST' },
        { type: 'SalesOrder', id: 'SUMMARY' },
      ],
    }),
  }),
});

export const useGetSalesOrdersQuery = salesOrderApi.useSalesOrderListQuery;
export const useGetSalesOrderQuery = salesOrderApi.useSalesOrderByIdQuery;
export const useNextSalesOrderCodeQuery = salesOrderApi.useNextSalesOrderCodeQuery;
export const useSalesOrderSummaryQuery = salesOrderApi.useSalesOrderSummaryQuery;
export const useSalesOrderStatusSummaryQuery = salesOrderApi.useSalesOrderStatusSummaryQuery;
export const useCreateSalesOrderMutation = salesOrderApi.useSalesOrderCreateMutation;
export const useUpdateSalesOrderMutation = salesOrderApi.useSalesOrderUpdateMutation;
export const useDeleteSalesOrderMutation = salesOrderApi.useSalesOrderDeleteMutation;
