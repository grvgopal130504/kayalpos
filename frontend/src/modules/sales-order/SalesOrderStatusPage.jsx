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
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';
import StatCard from '../../components/common/StatCard';
import { formatCurrency, formatNumber } from '../../utils/format';

import SalesOrderTable from './components/SalesOrderTable';
import OrderDetailsCard from './components/OrderDetailsCard';
import OrderTermsAndNotes from './components/OrderTermsAndNotes';
import { useGetSalesOrdersQuery, useSalesOrderStatusSummaryQuery } from '../../api/salesOrderApi';
import { toOrderRow, toOrderDetails, buildStatusStats } from './salesOrderDisplay';

const STATUS_META = {
  pending: { label: 'Pending Orders', pageTitle: 'Pending', icon: HourglassEmptyOutlinedIcon, iconColor: 'warning' },
  confirmed: { label: 'Confirmed Orders', pageTitle: 'Confirmed', icon: CheckCircleOutlinedIcon, iconColor: 'info' },
  delivered: { label: 'Delivered Orders', pageTitle: 'Delivered', icon: LocalShippingOutlinedIcon, iconColor: 'success' },
};

// The 3 "extra" stat tile icons/colors per status, in the same order as
// buildStatusStats()'s extra array (Total Amount / Average Order Value /
// Total Line Items — all real aggregates, see salesOrderDisplay.js).
const EXTRA_TILE_STYLE = {
  pending: [
    { icon: CardGiftcardOutlinedIcon, iconColor: 'success' },
    { icon: TrendingUpOutlinedIcon, iconColor: 'warning' },
    { icon: DescriptionOutlinedIcon, iconColor: '#8B5CF6' },
  ],
  confirmed: [
    { icon: CardGiftcardOutlinedIcon, iconColor: 'success' },
    { icon: TrendingUpOutlinedIcon, iconColor: 'warning' },
    { icon: DescriptionOutlinedIcon, iconColor: '#8B5CF6' },
  ],
  delivered: [
    { icon: CardGiftcardOutlinedIcon, iconColor: 'success' },
    { icon: TrendingUpOutlinedIcon, iconColor: 'warning' },
    { icon: DescriptionOutlinedIcon, iconColor: '#8B5CF6' },
  ],
};

/**
 * Shared page for the Pending / Confirmed / Delivered cards on the Sales
 * Order landing grid — same list+details+terms layout as the "All Orders"
 * overview page, scoped by `status`. Fully wired to the real backend: the
 * table's rows and the 4 stat tiles both come from actual SalesOrder rows
 * (see backend/src/modules/sales-order's getSalesOrderStatusSummary), so a
 * status with zero orders honestly shows zeros/empty states rather than
 * this page's old placeholder figures. The Delivered tab in particular will
 * genuinely show zero until the Sales Order → Sales Invoice conversion step
 * exists (see the SalesOrder model comment in schema.prisma) — nothing sets
 * status 'delivered' yet, so that's the honest state, not a bug.
 */
export default function SalesOrderStatusPage({ status, tab, onTabChange, onCreate, onView, onEdit }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const meta = STATUS_META[status];
  const extraStyle = EXTRA_TILE_STYLE[status];
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [notes, setNotes] = useState('');

  const { data: orders = [] } = useGetSalesOrdersQuery({});
  const { data: statusSummaryData } = useSalesOrderStatusSummaryQuery(status);

  const rows = useMemo(() => orders.map(toOrderRow), [orders]);
  const statusRows = useMemo(() => rows.filter((r) => r.status === status), [rows, status]);
  const stats = useMemo(() => buildStatusStats(status, statusSummaryData), [status, statusSummaryData]);
  const orderById = useMemo(() => Object.fromEntries(orders.map((o) => [o.id, o])), [orders]);

  const effectiveSelectedId = (selectedId && orderById[selectedId]?.status === status ? selectedId : statusRows[0]?.id);
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

  const tiles = [
    { icon: meta.icon, iconColor: meta.iconColor, label: `Total ${meta.label}`, value: formatNumber(stats.count.value), caption: stats.count.caption },
    ...stats.extra.map((tile, i) => ({
      icon: extraStyle[i].icon,
      iconColor: extraStyle[i].iconColor,
      label: tile.label,
      value: tile.currency ? formatCurrency(tile.value, { decimals: true }) : formatNumber(tile.value),
      caption: tile.caption,
    })),
  ];

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', lg: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Sales Order ({meta.pageTitle})</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/sales-order" underline="hover" color="text.secondary">Sales Order</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{meta.pageTitle}</Typography>
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

      <Grid container spacing={2}>
        {tiles.map((tile) => (
          <Grid key={tile.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard icon={tile.icon} iconColor={tile.iconColor} iconShape="circle" label={tile.label} value={tile.value} caption={tile.caption} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ height: { lg: 560 } }}>
            <SalesOrderTable
              orders={rows}
              selectedId={effectiveSelectedId}
              onSelectOrder={handleSelectOrder}
              onRowAction={handleRowAction}
              onFilters={handleFilters}
              defaultTab={status}
              tab={tab}
              onTabChange={onTabChange}
              statusColumn={false}
              createdByColumn={status !== 'delivered'}
              deliveryDateColumn
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ height: '100%', overflow: 'auto' }}>
            {orderDetails ? (
              <OrderDetailsCard order={orderDetails} title={`Order Details (${meta.pageTitle})`} showDeliveredFields={status === 'delivered'} />
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>
                No {meta.pageTitle.toLowerCase()} orders yet.
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      <OrderTermsAndNotes notes={notes} onNotesChange={setNotes} />
    </Stack>
  );
}
