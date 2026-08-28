import { Paper, Stack, Box, Typography, Button } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import StatusBadge from '../../../components/common/StatusBadge';
import { formatCurrency, formatNumber } from '../../../utils/format';

function DetailField({ label, value, valueColor }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: valueColor || 'text.primary' }}>{value}</Typography>
    </Box>
  );
}

/**
 * Right-hand "Customer Details" panel for whichever row is selected in
 * CustomerTable — avatar/name/status header, then Mobile/Email/Address on
 * the left and Date of Joining/Loyalty Points/Total Purchase/Outstanding on
 * the right, matching the reference screenshot.
 */
export default function CustomerDetailsCard({ customer, onEdit }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2.5, sm: 3 }, height: '100%' }}>
      <Stack spacing={2.5}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Customer Details</Typography>
          <Button variant="outlined" color="inherit" size="small" startIcon={<EditOutlinedIcon fontSize="small" />} onClick={onEdit}>
            Edit Customer
          </Button>
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: 'rgba(37,99,235,0.12)', color: '#2563EB', fontWeight: 700, fontSize: 16,
            }}
          >
            {customer.initials}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>{customer.name}</Typography>
              <StatusBadge status={customer.status} label={customer.status === 'active' ? 'Active' : 'Inactive'} />
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{customer.code}</Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <DetailField label="Mobile Number" value={customer.mobile} />
            <DetailField label="Email" value={customer.email} />
            <DetailField label="Address" value={customer.address} />
          </Stack>
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <DetailField label="Date of Joining" value={customer.dateOfJoining} />
            <DetailField label="Loyalty Points" value={formatNumber(customer.loyaltyPoints)} />
            <DetailField label="Total Purchase" value={formatCurrency(customer.totalPurchase, { decimals: true })} />
            <DetailField label="Outstanding Amount" value={formatCurrency(customer.outstandingAmount, { decimals: true })} valueColor="error.main" />
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}
