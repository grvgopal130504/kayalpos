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
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';
import StatCard from '../../components/common/StatCard';
import { formatCurrency, formatNumber } from '../../utils/format';

import SalesQuotationTable from './components/SalesQuotationTable';
import QuotationDetailsCard from './components/QuotationDetailsCard';
import QuotationTermsAndNotes from './components/QuotationTermsAndNotes';
import { useGetSalesQuotationsQuery, useSalesQuotationStatusSummaryQuery } from '../../api/salesQuotationApi';
import { toQuotationRow, toQuotationDetails, buildStatusStats } from './salesQuotationDisplay';

const STATUS_META = {
  draft: { label: 'Draft Quotations', pageTitle: 'Draft', icon: DescriptionOutlinedIcon, iconColor: 'info' },
  converted: { label: 'Converted Quotations', pageTitle: 'Converted', icon: DescriptionOutlinedIcon, iconColor: 'info' },
  expired: { label: 'Expired Quotations', pageTitle: 'Expired', icon: EventBusyOutlinedIcon, iconColor: 'error' },
};

// The 3 "extra" stat tile icons/colors per status, in the same order as
// buildStatusStats()'s extra array (Total Amount / Average Value / Total
// Line Items — all real aggregates, see salesQuotationDisplay.js).
const EXTRA_TILE_STYLE = {
  draft: [
    { icon: CardGiftcardOutlinedIcon, iconColor: 'success' },
    { icon: HourglassEmptyOutlinedIcon, iconColor: 'warning' },
    { icon: EditNoteOutlinedIcon, iconColor: '#8B5CF6' },
  ],
  converted: [
    { icon: CardGiftcardOutlinedIcon, iconColor: 'success' },
    { icon: ShoppingCartOutlinedIcon, iconColor: 'warning' },
    { icon: AutorenewOutlinedIcon, iconColor: '#8B5CF6' },
  ],
  expired: [
    { icon: CardGiftcardOutlinedIcon, iconColor: 'error' },
    { icon: EventBusyOutlinedIcon, iconColor: 'warning' },
    { icon: NotificationsActiveOutlinedIcon, iconColor: '#8B5CF6' },
  ],
};

/**
 * Shared page for the Draft / Converted / Expired cards on the Sales
 * Quotation landing grid — same list+details+terms layout as the "All
 * Quotations" overview page, scoped by `status`. Fully wired to the real
 * backend: the table's rows and the 4 stat tiles both come from actual
 * SalesQuotation rows (see backend/src/modules/sales-quotation's
 * getSalesQuotationStatusSummary), so a status with zero quotations
 * honestly shows zeros/empty states rather than this page's old
 * placeholder figures.
 */
export default function SalesQuotationStatusPage({ status, tab, onTabChange, onCreate, onView, onEdit }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const meta = STATUS_META[status];
  const extraStyle = EXTRA_TILE_STYLE[status];
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [notes, setNotes] = useState('');

  const { data: quotations = [] } = useGetSalesQuotationsQuery({});
  const { data: statusSummaryData } = useSalesQuotationStatusSummaryQuery(status);

  const rows = useMemo(() => quotations.map(toQuotationRow), [quotations]);
  const statusRows = useMemo(() => rows.filter((r) => r.status === status), [rows, status]);
  const stats = useMemo(() => buildStatusStats(status, statusSummaryData), [status, statusSummaryData]);
  const quotationById = useMemo(() => Object.fromEntries(quotations.map((q) => [q.id, q])), [quotations]);

  const effectiveSelectedId = (selectedId && quotationById[selectedId]?.status === status ? selectedId : statusRows[0]?.id);
  const selectedQuotation = effectiveSelectedId ? quotationById[effectiveSelectedId] : null;
  const quotationDetails = selectedQuotation ? toQuotationDetails(selectedQuotation) : null;

  const handleSelectQuotation = (row) => setSelectedId(row.id);
  const handleRowAction = (label, row) => {
    if (label === 'View') return onView ? onView(row.id) : navigate(`/sales-quotation/view/${row.id}`);
    if (label === 'Edit') return onEdit ? onEdit(row.id) : navigate(`/sales-quotation/edit/${row.id}`);
    dispatch(showToast(`${label} "${row.code}" is coming soon`, 'info'));
  };
  const handlePrintPreview = () => dispatch(showToast('Print / Preview is coming soon', 'info'));
  const handleConvertToOrder = () => dispatch(showToast(`Convert "${quotationDetails?.code || ''}" to Sales Order is coming soon`, 'info'));
  const handleCreate = () => {
    if (onCreate) onCreate(); else navigate('/sales-quotation/create');
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
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Sales Quotation ({meta.pageTitle})</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/sales-quotation" underline="hover" color="text.secondary">Sales Quotation</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{meta.pageTitle}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', width: { xs: '100%', lg: 'auto' } }}>
          <Button variant="outlined" color="inherit" startIcon={<PrintOutlinedIcon fontSize="small" />} onClick={handlePrintPreview}>
            Print / Preview
          </Button>
          <Button variant="outlined" color="inherit" startIcon={<SwapHorizOutlinedIcon fontSize="small" />} onClick={handleConvertToOrder} disabled={!quotationDetails}>
            Convert to Sales Order
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
            <MenuItem onClick={() => handleMoreAction('Export Quotations')}>Export Quotations</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Duplicate Quotation')}>Duplicate Quotation</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Delete Quotation')}>Delete Quotation</MenuItem>
          </Menu>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            New Quotation
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
            <SalesQuotationTable
              quotations={rows}
              selectedId={effectiveSelectedId}
              onSelectQuotation={handleSelectQuotation}
              onRowAction={handleRowAction}
              onFilters={handleFilters}
              defaultTab={status}
              tab={tab}
              onTabChange={onTabChange}
              statusColumn={false}
              createdByColumn={status !== 'converted'}
              validTillColumn={status !== 'converted'}
              convertedColumns={status === 'converted'}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ height: '100%', overflow: 'auto' }}>
            {quotationDetails ? (
              <QuotationDetailsCard quotation={quotationDetails} title={`Quotation Details (${meta.pageTitle})`} showConvertedFields={status === 'converted'} />
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>
                No {meta.pageTitle.toLowerCase()} quotations yet.
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      <QuotationTermsAndNotes notes={notes} onNotesChange={setNotes} />
    </Stack>
  );
}
