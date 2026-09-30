import { baseApi } from './baseApi';

// Hand-rolled (not createCrudApi), same reason as Shift Session's own API:
// Cash Withdrawal only needs a report read and a create-withdrawal
// mutation right now, not a full list/update/delete CRUD surface.
const cashWithdrawalApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Real Cash Withdrawal report (stat tiles, Withdrawal Summary /
    // Withdrawal Summary (By Purpose), the purpose donut, and paginated
    // transactions) for the Cashier Panel's Cash Withdrawal page — see
    // backend/src/modules/cash-withdrawal/cashWithdrawal.service.js's
    // getCashWithdrawalReport. `params`: { date?: 'YYYY-MM-DD', page?, pageSize? }.
    CashWithdrawalReport: builder.query({
      query: (params) => ({ url: '/cash-withdrawals/summary', params }),
      transformResponse: (response) => response.data,
      providesTags: [{ type: 'CashWithdrawal', id: 'SUMMARY' }],
    }),
    // Records a real cash withdrawal from the drawer — see
    // cashWithdrawal.service.js's createCashWithdrawal for the "must have
    // an open shift" / "can't exceed available cash" validations.
    CreateCashWithdrawal: builder.mutation({
      query: (body) => ({ url: '/cash-withdrawals', method: 'POST', body }),
      transformResponse: (response) => response.data,
      // A new withdrawal changes this report's own totals/transactions and,
      // since it draws down the current shift's cash, could also affect
      // the Shift Opening/Closing status strip if that ever surfaces a
      // live cash position. Also invalidates CashDeposit's and
      // CashTransfer's own summaries since their closingCashActual figures
      // now factor in the day's real withdrawals too (all three movements
      // share the same drawer). Also invalidates the Cashier Panel landing
      // page's summary, whose Cash Summary (Today) panel factors in the
      // same withdrawals.
      invalidatesTags: [
        { type: 'CashWithdrawal', id: 'SUMMARY' },
        { type: 'CashDeposit', id: 'SUMMARY' },
        { type: 'CashTransfer', id: 'SUMMARY' },
        { type: 'ShiftSession', id: 'STATUS' },
        { type: 'CashierPanel', id: 'SUMMARY' },
      ],
    }),
  }),
});

export const useCashWithdrawalReportQuery = cashWithdrawalApi.useCashWithdrawalReportQuery;
export const useCreateCashWithdrawalMutation = cashWithdrawalApi.useCreateCashWithdrawalMutation;
