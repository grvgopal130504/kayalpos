import { baseApi } from './baseApi';

// Read-only, same reason as cashReconciliationApi.js: a shortage/excess
// entry is just the non-zero-variance subset of a CLOSED ShiftSession
// row's real reconciliation — created elsewhere by the Shift Closing
// screen's own ShiftSessionClose mutation (see shiftSessionApi.js) —
// this module only reads that same real data, filtered and reshaped, so
// there's no create/update/delete mutation here.
const shortageExcessApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Real Shortage / Excess report (stat tiles, Shortage / Excess
    // Summary, the by-type donut with its Net Amount legend, and
    // paginated transactions) for the Cashier Panel's Shortage / Excess
    // page — see backend/src/modules/shortage-excess/shortageExcess.
    // service.js's getShortageExcessReport. `params`: { date?:
    // 'YYYY-MM-DD', page?, pageSize? }.
    ShortageExcessReport: builder.query({
      query: (params) => ({ url: '/shortage-excess/summary', params }),
      transformResponse: (response) => response.data,
      providesTags: [{ type: 'ShortageExcess', id: 'SUMMARY' }],
    }),
  }),
});

export const useShortageExcessReportQuery = shortageExcessApi.useShortageExcessReportQuery;
