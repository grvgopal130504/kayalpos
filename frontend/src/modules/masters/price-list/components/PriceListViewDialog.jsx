import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Stack, Typography, Button, Grid, Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

import { formatNumber } from '../../../../utils/format';
import { formatPickerDate } from '../../../../components/form/FormDatePicker';

function Field({ label, value }) {
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>{value ?? '-'}</Typography>
    </Grid>
  );
}

function formatRowDate(value) {
  return value ? formatPickerDate(new Date(value)) : '-';
}

/** Read-only "View Price List" dialog with an Edit button — real API row shape (basePriceList joined in, status enum). */
export default function PriceListViewDialog({ open, row, onClose, onEdit }) {
  if (!row) return null;
  const status = String(row.status).toUpperCase() === 'INACTIVE' ? 'Inactive' : 'Active';
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <DescriptionOutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography sx={{ fontWeight: 800, fontSize: 17 }}>Price List Details</Typography>
        </Stack>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Field label="Price List Code" value={row.code} />
          <Field label="Price List Name" value={row.name} />
          <Field label="Price List Type" value={row.type} />
          <Field label="Applicable To" value={row.applicableTo} />
          <Field label="Base Price List" value={row.basePriceList?.name || '-'} />
          <Field label="Currency" value={row.currency} />
          <Field label="Effective From" value={formatRowDate(row.effectiveFrom)} />
          <Field label="Effective To" value={formatRowDate(row.effectiveTo)} />
          <Field label="No. of Items" value={formatNumber(row.itemCount)} />
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Status</Typography>
            <Chip
              label={status}
              size="small"
              sx={{
                bgcolor: status === 'Active' ? 'rgba(34,160,107,0.12)' : 'rgba(229,72,77,0.12)',
                color: status === 'Active' ? 'success.main' : 'error.main',
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
