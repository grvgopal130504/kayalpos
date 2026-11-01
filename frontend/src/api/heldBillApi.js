import { baseApi } from './baseApi';

// Held ("parked") bills — see backend/src/modules/held-bill. A held bill is a
// saved cart, NOT a sale: none of these endpoints take payment, issue an
// invoice number or move stock. Paying a resumed bill goes through the
// normal CreateSale mutation (saleApi.js) with `heldBillId` attached.
const heldBillApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Bills this cashier can pick up (parked ones + their own unfinished
    // resumed ones). Scoped server-side by outlet/cashier from the JWT.
    HeldBills: builder.query({
      query: () => '/held-bills',
      transformResponse: (response) => response.data,
      providesTags: [{ type: 'HeldBill', id: 'LIST' }],
    }),
    // body: { customerId?, customerName, lines: [{productId, qty}], discountType,
    // discountValue, clientToken } — clientToken makes a retried request
    // idempotent (no duplicate held bill).
    HoldBill: builder.mutation({
      query: (body) => ({ url: '/held-bills', method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: [{ type: 'HeldBill', id: 'LIST' }],
    }),
    // Re-park an already-held/resumed bill in place (replaces its lines).
    UpdateHeldBill: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/held-bills/${id}`, method: 'PUT', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: [{ type: 'HeldBill', id: 'LIST' }],
    }),
    // Claims the bill (atomic server-side) and returns its full contents.
    ResumeHeldBill: builder.mutation({
      query: (id) => ({ url: `/held-bills/${id}/resume`, method: 'POST' }),
      transformResponse: (response) => response.data,
      invalidatesTags: [{ type: 'HeldBill', id: 'LIST' }],
    }),
    DiscardHeldBill: builder.mutation({
      query: (id) => ({ url: `/held-bills/${id}`, method: 'DELETE' }),
      transformResponse: (response) => response.data,
      invalidatesTags: [{ type: 'HeldBill', id: 'LIST' }],
    }),
  }),
});

export const useHeldBillsQuery = heldBillApi.useHeldBillsQuery;
export const useHoldBillMutation = heldBillApi.useHoldBillMutation;
export const useUpdateHeldBillMutation = heldBillApi.useUpdateHeldBillMutation;
export const useResumeHeldBillMutation = heldBillApi.useResumeHeldBillMutation;
export const useDiscardHeldBillMutation = heldBillApi.useDiscardHeldBillMutation;
