import { baseApi } from './baseApi';

// Hand-rolled (not createCrudApi), same reason as Cash Withdrawal's/Cash
// Deposit's/Cash Transfer's own APIs: Expenses Book only needs a report
// read and a create-expense mutation right now, not a full
// list/update/delete CRUD surface.
const expenseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Real Expenses Book report (stat tiles, Expense Summary, the
    // Expenses by Category / Expenses by Payment Mode donuts, and
    // paginated transactions) — see backend/src/modules/expense/
    // expense.service.js's getExpenseReport. `params`: { date?:
    // 'YYYY-MM-DD', page?, pageSize? }.
    ExpenseReport: builder.query({
      query: (params) => ({ url: '/expenses/summary', params }),
      transformResponse: (response) => response.data,
      providesTags: [{ type: 'Expense', id: 'SUMMARY' }],
    }),
    // Logs a real expense entry — see expense.service.js's createExpense.
    // Unlike the cash-drawer movements, this has no "must have an open
    // shift" validation, and it doesn't touch the Cashier Panel's Cash
    // Summary figures (an expense isn't a shift drawer movement), so
    // nothing outside this report's own tag needs invalidating.
    CreateExpense: builder.mutation({
      query: (body) => ({ url: '/expenses', method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: [{ type: 'Expense', id: 'SUMMARY' }],
    }),
  }),
});

export const useExpenseReportQuery = expenseApi.useExpenseReportQuery;
export const useCreateExpenseMutation = expenseApi.useCreateExpenseMutation;
