import { Paper, Stack, Box, Typography, Divider, TextField } from '@mui/material';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { formatCurrency } from '../../../utils/format';

const TAX_RATE = 2.5; // SGST + CGST, matching the reference order detail cards

function toNumber(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function TotalRow({ label, value, strong, action }) {
  return (
    <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="body2" sx={{ color: strong ? 'inherit' : 'text.secondary', fontWeight: strong ? 800 : 500 }}>
        {label}
      </Typography>
      {action || (
        <Typography variant={strong ? 'subtitle1' : 'body2'} sx={{ fontWeight: 800, color: strong ? 'success.main' : 'text.primary' }}>
          {value}
        </Typography>
      )}
    </Stack>
  );
}

/**
 * Right-hand totals summary on the Create Sales Order form — mirrors
 * QuotationTotalsCard exactly (Sub Total / Discount / Taxable Amount /
 * SGST / CGST / Grand Total), derived live from the items grid.
 */
export default function OrderTotalsCard() {
  const { control } = useFormContext();
  const items = useWatch({ control, name: 'items' });
  const extraDiscount = useWatch({ control, name: 'extraDiscount' });

  const subTotal = items.reduce((sum, row) => sum + toNumber(row.qty) * toNumber(row.unitPrice), 0);
  const lineDiscounts = items.reduce((sum, row) => {
    const lineTotal = toNumber(row.qty) * toNumber(row.unitPrice);
    return sum + (lineTotal * toNumber(row.discountPercent)) / 100;
  }, 0);
  const discount = lineDiscounts + toNumber(extraDiscount);
  const taxableAmount = Math.max(subTotal - discount, 0);
  const sgst = (taxableAmount * TAX_RATE) / 100;
  const cgst = (taxableAmount * TAX_RATE) / 100;
  const grandTotal = taxableAmount + sgst + cgst;

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Summary</Typography>
      <Stack spacing={1.25}>
        <TotalRow label="Sub Total" value={formatCurrency(subTotal, { decimals: true })} />
        <TotalRow
          label="Discount"
          action={(
            <Controller
              name="extraDiscount"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  sx={{ width: 110 }}
                  slotProps={{ input: { sx: { textAlign: 'right' } } }}
                  inputMode="decimal"
                />
              )}
            />
          )}
        />
        <TotalRow label="Taxable Amount" value={formatCurrency(taxableAmount, { decimals: true })} />
        <TotalRow label={`SGST (${TAX_RATE}%)`} value={formatCurrency(sgst, { decimals: true })} />
        <TotalRow label={`CGST (${TAX_RATE}%)`} value={formatCurrency(cgst, { decimals: true })} />
        <Divider sx={{ my: 0.5 }} />
        <Box sx={{ bgcolor: 'rgba(34,160,107,0.08)', borderRadius: 2, px: 1.5, py: 1 }}>
          <TotalRow label="Grand Total" value={formatCurrency(grandTotal, { decimals: true })} strong />
        </Box>
      </Stack>
    </Paper>
  );
}
