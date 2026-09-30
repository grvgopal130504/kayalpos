import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Stack, Typography, Button, Grid, Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';

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
  return value ? formatPickerDate(new Date(value)) : '—';
}

/** Read-only "View Batch / Serial" dialog opened from the Item Code link in BatchSerialTable — real API row shape (product/warehouse joined in, type/status enums). */
export default function BatchSerialViewDialog({ open, row, onClose, onEdit }) {
  if (!row) return null;
  const status = String(row.status).toUpperCase() === 'INACTIVE' ? 'Inactive' : 'Active';
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <QrCode2OutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography sx={{ fontWeight: 800, fontSize: 17 }}>Batch / Serial Details</Typography>
        </Stack>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Field label="Item Code" value={row.product?.code} />
          <Field label="Item Name" value={row.product?.name} />
          <Field label="Batch / Serial No." value={row.number} />
          <Field label="Batch / Serial Type" value={row.type === 'SERIAL' ? 'Serial' : 'Batch'} />
          <Field label="Manufacturing Date" value={formatRowDate(row.mfgDate)} />
          <Field label="Expiry Date" value={formatRowDate(row.expiryDate)} />
          <Field label="Warehouse / Outlet" value={row.warehouse?.name || '-'} />
          <Field label="Available Qty" value={`${Number(row.qty).toFixed(2)} ${row.uom}`} />
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
