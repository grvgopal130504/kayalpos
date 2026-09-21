import { baseApi } from './baseApi';

// Hand-rolled (not createCrudApi), same reason as Sales Order/Sales
// Invoice/Barcode & Label: dedicated summary endpoints the generic
// crudFactory pattern doesn't have a place for, plus a plain `status` list
// filter (no live-derived state here — see backend/src/modules/stock-indent's
// model comment on why 'approved'/'rejected' aren't reachable yet).
const stockIndentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    StockIndentList: builder.query({
      query: (params) => ({ url: '/stock-indents', params }),
      transformResponse: (response) => response.data,
      providesTags: (result = []) => [
        ...result.map((row) => ({ type: 'StockIndent', id: row.id })),
        { type: 'StockIndent', id: 'LIST' },
      ],
    }),
    StockIndentById: builder.query({
      query: (id) => `/stock-indents/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'StockIndent', id }],
    }),
    NextStockIndentCode: builder.query({
      query: () => '/stock-indents/next-code',
      transformResponse: (response) => response.data.code,
      providesTags: [{ type: 'StockIndent', id: 'NEXT' }],
    }),
    // Feeds the "Stock Indent" page's top 5-tile summary strip.
    StockIndentSummary: builder.query({
      query: () => '/stock-indents/summary',
      transformResponse: (response) => response.data,
      providesTags: [{ type: 'StockIndent', id: 'SUMMARY' }],
    }),
    // Feeds the Draft/Pending Approval/Approved/Rejected status pages'
    // 4-tile strip, one status at a time.
    StockIndentStatusSummary: builder.query({
      query: (status) => `/stock-indents/status-summary/${status}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, status) => [{ type: 'StockIndent', id: `STATUS_SUMMARY_${status}` }],
    }),
    StockIndentCreate: builder.mutation({
      query: (body) => ({ url: '/stock-indents', method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: [
        { type: 'StockIndent', id: 'LIST' },
        { type: 'StockIndent', id: 'NEXT' },
        { type: 'StockIndent', id: 'SUMMARY' },
      ],
    }),
    StockIndentUpdate: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/stock-indents/${id}`, method: 'PUT', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'StockIndent', id },
        { type: 'StockIndent', id: 'LIST' },
        { type: 'StockIndent', id: 'SUMMARY' },
      ],
    }),
    StockIndentDelete: builder.mutation({
      query: (id) => ({ url: `/stock-indents/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [
        { type: 'StockIndent', id },
        { type: 'StockIndent', id: 'LIST' },
        { type: 'StockIndent', id: 'SUMMARY' },
      ],
    }),
  }),
});

export const useGetStockIndentsQuery = stockIndentApi.useStockIndentListQuery;
export const useGetStockIndentQuery = stockIndentApi.useStockIndentByIdQuery;
export const useNextStockIndentCodeQuery = stockIndentApi.useNextStockIndentCodeQuery;
export const useStockIndentSummaryQuery = stockIndentApi.useStockIndentSummaryQuery;
export const useStockIndentStatusSummaryQuery = stockIndentApi.useStockIndentStatusSummaryQuery;
export const useCreateStockIndentMutation = stockIndentApi.useStockIndentCreateMutation;
export const useUpdateStockIndentMutation = stockIndentApi.useStockIndentUpdateMutation;
export const useDeleteStockIndentMutation = stockIndentApi.useStockIndentDeleteMutation;
