import { baseApi } from './baseApi';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHomeDashboard: builder.query({
      query: (outletId) => ({ url: '/dashboard/home', params: { outletId } }),
      transformResponse: (response) => response.data,
    }),
    getManagementDashboard: builder.query({
      query: () => '/dashboard/management',
      transformResponse: (response) => response.data,
    }),
  }),
});

export const { useGetHomeDashboardQuery, useGetManagementDashboardQuery } = dashboardApi;
