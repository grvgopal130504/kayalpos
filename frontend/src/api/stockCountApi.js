import { baseApi } from './baseApi';

// Hand-rolled (not createCrudApi), same reason as Stock Wastage/Stock
// Return/Stock Receipt: a dedicated summary endpoint the generic
// crudFactory pattern doesn't have a place for, plus a plain `status` list
// filter. There's no separate status-summary endpoint — the All/Draft/
// Completed split lives inside StockCountTable's own tabs on the one Stock
// Count page, so there's nothing to feed there.
const stockCountApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    StockCountList: builder.query({
      query: (params) => ({ url: '/stock-counts', params }),
      transformResponse: (response) => response.data,
      providesTags: (result = []) => [
        ...result.map((row) => ({ type: 'StockCount', id: row.id })),
        { type: 'StockCount', id: 'LIST' },
      ],
    }),
    StockCountById: builder.query({
      query: (id) => `/stock-counts/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'StockCount', id }],
    }),
    NextStockCountCode: builder.query({
      query: () => '/stock-counts/next-code',
      transformResponse: (response) => response.data.code,
      providesTags: [{ type: 'StockCount', id: 'NEXT' }],
    }),
    // Feeds the "Stock Count" page's top 5-tile summary strip.
    StockCountSummary: builder.query({
      query: () => '/stock-counts/summary',
      transformResponse: (response) => response.data,
      providesTags: [{ type: 'StockCount', id: 'SUMMARY' }],
    }),
    StockCountCreate: builder.mutation({
      query: (body) => ({ url: '/stock-counts', method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: [
        { type: 'StockCount', id: 'LIST' },
        { type: 'StockCount', id: 'NEXT' },
        { type: 'StockCount', id: 'SUMMARY' },
      ],
    }),
    StockCountUpdate: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/stock-counts/${id}`, method: 'PUT', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'StockCount', id },
        { type: 'StockCount', id: 'LIST' },
        { type: 'StockCount', id: 'SUMMARY' },
      ],
    }),
    StockCountDelete: builder.mutation({
      query: (id) => ({ url: `/stock-counts/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [
        { type: 'StockCount', id },
        { type: 'StockCount', id: 'LIST' },
        { type: 'StockCount', id: 'SUMMARY' },
      ],
    }),
  }),
});

export const useGetStockCountsQuery = stockCountApi.useStockCountListQuery;
export const useGetStockCountQuery = stockCountApi.useStockCountByIdQuery;
export const useNextStockCountCodeQuery = stockCountApi.useNextStockCountCodeQuery;
export const useStockCountSummaryQuery = stockCountApi.useStockCountSummaryQuery;
export const useCreateStockCountMutation = stockCountApi.useStockCountCreateMutation;
export const useUpdateStockCountMutation = stockCountApi.useStockCountUpdateMutation;
export const useDeleteStockCountMutation = stockCountApi.useStockCountDeleteMutation;
