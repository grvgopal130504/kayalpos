import { Paper, Stack, Typography, Chip } from '@mui/material';

import LabeledRow from '../../../components/common/LabeledRow';
import { formatCurrency } from '../../../utils/format';

/**
 * "Current Shift Details" panel — plain label/value rows built on the
 * shared LabeledRow (same as Expense Summary/Profit Overview elsewhere),
 * with Status rendered as a small green "OPEN" chip to match the
 * reference instead of plain text.
 */
export default function CashierShiftDetails({ shift }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Current Shift Details</Typography>
      <LabeledRow label="Shift ID" value={shift.id} />
      <LabeledRow label="Shift Opened On" value={shift.openedOn} />
      <LabeledRow label="Cashier" value={shift.cashier} />
      <LabeledRow label="Opening Cash (₹)" value={formatCurrency(shift.openingCash, { decimals: true })} />
      <LabeledRow label="Opening Cash By" value={shift.openingCashBy} />
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', py: 0.65 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Status</Typography>
        <Chip label={shift.status} size="small" sx={{ bgcolor: 'rgba(34,160,107,0.12)', color: 'success.main', fontWeight: 700, height: 22 }} />
      </Stack>
    </Paper>
  );
}
