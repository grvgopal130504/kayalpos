import { baseApi } from './baseApi';

// Read-only Sales Reports. One endpoint serves all eight report types
// (daily | monthly | outlet | cashier | item | category | brand | customer);
// the filter dropdown data (real outlets + cashiers) has its own endpoint.
const salesReportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    SalesReportFilters: builder.query({
      query: () => '/sales-reports/filters',
      transformResponse: (response) => response.data,
      providesTags: [{ type: 'SalesReport', id: 'FILTERS' }],
    }),
    SalesReport: builder.query({
      query: ({ report, ...params }) => ({ url: `/sales-reports/${report}`, params }),
      transformResponse: (response) => response.data,
      providesTags: (result, error, arg) => [{ type: 'SalesReport', id: arg.report }],
    }),
  }),
});

export const useSalesReportFiltersQuery = salesReportsApi.useSalesReportFiltersQuery;
export const useSalesReportQuery = salesReportsApi.useSalesReportQuery;
