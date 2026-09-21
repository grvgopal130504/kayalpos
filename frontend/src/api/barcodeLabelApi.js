import { baseApi } from './baseApi';

// Hand-rolled (not createCrudApi), same reason as Sales Order/Sales Invoice:
// dedicated summary endpoints the generic crudFactory pattern doesn't have a
// place for, plus a plain `status` list filter (no live-derived state here —
// see backend/src/modules/barcode-label's model comment on why 'printed'
// isn't reachable yet).
const barcodeLabelApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    BarcodeLabelList: builder.query({
      query: (params) => ({ url: '/barcode-labels', params }),
      transformResponse: (response) => response.data,
      providesTags: (result = []) => [
        ...result.map((row) => ({ type: 'BarcodeLabel', id: row.id })),
        { type: 'BarcodeLabel', id: 'LIST' },
      ],
    }),
    BarcodeLabelById: builder.query({
      query: (id) => `/barcode-labels/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'BarcodeLabel', id }],
    }),
    NextBarcodeLabelCode: builder.query({
      query: () => '/barcode-labels/next-code',
      transformResponse: (response) => response.data.code,
      providesTags: [{ type: 'BarcodeLabel', id: 'NEXT' }],
    }),
    // Feeds the "Barcode & Label" page's top 5-tile summary strip.
    BarcodeLabelSummary: builder.query({
      query: () => '/barcode-labels/summary',
      transformResponse: (response) => response.data,
      providesTags: [{ type: 'BarcodeLabel', id: 'SUMMARY' }],
    }),
    // Feeds the Draft/Pending Print/Printed status pages' 4-tile strip, one
    // status at a time.
    BarcodeLabelStatusSummary: builder.query({
      query: (status) => `/barcode-labels/status-summary/${status}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, status) => [{ type: 'BarcodeLabel', id: `STATUS_SUMMARY_${status}` }],
    }),
    BarcodeLabelCreate: builder.mutation({
      query: (body) => ({ url: '/barcode-labels', method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: [
        { type: 'BarcodeLabel', id: 'LIST' },
        { type: 'BarcodeLabel', id: 'NEXT' },
        { type: 'BarcodeLabel', id: 'SUMMARY' },
      ],
    }),
    BarcodeLabelUpdate: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/barcode-labels/${id}`, method: 'PUT', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'BarcodeLabel', id },
        { type: 'BarcodeLabel', id: 'LIST' },
        { type: 'BarcodeLabel', id: 'SUMMARY' },
      ],
    }),
    BarcodeLabelDelete: builder.mutation({
      query: (id) => ({ url: `/barcode-labels/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [
        { type: 'BarcodeLabel', id },
        { type: 'BarcodeLabel', id: 'LIST' },
        { type: 'BarcodeLabel', id: 'SUMMARY' },
      ],
    }),
  }),
});

export const useGetBarcodeLabelBatchesQuery = barcodeLabelApi.useBarcodeLabelListQuery;
export const useGetBarcodeLabelBatchQuery = barcodeLabelApi.useBarcodeLabelByIdQuery;
export const useNextBarcodeLabelCodeQuery = barcodeLabelApi.useNextBarcodeLabelCodeQuery;
export const useBarcodeLabelSummaryQuery = barcodeLabelApi.useBarcodeLabelSummaryQuery;
export const useBarcodeLabelStatusSummaryQuery = barcodeLabelApi.useBarcodeLabelStatusSummaryQuery;
export const useCreateBarcodeLabelMutation = barcodeLabelApi.useBarcodeLabelCreateMutation;
export const useUpdateBarcodeLabelMutation = barcodeLabelApi.useBarcodeLabelUpdateMutation;
export const useDeleteBarcodeLabelMutation = barcodeLabelApi.useBarcodeLabelDeleteMutation;
