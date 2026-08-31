import { Paper, Stack, Box, Typography } from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';

function InfoField({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'pre-line' }}>{value}</Typography>
    </Box>
  );
}

/**
 * "Outlet Information" panel on the Cashier Login screen — a storefront
 * icon badge above a stack of label/value fields (name, code, address,
 * phone, email), matching the reference. Purely informational (read-only,
 * mock outlet), same static-detail treatment as the reference — no
 * outlet-switching here.
 */
export default function CashierLoginOutletInfo({ outlet }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Outlet Information</Typography>
      <Stack spacing={2}>
        <Box
          sx={{
            width: 44, height: 44, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: 'rgba(37,99,235,0.1)', color: '#2563EB',
          }}
        >
          <StorefrontIcon fontSize="small" />
        </Box>
        <InfoField label="Outlet Name" value={outlet.name} />
        <InfoField label="Outlet Code" value={outlet.code} />
        <InfoField label="Address" value={outlet.address} />
        <InfoField label="Phone" value={outlet.phone} />
        <InfoField label="Email" value={outlet.email} />
      </Stack>
    </Paper>
  );
}
