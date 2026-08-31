import { Paper, Stack, Box, Typography, Divider } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';

import { computeLineValue } from './WastageItemsTable';
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
 * Summary panel on the Create Stock Wastage form — Total Items / Total
 * Wastage Qty / Total Wastage Value, matching the reference. Only rows
 * with an Item Code filled in count toward the totals (same rule as
 * ReturnSummaryTotals/TransferSummaryTotals), so with every row still
 * blank — the form's default state — every figure reads 0 / 0.00, exactly
 * as in the reference screenshot. Total Value mirrors the other forms'
 * highlighted Grand-Total row — there's no tax on a stock write-off, so it
 * equals Total Wastage Value.
 */
export default function WastageSummaryTotals() {
  const { control } = useFormContext();
  const items = useWatch({ control, name: 'items' });

  const filledRows = items.filter((row) => row.itemCode.trim());
  const totalItems = filledRows.length;
  const totalWastageQty = filledRows.reduce((sum, row) => sum + toNumber(row.wastageQty), 0);
  const totalWastageValue = filledRows.reduce((sum, row) => sum + computeLineValue(row), 0);
  const totalValue = totalWastageValue;

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
      <Stack spacing={1.25}>
        <TotalRow label="Total Items" value={String(totalItems)} />
        <TotalRow label="Total Wastage Qty" value={totalWastageQty.toFixed(2)} />
        <TotalRow label="Total Wastage Value (₹)" value={formatCurrency(totalWastageValue, { decimals: true })} />
        <Divider sx={{ my: 0.5 }} />
        <Box sx={{ bgcolor: 'rgba(37,99,235,0.08)', borderRadius: 2, px: 1.5, py: 1 }}>
          <TotalRow label="Total Value (₹)" value={formatCurrency(totalValue, { decimals: true })} strong />
        </Box>
      </Stack>
    </Paper>
  );
}
