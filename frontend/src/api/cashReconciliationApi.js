import { baseApi } from './baseApi';

// Read-only, same reason as cashDrawerOpeningApi.js/shiftClosingApi.js: a
// cash reconciliation IS the reconciliation view of a CLOSED ShiftSession
// row — created elsewhere by the Shift Closing screen's own
// ShiftSessionClose mutation (see shiftSessionApi.js) — this module only
// reads that same real data, reshaped, so there's no create/update/delete
// mutation here.
const cashReconciliationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Real Cash Reconciliation report (stat tiles, Reconciliation Summary,
    // the Variance Summary (By Type) donut, and paginated transactions)
    // for the Cashier Panel's Cash Reconciliation page — see
    // backend/src/modules/cash-reconciliation/cashReconciliation.
    // service.js's getCashReconciliationReport. `params`: { date?:
    // 'YYYY-MM-DD', page?, pageSize? }.
    CashReconciliationReport: builder.query({
      query: (params) => ({ url: '/cash-reconciliations/summary', params }),
      transformResponse: (response) => response.data,
      providesTags: [{ type: 'CashReconciliation', id: 'SUMMARY' }],
    }),
  }),
});

export const useCashReconciliationReportQuery = cashReconciliationApi.useCashReconciliationReportQuery;
