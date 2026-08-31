import { Paper, Stack, Box, Typography, Divider } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';

import { computeVarianceQty, computeVarianceValue } from './CountItemsTable';
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
 * Summary panel on the Create Stock Count form — Total Items / Total
 * System Qty / Total Counted Qty / Total Variance Qty / Total Variance
 * Value, matching the reference. Only rows with an Item Code filled in
 * count toward the totals (same rule as WastageSummaryTotals/
 * ReturnSummaryTotals), so with every row still blank — the form's
 * default state — every figure reads 0 / 0.00, exactly as in the
 * reference screenshot. Total Count Value mirrors the other forms'
 * highlighted Grand-Total row, valuing the counted quantity at Unit Cost.
 */
export default function CountSummaryTotals() {
  const { control } = useFormContext();
  const items = useWatch({ control, name: 'items' });

  const filledRows = items.filter((row) => row.itemCode.trim());
  const totalItems = filledRows.length;
  const totalSystemQty = filledRows.reduce((sum, row) => sum + toNumber(row.systemQty), 0);
  const totalCountedQty = filledRows.reduce((sum, row) => sum + toNumber(row.countedQty), 0);
  const totalVarianceQty = filledRows.reduce((sum, row) => sum + computeVarianceQty(row), 0);
  const totalVarianceValue = filledRows.reduce((sum, row) => sum + computeVarianceValue(row), 0);
  const totalCountValue = filledRows.reduce((sum, row) => sum + toNumber(row.countedQty) * toNumber(row.unitCost), 0);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
      <Stack spacing={1.25}>
        <TotalRow label="Total Items" value={String(totalItems)} />
        <TotalRow label="Total System Qty" value={totalSystemQty.toFixed(2)} />
        <TotalRow label="Total Counted Qty" value={totalCountedQty.toFixed(2)} />
        <TotalRow label="Total Variance Qty" value={totalVarianceQty.toFixed(2)} />
        <TotalRow label="Total Variance Value (₹)" value={formatCurrency(totalVarianceValue, { decimals: true })} />
        <Divider sx={{ my: 0.5 }} />
        <Box sx={{ bgcolor: 'rgba(37,99,235,0.08)', borderRadius: 2, px: 1.5, py: 1 }}>
          <TotalRow label="Total Count Value (₹)" value={formatCurrency(totalCountValue, { decimals: true })} strong />
        </Box>
      </Stack>
    </Paper>
  );
}
