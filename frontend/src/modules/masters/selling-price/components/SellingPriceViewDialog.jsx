import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Stack, Typography, Button, Grid, Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';

import { formatCurrency } from '../../../../utils/format';
import { formatPickerDate } from '../../../../components/form/FormDatePicker';
import { PRICING_METHOD_OPTIONS } from '../sellingPriceMockData';

function Field({ label, value }) {
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>{value ?? '-'}</Typography>
    </Grid>
  );
}

function pricingMethodLabel(value) {
  return PRICING_METHOD_OPTIONS.find((o) => o.value === value)?.label || value;
}

function statusLabel(value) {
  return String(value).toUpperCase() === 'INACTIVE' ? 'Inactive' : 'Active';
}

/**
 * Read-only "View Selling Price" dialog opened from the Selling Price
 * List's row — reads straight off the real API row (product/outlet joined
 * in). The Edit button loads the row back into the Pricing Calculator
 * above the list (SellingPricePage owns that state) rather than opening a
 * second form, since the calculator already *is* this master's add/edit
 * form.
 */
export default function SellingPriceViewDialog({ open, row, onClose, onEdit }) {
  if (!row) return null;
  const status = statusLabel(row.status);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <CurrencyRupeeOutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography sx={{ fontWeight: 800, fontSize: 17 }}>Selling Price Details</Typography>
        </Stack>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Field label="Item Code" value={row.product?.code} />
          <Field label="Item Name" value={row.product?.name} />
          <Field label="Price List" value={row.priceList} />
          <Field label="Outlet / Branch" value={row.outlet?.name || 'All Outlets'} />
          <Field label="MRP" value={formatCurrency(row.mrp, { decimals: true })} />
          <Field label="Purchase Cost" value={formatCurrency(row.purchaseCost, { decimals: true })} />
          <Field label="Pricing Method" value={pricingMethodLabel(row.pricingMethod)} />
          <Field label="Margin %" value={`${Number(row.marginPercent).toFixed(2)}%`} />
          <Field label="Selling Price (Excl. Tax)" value={formatCurrency(row.sellingPriceExclTax, { decimals: true })} />
          <Field label="Selling Price (Incl. Tax)" value={formatCurrency(row.sellingPriceInclTax, { decimals: true })} />
          <Field label="Effective From" value={row.effectiveFrom ? formatPickerDate(new Date(row.effectiveFrom)) : '-'} />
          <Field label="Effective To" value={row.effectiveTo ? formatPickerDate(new Date(row.effectiveTo)) : '-'} />
          <Field label="Approval Required" value={row.approvalRequired ? 'Yes' : 'No'} />
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Status</Typography>
            <Chip
              label={status}
              size="small"
              sx={{
                bgcolor: status === 'Active' ? 'rgba(34,160,107,0.12)' : 'rgba(107,114,128,0.12)',
                color: status === 'Active' ? 'success.main' : 'text.secondary',
                fontWeight: 700, height: 22, mt: 0.5,
              }}
            />
          </Grid>
          {row.priceUpdateReason && <Field label="Price Update Reason" value={row.priceUpdateReason} />}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={onEdit}>Edit</Button>
      </DialogActions>
    </Dialog>
  );
}
