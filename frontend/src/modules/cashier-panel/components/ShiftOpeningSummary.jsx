import { Paper, Stack, Typography, Divider } from '@mui/material';

import { formatCurrency } from '../../../utils/format';

/**
 * "Opening Summary" panel on the Shift Opening form — Total Opening Cash
 * (the denomination table's live total) against Previous Closing Cash,
 * with the Difference called out and labeled Excess / Shortage / Balanced
 * depending on sign, matching the reference's green "Excess" tag. A ₹0.00
 * total can't be submitted (the schema requires it > 0 — see
 * shiftOpeningSchema.js), so this shows the reason right where the cashier
 * is looking, rather than only in a toast after they click Open Shift.
 */
export default function ShiftOpeningSummary({ totalOpeningCash, previousClosingCash }) {
  const difference = totalOpeningCash - previousClosingCash;
  const differenceType = difference > 0 ? 'Excess' : difference < 0 ? 'Shortage' : 'Balanced';
  const differenceColor = difference > 0 ? 'success.main' : difference < 0 ? 'error.main' : 'text.secondary';

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Opening Summary</Typography>
      <Stack spacing={1.25}>
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Total Opening Cash (₹)</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(totalOpeningCash, { decimals: true })}</Typography>
        </Stack>
        {totalOpeningCash <= 0 && (
          <Typography variant="caption" sx={{ color: 'error.main' }}>
            Enter at least one note or coin count above — a shift can't open with ₹0.00.
          </Typography>
        )}
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Previous Closing Cash (₹)</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(previousClosingCash, { decimals: true })}</Typography>
        </Stack>
        <Divider sx={{ my: 0.5 }} />
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Difference (₹)</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(Math.abs(difference), { decimals: true })}</Typography>
        </Stack>
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Difference Type</Typography>
          <Typography variant="body2" sx={{ fontWeight: 800, color: differenceColor }}>{differenceType}</Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
