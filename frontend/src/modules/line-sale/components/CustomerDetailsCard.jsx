import { Stack, Box, Typography, Button, Avatar, Paper } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';

/** Step 2 "Customer Details" strip: avatar, name, phone, loyalty points. */
export default function CustomerDetailsCard({ customer, onAddCustomer }) {
  const name = customer.name || 'Walk-in Customer';
  const fields = [
    { label: 'Name', value: name, grow: 1.4 },
    { label: 'Phone', value: customer.phone || '—', grow: 1 },
    { label: 'Loyalty Points', value: customer.loyaltyPoints ?? 0, grow: 1 },
  ];
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Customer Details</Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<PersonAddAltOutlinedIcon fontSize="small" />}
          onClick={onAddCustomer}
          sx={{ borderRadius: 2 }}
        >
          Add Customer
        </Button>
      </Stack>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Avatar
          sx={{
            width: 44, height: 44, fontWeight: 800, color: 'primary.main',
            bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
          }}
        >
          {name.charAt(0).toUpperCase()}
        </Avatar>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 3 }} sx={{ flex: 1, minWidth: 0 }}>
          {fields.map((f) => (
            <Box key={f.label} sx={{ flex: f.grow, minWidth: 0 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{f.label}</Typography>
              <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>{f.value}</Typography>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}
