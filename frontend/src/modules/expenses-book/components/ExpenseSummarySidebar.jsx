import { Paper, Stack, Typography, Divider, Box } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';

import { formatCurrency } from '../../../utils/format';

function toNumber(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function SummaryRow({ label, value, strong }) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
      <Typography variant="body2" sx={{ color: strong ? 'inherit' : 'text.secondary', fontWeight: strong ? 800 : 500 }}>
        {label}
      </Typography>
      <Typography variant={strong ? 'subtitle1' : 'body2'} sx={{ fontWeight: 800, color: strong ? 'success.main' : 'text.primary' }}>
        {value}
      </Typography>
    </Stack>
  );
}

/**
 * "Expense Summary" sidebar on the Add Expense form — Amount / Tax /
 * Total Amount, live-updating from the Amount (₹) and Tax (₹) fields
 * (same react-hook-form `useWatch` pattern as the stock-form summary
 * panels), matching the Total Amount field's own read-only computed
 * value shown inline in the form.
 */
export default function ExpenseSummarySidebar() {
  const { control } = useFormContext();
  const amount = toNumber(useWatch({ control, name: 'amount' }));
  const tax = toNumber(useWatch({ control, name: 'tax' }));
  const total = amount + tax;

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Expense Summary</Typography>
      <Stack spacing={1.25}>
        <SummaryRow label="Amount (₹)" value={formatCurrency(amount, { decimals: true })} />
        <SummaryRow label="Tax (₹)" value={formatCurrency(tax, { decimals: true })} />
        <Divider sx={{ my: 0.5 }} />
        <Box sx={{ bgcolor: 'rgba(34,160,107,0.08)', borderRadius: 2, px: 1.5, py: 1 }}>
          <SummaryRow label="Total Amount (₹)" value={formatCurrency(total, { decimals: true })} strong />
        </Box>
      </Stack>
    </Paper>
  );
}
