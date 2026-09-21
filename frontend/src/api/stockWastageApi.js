import { baseApi } from './baseApi';

// Hand-rolled (not createCrudApi), same reason as Stock Return/Stock
// Receipt/Stock Indent/Stock Transfer: a dedicated summary endpoint the
// generic crudFactory pattern doesn't have a place for, plus a plain
// `status` list filter. There's no separate status-summary endpoint — the
// All/Draft/Approved split lives inside StockWastageTable's own tabs on the
// one Stock Wastage page, so there's nothing to feed there.
const stockWastageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    StockWastageList: builder.query({
      query: (params) => ({ url: '/stock-wastages', params }),
      transformResponse: (response) => response.data,
      providesTags: (result = []) => [
        ...result.map((row) => ({ type: 'StockWastage', id: row.id })),
        { type: 'StockWastage', id: 'LIST' },
      ],
    }),
    StockWastageById: builder.query({
      query: (id) => `/stock-wastages/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'StockWastage', id }],
    }),
    NextStockWastageCode: builder.query({
      query: () => '/stock-wastages/next-code',
      transformResponse: (response) => response.data.code,
      providesTags: [{ type: 'StockWastage', id: 'NEXT' }],
    }),
    // Feeds the "Stock Wastage" page's top 5-tile summary strip.
    StockWastageSummary: builder.query({
      query: () => '/stock-wastages/summary',
      transformResponse: (response) => response.data,
      providesTags: [{ type: 'StockWastage', id: 'SUMMARY' }],
    }),
    StockWastageCreate: builder.mutation({
      query: (body) => ({ url: '/stock-wastages', method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: [
        { type: 'StockWastage', id: 'LIST' },
        { type: 'StockWastage', id: 'NEXT' },
        { type: 'StockWastage', id: 'SUMMARY' },
      ],
    }),
    StockWastageUpdate: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/stock-wastages/${id}`, method: 'PUT', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'StockWastage', id },
        { type: 'StockWastage', id: 'LIST' },
        { type: 'StockWastage', id: 'SUMMARY' },
      ],
    }),
    StockWastageDelete: builder.mutation({
      query: (id) => ({ url: `/stock-wastages/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [
        { type: 'StockWastage', id },
        { type: 'StockWastage', id: 'LIST' },
        { type: 'StockWastage', id: 'SUMMARY' },
      ],
    }),
  }),
});

export const useGetStockWastagesQuery = stockWastageApi.useStockWastageListQuery;
export const useGetStockWastageQuery = stockWastageApi.useStockWastageByIdQuery;
export const useNextStockWastageCodeQuery = stockWastageApi.useNextStockWastageCodeQuery;
export const useStockWastageSummaryQuery = stockWastageApi.useStockWastageSummaryQuery;
export const useCreateStockWastageMutation = stockWastageApi.useStockWastageCreateMutation;
export const useUpdateStockWastageMutation = stockWastageApi.useStockWastageUpdateMutation;
export const useDeleteStockWastageMutation = stockWastageApi.useStockWastageDeleteMutation;
