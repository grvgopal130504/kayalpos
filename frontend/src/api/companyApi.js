import { baseApi } from './baseApi';

// Hand-rolled (not createCrudApi) — same reason as Expense's/Cash
// Withdrawal's own APIs: the Company master is a singleton profile plus a
// small Contact Person sub-list, not a full list/filter/paginate CRUD
// surface like Brand or Supplier.
const companyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /company — the Company Details tab's data. `data` is `null` when
    // the tenant hasn't saved a profile yet (see company.service.js), which
    // the page treats as "render an empty, editable form", not an error.
    CompanyProfile: builder.query({
      query: () => ({ url: '/company' }),
      transformResponse: (response) => response.data,
      providesTags: [{ type: 'Company', id: 'PROFILE' }],
    }),
    // PUT /company — upsert. One mutation covers both "set up the company
    // profile for the first time" and every save after.
    SaveCompanyProfile: builder.mutation({
      query: (body) => ({ url: '/company', method: 'PUT', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: [{ type: 'Company', id: 'PROFILE' }],
    }),
    AddCompanyContact: builder.mutation({
      query: (body) => ({ url: '/company/contacts', method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: [{ type: 'Company', id: 'PROFILE' }],
    }),
    UpdateCompanyContact: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/company/contacts/${id}`, method: 'PUT', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: [{ type: 'Company', id: 'PROFILE' }],
    }),
    DeleteCompanyContact: builder.mutation({
      query: (id) => ({ url: `/company/contacts/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Company', id: 'PROFILE' }],
    }),
  }),
});

export const useCompanyProfileQuery = companyApi.useCompanyProfileQuery;
export const useSaveCompanyProfileMutation = companyApi.useSaveCompanyProfileMutation;
export const useAddCompanyContactMutation = companyApi.useAddCompanyContactMutation;
export const useUpdateCompanyContactMutation = companyApi.useUpdateCompanyContactMutation;
export const useDeleteCompanyContactMutation = companyApi.useDeleteCompanyContactMutation;
