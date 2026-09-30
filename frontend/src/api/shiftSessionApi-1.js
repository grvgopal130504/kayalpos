import { baseApi } from './baseApi';

// Hand-rolled (not createCrudApi), same reason as Stock Count's own
// summary/next-code endpoints: Shift Opening/Closing only need a status
// read (is a shift already open, what's the next shift number, what's the
// real previous closing cash, and — while a shift IS open — a live preview
// of its expected closing cash) plus the two create-flow mutations that
// open and close a shift. A shift history list is a separate report — see
// shiftClosingApi.js's ShiftClosingReport — so there's no list/update/
// delete here.
const shiftSessionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    ShiftSessionStatus: builder.query({
      query: () => '/shift-sessions/status',
      transformResponse: (response) => response.data,
      providesTags: [{ type: 'ShiftSession', id: 'STATUS' }],
    }),
    ShiftSessionById: builder.query({
      query: (id) => `/shift-sessions/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'ShiftSession', id }],
    }),
    ShiftSessionOpen: builder.mutation({
      query: (body) => ({ url: '/shift-sessions', method: 'POST', body }),
      transformResponse: (response) => response.data,
      // Opening a shift IS a drawer-opening event — see
      // cashDrawerOpening.service.js's getCashDrawerOpeningReport, which
      // reads ShiftSession rows directly — so its report needs
      // invalidating too, not just the status strip.
      invalidatesTags: [{ type: 'ShiftSession', id: 'STATUS' }, { type: 'CashDrawerOpening', id: 'SUMMARY' }],
    }),
    ShiftSessionClose: builder.mutation({
      query: (body) => ({ url: '/shift-sessions/close', method: 'POST', body }),
      transformResponse: (response) => response.data,
      // Closing a shift IS a shift-closing report event, and it frees the
      // outlet's drawer for the next Shift Opening — see
      // shiftClosing.service.js's getShiftClosingReport and
      // shiftSession.service.js's closeShift.
      invalidatesTags: [{ type: 'ShiftSession', id: 'STATUS' }, { type: 'ShiftClosing', id: 'SUMMARY' }],
    }),
  }),
});

export const useShiftSessionStatusQuery = shiftSessionApi.useShiftSessionStatusQuery;
export const useShiftSessionByIdQuery = shiftSessionApi.useShiftSessionByIdQuery;
export const useOpenShiftMutation = shiftSessionApi.useShiftSessionOpenMutation;
export const useCloseShiftMutation = shiftSessionApi.useShiftSessionCloseMutation;
