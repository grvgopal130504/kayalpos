import { Paper, Stack, Typography, Divider } from '@mui/material';

import LabeledRow from '../../../components/common/LabeledRow';
import { formatCurrency } from '../../../utils/format';

/**
 * "Cash Summary (Today)" panel — Opening Cash through Cash Transfer
 * In/Out as plain LabeledRow lines, with Expected Cash in Hand called out
 * in bold blue at the bottom (same plain-emphasized-row treatment as
 * CashierPaymentSummary's Total Sales).
 */
export default function CashierCashSummary({ summary }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Cash Summary (Today)</Typography>
      <LabeledRow label="Opening Cash" value={formatCurrency(summary.openingCash, { decimals: true })} />
      <LabeledRow label="Cash Received" value={formatCurrency(summary.cashReceived, { decimals: true })} />
      <LabeledRow label="Cash Withdrawal" value={formatCurrency(summary.cashWithdrawal, { decimals: true })} />
      <LabeledRow label="Cash Deposit" value={formatCurrency(summary.cashDeposit, { decimals: true })} />
      <LabeledRow label="Cash Transfer (In)" value={formatCurrency(summary.cashTransferIn, { decimals: true })} />
      <LabeledRow label="Cash Transfer (Out)" value={formatCurrency(summary.cashTransferOut, { decimals: true })} />
      <Divider sx={{ my: 1 }} />
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ fontWeight: 800, color: '#2563EB' }}>Expected Cash in Hand (₹)</Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#2563EB' }}>
          {formatCurrency(summary.expectedCashInHand, { decimals: true })}
        </Typography>
      </Stack>
    </Paper>
  );
}
