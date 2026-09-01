import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Stack, Typography, Button, Grid, Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';

import { formatNumber } from '../../../../utils/format';

function Field({ label, value }) {
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>{value ?? '-'}</Typography>
    </Grid>
  );
}

/** Read-only "View Brand" dialog with an Edit button that swaps to BrandFormDialog. */
export default function BrandViewDialog({ open, row, onClose, onEdit }) {
  if (!row) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <ReceiptOutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography sx={{ fontWeight: 800, fontSize: 17 }}>Brand Details</Typography>
        </Stack>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Field label="Brand Code" value={row.code} />
          <Field label="Brand Name" value={row.name} />
          <Field label="Description" value={row.description} />
          <Field label="Item Group / Category" value={row.category} />
          <Field label="Total Items" value={formatNumber(row.totalItems)} />
          <Field label="Created On" value={row.createdOn} />
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
