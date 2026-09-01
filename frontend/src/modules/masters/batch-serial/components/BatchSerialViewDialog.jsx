import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Stack, Typography, Button, Grid, Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';

function Field({ label, value }) {
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>{value ?? '-'}</Typography>
    </Grid>
  );
}

/** Read-only "View Batch / Serial" dialog opened from the Item Code link in BatchSerialTable. */
export default function BatchSerialViewDialog({ open, row, onClose, onEdit }) {
  if (!row) return null;
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
          <Field label="Item Code" value={row.itemCode} />
          <Field label="Item Name" value={row.itemName} />
          <Field label="Batch / Serial No." value={row.number} />
          <Field label="Batch / Serial Type" value={row.type} />
          <Field label="Manufacturing Date" value={row.mfgDate} />
          <Field label="Expiry Date" value={row.expiryDate || '—'} />
          <Field label="Warehouse / Outlet" value={row.warehouse} />
          <Field label="Available Qty" value={typeof row.qty === 'number' ? `${row.qty.toFixed(2)} ${row.uom}` : row.qty} />
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Status</Typography>
            <Chip
              label={row.status}
              size="small"
              sx={{
                bgcolor: row.status === 'Active' ? 'rgba(34,160,107,0.12)' : 'rgba(229,72,77,0.12)',
                color: row.status === 'Active' ? 'success.main' : 'error.main',
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
