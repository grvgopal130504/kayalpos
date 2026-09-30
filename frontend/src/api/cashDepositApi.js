import { baseApi } from './baseApi';

// Hand-rolled (not createCrudApi), same reason as Cash Withdrawal's own API:
// Cash Deposit only needs a report read and a create-deposit mutation right
// now, not a full list/update/delete CRUD surface.
const cashDepositApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Real Cash Deposit report (stat tiles, Deposit Summary / Deposit
    // Summary (By Purpose), the purpose donut, and paginated transactions)
    // for the Cashier Panel's Cash Deposit page — see backend/src/modules/
    // cash-deposit/cashDeposit.service.js's getCashDepositReport.
    // `params`: { date?: 'YYYY-MM-DD', page?, pageSize? }.
    CashDepositReport: builder.query({
      query: (params) => ({ url: '/cash-deposits/summary', params }),
      transformResponse: (response) => response.data,
      providesTags: [{ type: 'CashDeposit', id: 'SUMMARY' }],
    }),
    // Records a real cash deposit out of the drawer — see
    // cashDeposit.service.js's createCashDeposit for the "must have an
    // open shift" / "can't exceed available cash" validations.
    CreateCashDeposit: builder.mutation({
      query: (body) => ({ url: '/cash-deposits', method: 'POST', body }),
      transformResponse: (response) => response.data,
      // A new deposit changes this report's own totals/transactions and,
      // since it draws down the current shift's cash, could also affect
      // the Shift Opening/Closing status strip. Also invalidates
      // CashWithdrawal's and CashTransfer's own summaries since their
      // closingCashActual figures now factor in the day's real deposits
      // too (all three movements share the same drawer). Also invalidates
      // the Cashier Panel landing page's summary, whose Cash Summary
      // (Today) panel factors in the same deposits.
      invalidatesTags: [
        { type: 'CashDeposit', id: 'SUMMARY' },
        { type: 'CashWithdrawal', id: 'SUMMARY' },
        { type: 'CashTransfer', id: 'SUMMARY' },
        { type: 'ShiftSession', id: 'STATUS' },
        { type: 'CashierPanel', id: 'SUMMARY' },
      ],
    }),
  }),
});

export const useCashDepositReportQuery = cashDepositApi.useCashDepositReportQuery;
export const useCreateCashDepositMutation = cashDepositApi.useCreateCashDepositMutation;
