import { baseApi } from './baseApi';

// Hand-rolled (not createCrudApi), same reason as Sales Quotation/Sales
// Order: dedicated summary endpoints the generic crudFactory pattern
// doesn't have a place for, plus a `status` list filter that's partly
// computed live on the backend ('overdue' is derived from dueDate, not a
// stored column — see backend/src/modules/sales-invoice's computeStatus()).
const salesInvoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    SalesInvoiceList: builder.query({
      query: (params) => ({ url: '/sales-invoices', params }),
      transformResponse: (response) => response.data,
      providesTags: (result = []) => [
        ...result.map((row) => ({ type: 'SalesInvoice', id: row.id })),
        { type: 'SalesInvoice', id: 'LIST' },
      ],
    }),
    SalesInvoiceById: builder.query({
      query: (id) => `/sales-invoices/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'SalesInvoice', id }],
    }),
    NextSalesInvoiceCode: builder.query({
      query: () => '/sales-invoices/next-code',
      transformResponse: (response) => response.data.code,
      providesTags: [{ type: 'SalesInvoice', id: 'NEXT' }],
    }),
    // Feeds the "Sales Invoice" page's top 5-tile summary strip.
    SalesInvoiceSummary: builder.query({
      query: () => '/sales-invoices/summary',
      transformResponse: (response) => response.data,
      providesTags: [{ type: 'SalesInvoice', id: 'SUMMARY' }],
    }),
    // Feeds the Draft/Sent/Paid/Overdue status pages' 4-tile strip, one
    // status at a time.
    SalesInvoiceStatusSummary: builder.query({
      query: (status) => `/sales-invoices/status-summary/${status}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, status) => [{ type: 'SalesInvoice', id: `STATUS_SUMMARY_${status}` }],
    }),
    SalesInvoiceCreate: builder.mutation({
      query: (body) => ({ url: '/sales-invoices', method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: [
        { type: 'SalesInvoice', id: 'LIST' },
        { type: 'SalesInvoice', id: 'NEXT' },
        { type: 'SalesInvoice', id: 'SUMMARY' },
      ],
    }),
    SalesInvoiceUpdate: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/sales-invoices/${id}`, method: 'PUT', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'SalesInvoice', id },
        { type: 'SalesInvoice', id: 'LIST' },
        { type: 'SalesInvoice', id: 'SUMMARY' },
      ],
    }),
    SalesInvoiceDelete: builder.mutation({
      query: (id) => ({ url: `/sales-invoices/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [
        { type: 'SalesInvoice', id },
        { type: 'SalesInvoice', id: 'LIST' },
        { type: 'SalesInvoice', id: 'SUMMARY' },
      ],
    }),
  }),
});

export const useGetSalesInvoicesQuery = salesInvoiceApi.useSalesInvoiceListQuery;
export const useGetSalesInvoiceQuery = salesInvoiceApi.useSalesInvoiceByIdQuery;
export const useNextSalesInvoiceCodeQuery = salesInvoiceApi.useNextSalesInvoiceCodeQuery;
export const useSalesInvoiceSummaryQuery = salesInvoiceApi.useSalesInvoiceSummaryQuery;
export const useSalesInvoiceStatusSummaryQuery = salesInvoiceApi.useSalesInvoiceStatusSummaryQuery;
export const useCreateSalesInvoiceMutation = salesInvoiceApi.useSalesInvoiceCreateMutation;
export const useUpdateSalesInvoiceMutation = salesInvoiceApi.useSalesInvoiceUpdateMutation;
export const useDeleteSalesInvoiceMutation = salesInvoiceApi.useSalesInvoiceDeleteMutation;
