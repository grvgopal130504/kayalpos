import { baseApi } from './baseApi';

// Read-only, same reason as the sale-report endpoints (saleApi.js's
// CashSalesReport etc): a drawer opening is created elsewhere — the Shift
// Opening screen's ShiftSessionOpen mutation (see shiftSessionApi.js) —
// this module only reads that same real data, so there's no
// create/update/delete mutation here.
const cashDrawerOpeningApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Real Cash Drawer Opening report (stat tiles, Opening Summary /
    // Opening Summary (By Time), the by-time donut, and paginated
    // transactions) for the Cashier Panel's Cash Drawer Opening page —
    // see backend/src/modules/cash-drawer-opening/cashDrawerOpening.
    // service.js's getCashDrawerOpeningReport.
    // `params`: { date?: 'YYYY-MM-DD', page?, pageSize? }.
    CashDrawerOpeningReport: builder.query({
      query: (params) => ({ url: '/cash-drawer-openings/summary', params }),
      transformResponse: (response) => response.data,
      providesTags: [{ type: 'CashDrawerOpening', id: 'SUMMARY' }],
    }),
  }),
});

export const useCashDrawerOpeningReportQuery = cashDrawerOpeningApi.useCashDrawerOpeningReportQuery;
