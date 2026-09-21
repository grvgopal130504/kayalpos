import { Paper, Stack, Box, Typography, Divider } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';

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
 * Summary panel on the Create Stock Transfer form — Total Items / Total
 * Transfer Qty / Total Estimated Value / Total Value. Only rows with an
 * Item Code filled in count toward the totals, so with every row still
 * blank (the form's default state) all figures read 0 / 0.00. Total
 * Estimated Value now looks up each row's real unit cost from the actual
 * Product master (via the `productByCode` map built in
 * CreateStockTransferPage from useGetProductsQuery) instead of the old
 * fixed 5-item demo cost lookup — an item code with no matching product
 * honestly contributes 0 rather than a fabricated number. Total Value
 * mirrors the other forms' highlighted Grand-Total row — there's no tax on
 * an internal stock movement, so it equals Total Estimated Value. This is a
 * client-side preview only; the real authoritative totals are computed
 * server-side on save (see stockTransfer.service.js's computeItems).
 */
export default function TransferSummaryTotals({ productByCode = {} }) {
  const { control } = useFormContext();
  const items = useWatch({ control, name: 'items' });

  const filledRows = items.filter((row) => row.itemCode.trim());
  const totalItems = filledRows.length;
  const totalTransferQty = filledRows.reduce((sum, row) => sum + toNumber(row.transferQty), 0);
  const totalEstimatedValue = filledRows.reduce((sum, row) => {
    const product = productByCode[row.itemCode.trim()];
    const unitCost = product ? Number(product.salePrice) : 0;
    return sum + toNumber(row.transferQty) * unitCost;
  }, 0);
  const totalValue = totalEstimatedValue;

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
      <Stack spacing={1.25}>
        <TotalRow label="Total Items" value={String(totalItems)} />
        <TotalRow label="Total Transfer Qty" value={totalTransferQty.toFixed(2)} />
        <TotalRow label="Total Estimated Value (₹)" value={formatCurrency(totalEstimatedValue, { decimals: true })} />
        <Divider sx={{ my: 0.5 }} />
        <Box sx={{ bgcolor: 'rgba(37,99,235,0.08)', borderRadius: 2, px: 1.5, py: 1 }}>
          <TotalRow label="Total Value (₹)" value={formatCurrency(totalValue, { decimals: true })} strong />
        </Box>
      </Stack>
    </Paper>
  );
}
