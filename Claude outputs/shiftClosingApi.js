import { baseApi } from './baseApi';

// Read-only, same reason as cashDrawerOpeningApi.js: a shift closing is
// created elsewhere — the Shift Closing screen's own ShiftSessionClose
// mutation (see shiftSessionApi.js) — this module only reads that same
// real data, so there's no create/update/delete mutation here.
const shiftClosingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Real Shift Closing report (stat tiles, Closing Summary / Closing
    // Summary (By Shift), the by-shift donut, and paginated transactions)
    // for the Cashier Panel's Shift Closing page — see
    // backend/src/modules/shift-closing/shiftClosing.service.js's
    // getShiftClosingReport. `params`: { date?: 'YYYY-MM-DD', page?, pageSize? }.
    ShiftClosingReport: builder.query({
      query: (params) => ({ url: '/shift-closings/summary', params }),
      transformResponse: (response) => response.data,
      providesTags: [{ type: 'ShiftClosing', id: 'SUMMARY' }],
    }),
  }),
});

export const useShiftClosingReportQuery = shiftClosingApi.useShiftClosingReportQuery;
