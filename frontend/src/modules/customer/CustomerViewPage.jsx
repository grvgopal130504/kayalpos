import {
  Stack, Box, Typography, Button, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

import CustomerDetailsCard from './components/CustomerDetailsCard';
import CustomerTransactionsCard from './components/CustomerTransactionsCard';
import CustomerLoyaltySummary from './components/CustomerLoyaltySummary';
import { getCustomerDetails, RECENT_TRANSACTIONS, LOYALTY_SUMMARY } from './customerMockData';

/**
 * Read-only "View Customer" destination for CustomerTable's row menu —
 * reuses the exact same CustomerDetailsCard/CustomerTransactionsCard/
 * CustomerLoyaltySummary cards CustomerPage already shows for the selected
 * row, just addressed by :code as its own full page instead of a side
 * panel. Recent transactions / loyalty summary aren't per-customer in the
 * mock data yet, so they show the same sample set CustomerPage does.
 */
export default function CustomerViewPage({ code: propCode, onBack, onEdit }) {
  const navigate = useNavigate();
  const { code: paramCode } = useParams();
  const code = propCode ?? paramCode;
  const customer = getCustomerDetails(code);

  const handleBack = () => (onBack ? onBack() : navigate('/customer'));
  const handleEdit = () => (onEdit ? onEdit() : navigate(`/customer/edit/${code}`));

  if (!customer) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Customer not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack} sx={{ width: 'fit-content' }}>
          Back to Customer List
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{customer.name}</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/customer" underline="hover" color="text.secondary">Customer</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{customer.code}</Typography>
          </Breadcrumbs>
        </Box>
        <Button variant="outlined" color="inherit" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack}>
          Back to Customer List
        </Button>
      </Stack>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <CustomerDetailsCard customer={customer} onEdit={handleEdit} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <CustomerTransactionsCard transactions={RECENT_TRANSACTIONS} />
        </Grid>
        <Grid size={12}>
          <CustomerLoyaltySummary summary={LOYALTY_SUMMARY} />
        </Grid>
      </Grid>
    </Stack>
  );
}
