import { z } from 'zod';

// One row from the Shift Opening form's denomination grid. unitValue is
// null only for the "Coins" bundle row (₹1/₹2/₹5 combined) — every other
// row must carry the real face value it was seeded with. pieces/amount are
// accepted as typed, but never trusted as the final total — the service
// always recomputes amount = unitValue * pieces itself (see
// shiftSession.service.js's computeTotalOpeningCash), same "server
// recomputes, never trusts the client's math" rule StockCount's variance
// totals follow.
const denominationSchema = z.object({
  key: z.string().trim().min(1),
  label: z.string().trim().min(1),
  unitValue: z.coerce.number().nullable(),
  pieces: z.coerce.number().int('Pieces must be a whole number').min(0, 'Pieces cannot be negative').default(0),
  amount: z.coerce.number().min(0, 'Amount cannot be negative').default(0),
});

// shiftNo is optional — if the client omits it, the service assigns the
// next sequential number for the outlet (see nextShiftNo), same
// auto-generated-code convention every other module follows. outletId/
// cashierId/cashierName are deliberately NOT accepted here — the route
// always takes those from req.user (the verified JWT), never from the
// request body, so a shift can never be opened "as" another cashier or
// against an outlet the caller isn't logged into.
export const createShiftOpeningSchema = z.object({
  shiftDate: z.coerce.date(),
  shiftNo: z.string().trim().min(1).optional(),
  shiftName: z.string().trim().optional().or(z.literal('')),
  startTime: z.string().trim().min(1, 'Shift start time is required'),
  endTime: z.string().trim().optional().or(z.literal('')),
  description: z.string().trim().optional().or(z.literal('')),
  notes: z.string().trim().optional().or(z.literal('')),
  attachmentName: z.string().trim().optional().or(z.literal('')),
  agreedTerms: z
    .boolean()
    .refine((v) => v === true, { message: 'You must agree to the terms & conditions to open the shift' }),
  denominations: z.array(denominationSchema).min(1, 'Add at least one denomination row'),
});

// Closes the outlet's currently OPEN shift. There's no shiftId in the
// body — same "always act on req.user's outlet, never a client-supplied
// id" rule openShift follows — closeShift() (shiftSession.service.js)
// looks up the OPEN shift for the caller's outlet itself. `denominations`
// is the closing-cash count grid, same shape/rules as the opening one;
// the service recomputes its total and never trusts data.amount as sent.
export const closeShiftSchema = z.object({
  remarks: z.string().trim().optional().or(z.literal('')),
  denominations: z.array(denominationSchema).min(1, 'Add at least one denomination row'),
});
