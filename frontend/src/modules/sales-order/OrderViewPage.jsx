import { useState } from 'react';
import {
  Stack, Box, Typography, Button, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

import OrderDetailsCard from './components/OrderDetailsCard';
import OrderTermsAndNotes from './components/OrderTermsAndNotes';
import { getOrderDetails } from './salesOrderMockData';

/**
 * Read-only "View Order" destination for SalesOrderTable's row menu —
 * reuses the exact same OrderDetailsCard/OrderTermsAndNotes cards the
 * Overview/Status pages already show for the selected row, just addressed
 * by :code as its own full page instead of a side panel.
 */
export default function OrderViewPage({ code: propCode, onBack, onEdit }) {
  const navigate = useNavigate();
  const { code: paramCode } = useParams();
  const code = propCode ?? paramCode;
  const order = getOrderDetails(code);
  const [notes, setNotes] = useState('');

  const handleBack = () => (onBack ? onBack() : navigate('/sales-order'));
  const handleEdit = () => (onEdit ? onEdit() : navigate(`/sales-order/edit/${code}`));

  if (!order) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Order not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack} sx={{ width: 'fit-content' }}>
          Back to Sales Order List
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{order.code}</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/sales-order" underline="hover" color="text.secondary">Sales Order</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{order.code}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack}>
            Back to Sales Order List
          </Button>
          <Button variant="contained" onClick={handleEdit}>
            Edit Order
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={12}>
          <OrderDetailsCard order={order} showDeliveredFields={order.status === 'delivered'} />
        </Grid>
      </Grid>

      <OrderTermsAndNotes notes={notes} onNotesChange={setNotes} />
    </Stack>
  );
}
