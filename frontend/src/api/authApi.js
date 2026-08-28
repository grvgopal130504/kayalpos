import { baseApi } from './baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      // Unwrap the { success, data } envelope so callers get { user, token } directly.
      transformResponse: (response) => response.data,
    }),
  }),
});

export const { useLoginMutation } = authApi;
