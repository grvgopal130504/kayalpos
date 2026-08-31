import { Paper, Stack, Box, Typography, Button, IconButton } from '@mui/material';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

/**
 * "Registered Address" sidebar card — a plain read-only address block
 * with a pin badge and an "Edit" action, matching the reference. Editing
 * the address isn't wired to anything yet (no address-edit modal in this
 * app), so the button just surfaces a toast.
 */
export default function RegisteredAddressCard({ address, onEdit }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>Registered Address</Typography>
        <Box
          sx={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: 'rgba(37,99,235,0.12)', color: '#2563EB',
          }}
        >
          <IconButton size="small" sx={{ p: 0, color: 'inherit' }} disabled>
            <PlaceOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Stack>

      <Stack spacing={0.25}>
        <Typography variant="body2">{address.line1}</Typography>
        <Typography variant="body2">{address.line2}</Typography>
        <Typography variant="body2">{address.line3}</Typography>
        <Typography variant="body2">{address.line4}</Typography>
        {address.landmark && (
          <Typography variant="body2" sx={{ mt: 0.5 }}>Landmark: {address.landmark}</Typography>
        )}
      </Stack>

      <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 2 }}>
        <Button variant="outlined" color="primary" size="small" startIcon={<EditOutlinedIcon fontSize="small" />} onClick={onEdit}>
          Edit
        </Button>
      </Stack>
    </Paper>
  );
}
