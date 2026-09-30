import { Paper, Stack, Typography, Divider } from '@mui/material';

import { formatCurrency } from '../../../utils/format';

/**
 * "Close Shift Summary" panel on the Shift Closing form — Expected Cash
 * (the live drawer-cash preview from GET /shift-sessions/status's
 * currentShiftExpectedCash, computed the same way closeShift() will
 * compute it on submit) against Total Closing Cash (the denomination
 * table's live count), with the difference called out as a real Variance
 * — Excess when more cash was counted than expected, Shortage when less,
 * Balanced when they match exactly. Mirrors ShiftOpeningSummary's
 * Excess/Shortage/Balanced framing for the opening side of the same
 * drawer.
 */
export default function ShiftClosingSummary({ expectedCash, totalClosingCash }) {
  const variance = totalClosingCash - expectedCash;
  const varianceType = variance > 0 ? 'Excess' : variance < 0 ? 'Shortage' : 'Balanced';
  const varianceColor = variance > 0 ? 'success.main' : variance < 0 ? 'error.main' : 'text.secondary';

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Close Shift Summary</Typography>
      <Stack spacing={1.25}>
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Expected Cash (₹)</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(expectedCash, { decimals: true })}</Typography>
        </Stack>
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Total Closing Cash (₹)</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(totalClosingCash, { decimals: true })}</Typography>
        </Stack>
        {totalClosingCash <= 0 && (
          <Typography variant="caption" sx={{ color: 'error.main' }}>
            Enter at least one note or coin count above — a shift can't close with ₹0.00.
          </Typography>
        )}
        <Divider sx={{ my: 0.5 }} />
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Variance (₹)</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(Math.abs(variance), { decimals: true })}</Typography>
        </Stack>
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Variance Type</Typography>
          <Typography variant="body2" sx={{ fontWeight: 800, color: varianceColor }}>{varianceType}</Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
