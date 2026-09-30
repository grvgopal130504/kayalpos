import { useMemo, useState } from 'react';
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
import { useGetSalesOrdersQuery, useSalesOrderSummaryQuery } from '../../api/salesOrderApi';
import { toOrderRow, toOrderDetails, buildSummary } from './salesOrderDisplay';

/**
 * Sales Order list/detail page — summary tiles, the order table with a
 * detail panel for whichever row is selected, and a Terms & Conditions /
 * Notes strip below. Fully wired to the real backend (see
 * backend/src/modules/sales-order): every tile, row and detail field comes
 * from the actual SalesOrder table, so a tenant with no orders yet honestly
 * shows zeros/empty states instead of this page's old static mock data.
 */
export default function SalesOrderOverviewPage({ tab, onTabChange, onCreate, onView, onEdit }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [notes, setNotes] = useState('');

  const { data: orders = [], isLoading, isError } = useGetSalesOrdersQuery({});
  const { data: summaryData } = useSalesOrderSummaryQuery();

  const rows = useMemo(() => orders.map(toOrderRow), [orders]);
  const summary = useMemo(() => buildSummary(summaryData), [summaryData]);
  const orderById = useMemo(() => Object.fromEntries(orders.map((o) => [o.id, o])), [orders]);

  const effectiveSelectedId = selectedId && orderById[selectedId] ? selectedId : orders[0]?.id;
  const selectedOrder = effectiveSelectedId ? orderById[effectiveSelectedId] : null;
  const orderDetails = selectedOrder ? toOrderDetails(selectedOrder) : null;

  const handleSelectOrder = (row) => setSelectedId(row.id);
  const handleRowAction = (label, row) => {
    if (label === 'View') return onView ? onView(row.id) : navigate(`/sales-order/view/${row.id}`);
    if (label === 'Edit') return onEdit ? onEdit(row.id) : navigate(`/sales-order/edit/${row.id}`);
    dispatch(showToast(`${label} "${row.code}" is coming soon`, 'info'));
  };
  const handlePrintPreview = () => dispatch(showToast('Print / Preview is coming soon', 'info'));
  const handleConvertToInvoice = () => dispatch(showToast(`Convert "${orderDetails?.code || ''}" to Sales Invoice is coming soon`, 'info'));
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
          <Button variant="outlined" color="inherit" startIcon={<SwapHorizOutlinedIcon fontSize="small" />} onClick={handleConvertToInvoice} disabled={!orderDetails}>
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

      <SalesOrderSummaryCards summary={summary} />

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ height: { lg: 640 } }}>
            <SalesOrderTable
              orders={rows}
              selectedId={effectiveSelectedId}
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
            {isLoading ? (
              <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>Loading orders…</Typography>
            ) : isError ? (
              <Typography variant="body2" color="error" sx={{ p: 2 }}>Failed to load orders.</Typography>
            ) : orderDetails ? (
              <OrderDetailsCard order={orderDetails} showDeliveredFields={orderDetails.status === 'delivered'} />
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>
                No orders yet — create one to get started.
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      <OrderTermsAndNotes notes={notes} onNotesChange={setNotes} />
    </Stack>
  );
}
