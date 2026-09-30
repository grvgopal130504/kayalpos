import { useMemo, useState } from 'react';
import {
  Stack, Box, Typography, Button, Menu, MenuItem, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';
import StatCard from '../../components/common/StatCard';
import { formatNumber, formatCurrency } from '../../utils/format';

import StockTransferTable from './components/StockTransferTable';
import TransferDetailsCard from './components/TransferDetailsCard';
import TransferTermsAndNotes from './components/TransferTermsAndNotes';
import { useGetStockTransfersQuery, useStockTransferStatusSummaryQuery } from '../../api/stockTransferApi';
import { toTransferRow, toTransferDetails, buildStatusStats } from './stockTransferDisplay';

const STATUS_META = {
  draft: { label: 'Draft Transfers', pageTitle: 'Draft', icon: EditNoteOutlinedIcon, iconColor: 'warning' },
  'in-transit': { label: 'In-Transit Transfers', pageTitle: 'In Transit', icon: MoveToInboxOutlinedIcon, iconColor: 'info' },
  received: { label: 'Received Transfers', pageTitle: 'Received', icon: CheckCircleOutlinedIcon, iconColor: 'success' },
  cancelled: { label: 'Cancelled Transfers', pageTitle: 'Cancelled', icon: CancelOutlinedIcon, iconColor: 'error' },
};

// The 3 "extra" stat tile icons/colors per status, in the same order as
// buildStatusStats()'s extra array (Total Estimated Value / Average
// Transfer Value / Total Line Items — all real aggregates, see
// stockTransferDisplay.js).
const EXTRA_TILE_STYLE = {
  draft: [
    { icon: CardGiftcardOutlinedIcon, iconColor: 'success' },
    { icon: MoveToInboxOutlinedIcon, iconColor: 'warning' },
    { icon: DescriptionOutlinedIcon, iconColor: '#8B5CF6' },
  ],
  'in-transit': [
    { icon: CardGiftcardOutlinedIcon, iconColor: 'success' },
    { icon: MoveToInboxOutlinedIcon, iconColor: 'warning' },
    { icon: AutorenewOutlinedIcon, iconColor: '#8B5CF6' },
  ],
  received: [
    { icon: CardGiftcardOutlinedIcon, iconColor: 'success' },
    { icon: CheckCircleOutlinedIcon, iconColor: 'warning' },
    { icon: AutorenewOutlinedIcon, iconColor: '#8B5CF6' },
  ],
  cancelled: [
    { icon: CardGiftcardOutlinedIcon, iconColor: 'error' },
    { icon: CancelOutlinedIcon, iconColor: 'warning' },
    { icon: AutorenewOutlinedIcon, iconColor: '#8B5CF6' },
  ],
};

/**
 * Shared page for the Draft / In Transit / Received / Cancelled cards on
 * the Stock Transfer landing grid — same list+details+terms layout as the
 * "All Transfers" overview page, scoped by `status`. Fully wired to the
 * real backend: the table's rows and the 4 stat tiles both come from
 * actual StockTransfer rows (see backend/src/modules/stock-transfer's
 * getStockTransferStatusSummary), so a status with zero transfers honestly
 * shows zeros/empty states rather than fabricated figures. The Received/
 * Cancelled tabs in particular will genuinely show zero until a real
 * receive/cancel backend action exists (see the StockTransfer model
 * comment in schema.prisma) — nothing sets those statuses yet, so that's
 * the honest state, not a bug.
 */
export default function StockTransferStatusPage({ status, tab, onTabChange, onCreate, onView, onEdit }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const meta = STATUS_META[status];
  const extraStyle = EXTRA_TILE_STYLE[status];
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [notes, setNotes] = useState('');

  const { data: transfers = [] } = useGetStockTransfersQuery({});
  const { data: statusSummaryData } = useStockTransferStatusSummaryQuery(status);

  const rows = useMemo(() => transfers.map(toTransferRow), [transfers]);
  const statusRows = useMemo(() => rows.filter((r) => r.status === status), [rows, status]);
  const stats = useMemo(() => buildStatusStats(status, statusSummaryData), [status, statusSummaryData]);
  const transferById = useMemo(() => Object.fromEntries(transfers.map((t) => [t.id, t])), [transfers]);

  const effectiveSelectedId = (selectedId && transferById[selectedId] && rows.find((r) => r.id === selectedId)?.status === status ? selectedId : statusRows[0]?.id);
  const selectedTransfer = effectiveSelectedId ? transferById[effectiveSelectedId] : null;
  const transferDetails = selectedTransfer ? toTransferDetails(selectedTransfer) : null;

  const handleSelectTransfer = (row) => setSelectedId(row.id);
  const handleRowAction = (label, row) => {
    if (label === 'View') return onView ? onView(row.id) : navigate(`/stock-transfer/view/${row.id}`);
    if (label === 'Edit') return onEdit ? onEdit(row.id) : navigate(`/stock-transfer/edit/${row.id}`);
    return dispatch(showToast(`${label} "${row.code}" is coming soon`, 'info'));
  };
  const handlePrintPreview = () => dispatch(showToast('Print / Preview is coming soon', 'info'));
  const handleCreate = () => {
    if (onCreate) onCreate(); else navigate('/stock-transfer/create');
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
      value: i === 2 ? formatNumber(tile.value) : formatCurrency(tile.value, { decimals: true }),
      caption: tile.caption,
    })),
  ];

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', lg: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Stock Transfer ({meta.pageTitle})</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/stock-transfer" underline="hover" color="text.secondary">Stock Transfer</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{meta.pageTitle}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', width: { xs: '100%', lg: 'auto' } }}>
          <Button variant="outlined" color="inherit" startIcon={<PrintOutlinedIcon fontSize="small" />} onClick={handlePrintPreview}>
            Print / Preview
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
            <MenuItem onClick={() => handleMoreAction('Export Transfers')}>Export Transfers</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Duplicate Transfer')}>Duplicate Transfer</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Delete Transfer')}>Delete Transfer</MenuItem>
          </Menu>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            New Stock Transfer
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
            <StockTransferTable
              transfers={rows}
              selectedId={effectiveSelectedId}
              onSelectTransfer={handleSelectTransfer}
              onRowAction={handleRowAction}
              onFilters={handleFilters}
              defaultTab={status}
              tab={tab}
              onTabChange={onTabChange}
              statusColumn={false}
              createdByColumn={status !== 'received'}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ height: { lg: 560 }, overflow: 'auto' }}>
            {transferDetails ? (
              <TransferDetailsCard transfer={transferDetails} title={`Transfer Details (${meta.pageTitle})`} showReceivedFields={status === 'received'} />
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>
                No {meta.pageTitle.toLowerCase()} transfers yet.
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      <TransferTermsAndNotes notes={notes} onNotesChange={setNotes} />
    </Stack>
  );
}
