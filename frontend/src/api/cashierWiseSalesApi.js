import { baseApi } from './baseApi';

// Read-only, same reason as cashReconciliationApi.js/shortageExcessApi.js:
// there's no separate table backing this report — it's built directly from
// real Sale/SaleLine/SalesReturn rows grouped by cashier, so there's no
// create/update/delete mutation here.
const cashierWiseSalesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Real Cashier Wise Sales report (stat tiles, Sales Summary, the Sales
    // Contribution (By Cashier) donut, the paginated per-cashier details
    // table, the Sales Trend (By Cashier) chart, and Top Performing
    // Cashiers) for the Cashier Panel's Cashier Wise Sales page — see
    // backend/src/modules/cashier-wise-sales/cashierWiseSales.service.js's
    // getCashierWiseSalesReport. `params`: { date?: 'YYYY-MM-DD', page?,
    // pageSize? }.
    CashierWiseSalesReport: builder.query({
      query: (params) => ({ url: '/cashier-wise-sales/summary', params }),
      transformResponse: (response) => response.data,
      providesTags: [{ type: 'CashierWiseSales', id: 'SUMMARY' }],
    }),
  }),
});

export const useCashierWiseSalesReportQuery = cashierWiseSalesApi.useCashierWiseSalesReportQuery;
