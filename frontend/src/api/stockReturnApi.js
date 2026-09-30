import { baseApi } from './baseApi';

// Hand-rolled (not createCrudApi), same reason as Stock Receipt/Stock
// Indent/Stock Transfer: a dedicated summary endpoint the generic
// crudFactory pattern doesn't have a place for, plus a plain `status` list
// filter. There's no separate status-summary endpoint — the All/Draft/
// Accepted split lives inside StockReturnTable's own tabs on the one Stock
// Return page, so there's nothing to feed there.
const stockReturnApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    StockReturnList: builder.query({
      query: (params) => ({ url: '/stock-returns', params }),
      transformResponse: (response) => response.data,
      providesTags: (result = []) => [
        ...result.map((row) => ({ type: 'StockReturn', id: row.id })),
        { type: 'StockReturn', id: 'LIST' },
      ],
    }),
    StockReturnById: builder.query({
      query: (id) => `/stock-returns/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'StockReturn', id }],
    }),
    NextStockReturnCode: builder.query({
      query: () => '/stock-returns/next-code',
      transformResponse: (response) => response.data.code,
      providesTags: [{ type: 'StockReturn', id: 'NEXT' }],
    }),
    // Feeds the "Stock Return" page's top 5-tile summary strip.
    StockReturnSummary: builder.query({
      query: () => '/stock-returns/summary',
      transformResponse: (response) => response.data,
      providesTags: [{ type: 'StockReturn', id: 'SUMMARY' }],
    }),
    StockReturnCreate: builder.mutation({
      query: (body) => ({ url: '/stock-returns', method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: [
        { type: 'StockReturn', id: 'LIST' },
        { type: 'StockReturn', id: 'NEXT' },
        { type: 'StockReturn', id: 'SUMMARY' },
      ],
    }),
    StockReturnUpdate: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/stock-returns/${id}`, method: 'PUT', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'StockReturn', id },
        { type: 'StockReturn', id: 'LIST' },
        { type: 'StockReturn', id: 'SUMMARY' },
      ],
    }),
    StockReturnDelete: builder.mutation({
      query: (id) => ({ url: `/stock-returns/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [
        { type: 'StockReturn', id },
        { type: 'StockReturn', id: 'LIST' },
        { type: 'StockReturn', id: 'SUMMARY' },
      ],
    }),
  }),
});

export const useGetStockReturnsQuery = stockReturnApi.useStockReturnListQuery;
export const useGetStockReturnQuery = stockReturnApi.useStockReturnByIdQuery;
export const useNextStockReturnCodeQuery = stockReturnApi.useNextStockReturnCodeQuery;
export const useStockReturnSummaryQuery = stockReturnApi.useStockReturnSummaryQuery;
export const useCreateStockReturnMutation = stockReturnApi.useStockReturnCreateMutation;
export const useUpdateStockReturnMutation = stockReturnApi.useStockReturnUpdateMutation;
export const useDeleteStockReturnMutation = stockReturnApi.useStockReturnDeleteMutation;
