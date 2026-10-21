import { baseApi } from './baseApi';

// Read-only: the Shift-to-Shift Variance report is derived on the server from
// real ShiftSession / Sale / SalesReturn / cash-movement rows — see
// backend/src/modules/shift-variance/shiftVariance.service.js.
const shiftVarianceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // params: { from?, to?, outletId?, cashierId?, status?, page?, pageSize? }
    ShiftVarianceReport: builder.query({
      query: (params) => ({ url: '/shift-variance', params }),
      transformResponse: (response) => response.data,
    }),
    ShiftVarianceFilters: builder.query({
      query: () => '/shift-variance/filters',
      transformResponse: (response) => response.data,
    }),
    ShiftVarianceTransactions: builder.query({
      query: (shiftId) => `/shift-variance/${shiftId}/transactions`,
      transformResponse: (response) => response.data,
    }),
  }),
});

export const useShiftVarianceReportQuery = shiftVarianceApi.useShiftVarianceReportQuery;
export const useShiftVarianceFiltersQuery = shiftVarianceApi.useShiftVarianceFiltersQuery;
export const useShiftVarianceTransactionsQuery = shiftVarianceApi.useShiftVarianceTransactionsQuery;
// Used to fetch every page for the CSV export.
export const shiftVarianceEndpoints = shiftVarianceApi.endpoints;
