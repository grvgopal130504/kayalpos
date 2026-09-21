import { baseApi } from './baseApi';

// Sale doesn't follow the generic createCrudApi shape (createCustomerApi,
// productApi, ...) because it isn't a flat master-data table — creating one
// needs a cart of lines validated/priced server-side, not a plain
// POST-the-form-body. Injected directly into the same baseApi instance so
// its cache tag ('Sale') and auth header still come from the one shared
// client.
const saleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Live "LS-00001"-style preview of the bill the current cart will get
    // once paid — same "preview, not a reservation" caveat as the
    // Customer/Product next-code previews.
    NextBillNo: builder.query({
      query: () => '/sales/next-bill-no',
      transformResponse: (response) => response.data.billNo,
      // Invalidated by CreateSale below, so the preview moves on to the
      // next number as soon as the current bill is actually saved.
      providesTags: [{ type: 'Sale', id: 'NEXT' }],
    }),
    CreateSale: builder.mutation({
      query: (body) => ({ url: '/sales', method: 'POST', body }),
      transformResponse: (response) => response.data,
      // A paid sale changes stock (any screen showing Product data should
      // refetch), moves the next bill number on by one, changes the
      // Promotion page's discount-summary report, changes the Customer
      // page's sales-derived tiles/columns, and — when billed to a specific
      // customer — that customer's own purchase summary/recent transactions.
      invalidatesTags: (result, error, arg) => [
        { type: 'Product', id: 'LIST' },
        { type: 'Sale', id: 'NEXT' },
        { type: 'Sale', id: 'DISCOUNT_SUMMARY' },
        { type: 'Sale', id: 'OVERVIEW_SUMMARY' },
        { type: 'Sale', id: 'CUSTOMER_SUMMARIES' },
        ...(arg?.customerId ? [{ type: 'Sale', id: `CUSTOMER_${arg.customerId}` }] : []),
      ],
    }),
    // Real discount totals (trend + by-outlet) computed from actual Sale
    // rows — see backend/src/modules/sale/sale.service.js's
    // getDiscountSummary for exactly what this reports.
    DiscountSummary: builder.query({
      query: () => '/sales/discount-summary',
      transformResponse: (response) => response.data,
      providesTags: [{ type: 'Sale', id: 'DISCOUNT_SUMMARY' }],
    }),
    // Real "Total Sales (This Month)"/"Outstanding Amount" for the Customer
    // page's top tiles — see sale.service.js's getSalesOverviewSummary.
    SalesOverviewSummary: builder.query({
      query: () => '/sales/overview-summary',
      transformResponse: (response) => response.data,
      providesTags: [{ type: 'Sale', id: 'OVERVIEW_SUMMARY' }],
    }),
    // Real per-customer Total Purchase/Outstanding, keyed by customerId, for
    // the Customer list table's columns — one query for every customer
    // instead of one per row. See getCustomerPurchaseSummaries.
    CustomerSalesSummaries: builder.query({
      query: () => '/sales/customer-summaries',
      transformResponse: (response) => response.data,
      providesTags: [{ type: 'Sale', id: 'CUSTOMER_SUMMARIES' }],
    }),
    // Real Total Purchase/Outstanding + Recent Transactions for one
    // customer's detail panel/view page. See getCustomerPurchaseSummary.
    CustomerSales: builder.query({
      query: (customerId) => `/sales/customer/${customerId}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, customerId) => [{ type: 'Sale', id: `CUSTOMER_${customerId}` }],
    }),
  }),
});

export const useNextBillNoQuery = saleApi.useNextBillNoQuery;
export const useCreateSaleMutation = saleApi.useCreateSaleMutation;
export const useDiscountSummaryQuery = saleApi.useDiscountSummaryQuery;
export const useSalesOverviewSummaryQuery = saleApi.useSalesOverviewSummaryQuery;
export const useCustomerSalesSummariesQuery = saleApi.useCustomerSalesSummariesQuery;
export const useCustomerSalesQuery = saleApi.useCustomerSalesQuery;
