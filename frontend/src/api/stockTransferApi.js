import { baseApi } from './baseApi';

// Hand-rolled (not createCrudApi), same reason as Stock Indent/Sales Order/
// Sales Invoice/Barcode & Label: dedicated summary endpoints the generic
// crudFactory pattern doesn't have a place for, plus a plain `status` list
// filter (no live-derived state here — see backend/src/modules/
// stock-transfer's model comment on why 'received'/'cancelled' aren't
// reachable yet).
const stockTransferApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    StockTransferList: builder.query({
      query: (params) => ({ url: '/stock-transfers', params }),
      transformResponse: (response) => response.data,
      providesTags: (result = []) => [
        ...result.map((row) => ({ type: 'StockTransfer', id: row.id })),
        { type: 'StockTransfer', id: 'LIST' },
      ],
    }),
    StockTransferById: builder.query({
      query: (id) => `/stock-transfers/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'StockTransfer', id }],
    }),
    NextStockTransferCode: builder.query({
      query: () => '/stock-transfers/next-code',
      transformResponse: (response) => response.data.code,
      providesTags: [{ type: 'StockTransfer', id: 'NEXT' }],
    }),
    // Feeds the "Stock Transfer" page's top 5-tile summary strip.
    StockTransferSummary: builder.query({
      query: () => '/stock-transfers/summary',
      transformResponse: (response) => response.data,
      providesTags: [{ type: 'StockTransfer', id: 'SUMMARY' }],
    }),
    // Feeds the Draft/In Transit/Received/Cancelled status pages' 4-tile
    // strip, one status at a time.
    StockTransferStatusSummary: builder.query({
      query: (status) => `/stock-transfers/status-summary/${status}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, status) => [{ type: 'StockTransfer', id: `STATUS_SUMMARY_${status}` }],
    }),
    StockTransferCreate: builder.mutation({
      query: (body) => ({ url: '/stock-transfers', method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: [
        { type: 'StockTransfer', id: 'LIST' },
        { type: 'StockTransfer', id: 'NEXT' },
        { type: 'StockTransfer', id: 'SUMMARY' },
      ],
    }),
    StockTransferUpdate: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/stock-transfers/${id}`, method: 'PUT', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'StockTransfer', id },
        { type: 'StockTransfer', id: 'LIST' },
        { type: 'StockTransfer', id: 'SUMMARY' },
      ],
    }),
    StockTransferDelete: builder.mutation({
      query: (id) => ({ url: `/stock-transfers/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [
        { type: 'StockTransfer', id },
        { type: 'StockTransfer', id: 'LIST' },
        { type: 'StockTransfer', id: 'SUMMARY' },
      ],
    }),
  }),
});

export const useGetStockTransfersQuery = stockTransferApi.useStockTransferListQuery;
export const useGetStockTransferQuery = stockTransferApi.useStockTransferByIdQuery;
export const useNextStockTransferCodeQuery = stockTransferApi.useNextStockTransferCodeQuery;
export const useStockTransferSummaryQuery = stockTransferApi.useStockTransferSummaryQuery;
export const useStockTransferStatusSummaryQuery = stockTransferApi.useStockTransferStatusSummaryQuery;
export const useCreateStockTransferMutation = stockTransferApi.useStockTransferCreateMutation;
export const useUpdateStockTransferMutation = stockTransferApi.useStockTransferUpdateMutation;
export const useDeleteStockTransferMutation = stockTransferApi.useStockTransferDeleteMutation;
