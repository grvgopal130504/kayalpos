import { Paper, Stack, Box, Typography, Divider } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';

import { computeLineTotal } from './ReturnItemsTable';
import { formatCurrency } from '../../../utils/format';

function toNumber(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function TotalRow({ label, value, strong }) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
      <Typography variant="body2" sx={{ color: strong ? 'inherit' : 'text.secondary', fontWeight: strong ? 800 : 500 }}>
        {label}
      </Typography>
      <Typography variant={strong ? 'subtitle1' : 'body2'} sx={{ fontWeight: 800, color: strong ? 'primary.main' : 'text.primary' }}>
        {value}
      </Typography>
    </Stack>
  );
}

/**
 * Summary panel on the Create Stock Return form — Total Items / Total
 * Returned Qty / Total Discount / Total Tax / Total Amount, matching the
 * reference. Only rows with an Item Code filled in count toward the
 * totals (same rule as ReceiptSummaryTotals/TransferSummaryTotals), so
 * with every row still blank — the form's default state — every figure
 * reads 0 / 0.00, exactly as in the reference screenshot.
 */
export default function ReturnSummaryTotals() {
  const { control } = useFormContext();
  const items = useWatch({ control, name: 'items' });

  const filledRows = items.filter((row) => row.itemCode.trim());
  const totalItems = filledRows.length;
  const totalReturnedQty = filledRows.reduce((sum, row) => sum + toNumber(row.returnedQty), 0);
  const totalDiscount = filledRows.reduce((sum, row) => {
    const base = toNumber(row.returnedQty) * toNumber(row.unitCost);
    return sum + (base * toNumber(row.discount)) / 100;
  }, 0);
  const totalTax = filledRows.reduce((sum, row) => {
    const base = toNumber(row.returnedQty) * toNumber(row.unitCost);
    const afterDiscount = base - (base * toNumber(row.discount)) / 100;
    return sum + (afterDiscount * toNumber(row.tax)) / 100;
  }, 0);
  const totalAmount = filledRows.reduce((sum, row) => sum + computeLineTotal(row), 0);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
      <Stack spacing={1.25}>
        <TotalRow label="Total Items" value={String(totalItems)} />
        <TotalRow label="Total Returned Qty" value={totalReturnedQty.toFixed(2)} />
        <TotalRow label="Total Discount (₹)" value={formatCurrency(totalDiscount, { decimals: true })} />
        <TotalRow label="Total Tax (₹)" value={formatCurrency(totalTax, { decimals: true })} />
        <Divider sx={{ my: 0.5 }} />
        <Box sx={{ bgcolor: 'rgba(37,99,235,0.08)', borderRadius: 2, px: 1.5, py: 1 }}>
          <TotalRow label="Total Amount (₹)" value={formatCurrency(totalAmount, { decimals: true })} strong />
        </Box>
      </Stack>
    </Paper>
  );
}
