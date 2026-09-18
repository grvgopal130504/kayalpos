import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Exported so other clients that don't go through RTK Query (e.g. the
// health-check poller, which needs its own timeout/abort handling) can
// still point at the same backend without duplicating the env fallback.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

// Single RTK Query base API. Every domain (auth, items, customers, sales, ...)
// injects its endpoints into this one instance instead of creating separate
// createApi() clients, so cache tags and the store slice stay unified.
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Auth', 'Brand', 'Outlet', 'Product', 'Customer'],
  endpoints: () => ({}),
});
