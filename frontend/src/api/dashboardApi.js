import { baseApi } from './baseApi';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Accepts { outletId, salesPeriod, topSellingPeriod } so the Home page's
    // two PeriodSelect dropdowns actually control what's fetched, instead of
    // being decorative — mirrors the real query params dashboard.schema.js
    // validates server-side.
    getHomeDashboard: builder.query({
      query: (params) => ({ url: '/dashboard/home', params }),
      transformResponse: (response) => response.data,
    }),
    getManagementDashboard: builder.query({
      query: () => '/dashboard/management',
      transformResponse: (response) => response.data,
    }),
  }),
});

export const { useGetHomeDashboardQuery, useGetManagementDashboardQuery } = dashboardApi;
