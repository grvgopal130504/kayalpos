import { baseApi } from './baseApi';

// Read-only, same reason as cashierWiseSalesApi.js: this dashboard has no
// table of its own, so there's no create/update/delete mutation here.
const cashierPanelApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Real Cashier Panel landing-page summary (stat strip, Current Shift
    // Details, Payment Summary (Today), Cash Summary (Today), Recent
    // Transactions, Alerts) — see backend/src/modules/cashier-panel/
    // cashierPanel.service.js's getCashierPanelSummary. No params: this
    // dashboard always reflects "right now".
    CashierPanelSummary: builder.query({
      query: () => ({ url: '/cashier-panel/summary' }),
      transformResponse: (response) => response.data,
      providesTags: [{ type: 'CashierPanel', id: 'SUMMARY' }],
    }),
  }),
});

export const useCashierPanelSummaryQuery = cashierPanelApi.useCashierPanelSummaryQuery;
