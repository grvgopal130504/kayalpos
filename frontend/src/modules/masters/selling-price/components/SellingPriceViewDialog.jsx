import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Stack, Typography, Button, Grid, Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';

import { formatCurrency } from '../../../../utils/format';

function Field({ label, value }) {
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>{value ?? '-'}</Typography>
    </Grid>
  );
}

/**
 * Read-only "View Selling Price" dialog opened from the Selling Price
 * List's row. The Edit button loads the row back into the Pricing
 * Calculator above the list (SellingPricePage owns that state) rather
 * than opening a second form, since the calculator already *is* this
 * master's add/edit form.
 */
export default function SellingPriceViewDialog({ open, row, onClose, onEdit }) {
  if (!row) return null;
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
          <Field label="Item Code" value={row.itemCode} />
          <Field label="Item Name" value={row.itemName} />
          <Field label="Price List" value={row.priceList} />
          <Field label="MRP" value={formatCurrency(row.mrp, { decimals: true })} />
          <Field label="Pricing Method" value={row.pricingMethod} />
          <Field label="Margin %" value={`${row.marginPercent.toFixed(2)}%`} />
          <Field label="Selling Price (Excl. Tax)" value={formatCurrency(row.sellingPriceExclTax, { decimals: true })} />
          <Field label="Selling Price (Incl. Tax)" value={formatCurrency(row.sellingPriceInclTax, { decimals: true })} />
          <Field label="Effective From" value={row.effectiveFrom} />
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Status</Typography>
            <Chip
              label={row.status}
              size="small"
              sx={{
                bgcolor: row.status === 'Active' ? 'rgba(34,160,107,0.12)' : 'rgba(107,114,128,0.12)',
                color: row.status === 'Active' ? 'success.main' : 'text.secondary',
                fontWeight: 700, height: 22, mt: 0.5,
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={onEdit}>Edit</Button>
      </DialogActions>
    </Dialog>
  );
}
