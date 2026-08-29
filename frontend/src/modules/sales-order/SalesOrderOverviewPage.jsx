import { useState } from 'react';
import {
  Stack, Box, Typography, Button, Menu, MenuItem, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';

import SalesOrderSummaryCards from './components/SalesOrderSummaryCards';
import SalesOrderTable from './components/SalesOrderTable';
import OrderDetailsCard from './components/OrderDetailsCard';
import OrderTermsAndNotes from './components/OrderTermsAndNotes';
import { SUMMARY, ORDERS, ORDER_DETAILS } from './salesOrderMockData';

const ORDER_BY_CODE = Object.fromEntries(ORDERS.map((o) => [o.code, o]));

/**
 * Sales Order list/detail page — summary tiles, the order table with a
 * detail panel for whichever row is selected, and a Terms & Conditions /
 * Notes strip below. Mirrors SalesQuotationOverviewPage's structure; the
 * Sales Order backend module doesn't exist yet so everything is driven by
 * salesOrderMockData.js.
 */
export default function SalesOrderOverviewPage({ tab, onTabChange, onCreate }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedCode, setSelectedCode] = useState(ORDER_DETAILS.code);
  const [notes, setNotes] = useState('');

  const selectedRow = ORDER_BY_CODE[selectedCode];
  const orderDetails = selectedCode === ORDER_DETAILS.code
    ? ORDER_DETAILS
    : {
        ...ORDER_DETAILS,
        code: selectedRow.code,
        date: selectedRow.date,
        status: selectedRow.status,
        totalAmount: selectedRow.amount,
        deliveryDate: selectedRow.deliveryDate,
        customer: { ...ORDER_DETAILS.customer, name: selectedRow.customer },
      };

  const handleSelectOrder = (row) => setSelectedCode(row.code);
  const handleRowAction = (label, row) => dispatch(showToast(`${label} "${row.code}" is coming soon`, 'info'));
  const handlePrintPreview = () => dispatch(showToast('Print / Preview is coming soon', 'info'));
  const handleConvertToInvoice = () => dispatch(showToast(`Convert "${orderDetails.code}" to Sales Invoice is coming soon`, 'info'));
  const handleCreate = () => {
    if (onCreate) onCreate(); else navigate('/sales-order/create');
  };
  const handleFilters = () => dispatch(showToast('Filters are coming soon', 'info'));
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', lg: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Sales Order</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/sales-order" underline="hover" color="text.secondary">Sales Order</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Order List</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', width: { xs: '100%', lg: 'auto' } }}>
          <Button variant="outlined" color="inherit" startIcon={<PrintOutlinedIcon fontSize="small" />} onClick={handlePrintPreview}>
            Print / Preview
          </Button>
          <Button variant="outlined" color="inherit" startIcon={<SwapHorizOutlinedIcon fontSize="small" />} onClick={handleConvertToInvoice}>
            Convert to Sales Invoice
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            endIcon={<ExpandMoreIcon />}
            onClick={(e) => setMoreActionsAnchor(e.currentTarget)}
          >
            More Actions
          </Button>
          <Menu anchorEl={moreActionsAnchor} open={Boolean(moreActionsAnchor)} onClose={() => setMoreActionsAnchor(null)}>
            <MenuItem onClick={() => handleMoreAction('Export Orders')}>Export Orders</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Duplicate Order')}>Duplicate Order</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Delete Order')}>Delete Order</MenuItem>
          </Menu>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            New Sales Order
          </Button>
        </Stack>
      </Stack>

      <SalesOrderSummaryCards summary={SUMMARY} />

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ height: { lg: 640 } }}>
            <SalesOrderTable
              orders={ORDERS}
              selectedCode={selectedCode}
              onSelectOrder={handleSelectOrder}
              onRowAction={handleRowAction}
              onFilters={handleFilters}
              tab={tab}
              onTabChange={onTabChange}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ height: { lg: 640 }, overflow: 'auto' }}>
            <OrderDetailsCard order={orderDetails} />
          </Box>
        </Grid>
      </Grid>

      <OrderTermsAndNotes notes={notes} onNotesChange={setNotes} />
    </Stack>
  );
}
