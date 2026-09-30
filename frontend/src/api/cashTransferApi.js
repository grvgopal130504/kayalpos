import { baseApi } from './baseApi';

// Hand-rolled (not createCrudApi), same reason as Cash Withdrawal's/Cash
// Deposit's own APIs: Cash Transfer only needs a report read and a
// create-transfer mutation right now, not a full list/update/delete CRUD
// surface.
const cashTransferApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Real Cash Transfer report (stat tiles, Transfer Summary / Transfer
    // Summary (By Purpose), the purpose donut, and paginated transactions)
    // for the Cashier Panel's Cash Transfer page — see backend/src/modules/
    // cash-transfer/cashTransfer.service.js's getCashTransferReport.
    // `params`: { date?: 'YYYY-MM-DD', page?, pageSize? }.
    CashTransferReport: builder.query({
      query: (params) => ({ url: '/cash-transfers/summary', params }),
      transformResponse: (response) => response.data,
      providesTags: [{ type: 'CashTransfer', id: 'SUMMARY' }],
    }),
    // Records a real cash transfer out of the drawer to a named
    // destination — see cashTransfer.service.js's createCashTransfer for
    // the "must have an open shift" / "can't exceed available cash"
    // validations.
    CreateCashTransfer: builder.mutation({
      query: (body) => ({ url: '/cash-transfers', method: 'POST', body }),
      transformResponse: (response) => response.data,
      // A new transfer changes this report's own totals/transactions and,
      // since it draws down the current shift's cash, could also affect
      // the Shift Opening/Closing status strip. Also invalidates
      // CashWithdrawal's and CashDeposit's own summaries since their
      // closingCashActual figures now factor in the day's real transfers
      // too (all three movements share the same drawer). Also invalidates
      // the Cashier Panel landing page's summary, whose Cash Summary
      // (Today) panel factors in the same transfers.
      invalidatesTags: [
        { type: 'CashTransfer', id: 'SUMMARY' },
        { type: 'CashWithdrawal', id: 'SUMMARY' },
        { type: 'CashDeposit', id: 'SUMMARY' },
        { type: 'ShiftSession', id: 'STATUS' },
        { type: 'CashierPanel', id: 'SUMMARY' },
      ],
    }),
  }),
});

export const useCashTransferReportQuery = cashTransferApi.useCashTransferReportQuery;
export const useCreateCashTransferMutation = cashTransferApi.useCreateCashTransferMutation;
