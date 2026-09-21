import { useMemo, useState } from 'react';
import {
  Stack, Box, Typography, Button, Menu, MenuItem, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';

import StockTransferSummaryCards from './components/StockTransferSummaryCards';
import StockTransferTable from './components/StockTransferTable';
import TransferDetailsCard from './components/TransferDetailsCard';
import TransferTermsAndNotes from './components/TransferTermsAndNotes';
import { useGetStockTransfersQuery, useStockTransferSummaryQuery } from '../../api/stockTransferApi';
import { toTransferRow, toTransferDetails, buildSummary } from './stockTransferDisplay';

/**
 * Stock Transfer list/detail page — summary tiles, the transfer table with
 * a detail panel for whichever row is selected, and a Terms & Conditions /
 * Notes strip below. Fully wired to the real backend (see
 * backend/src/modules/stock-transfer): every tile, row and detail field
 * comes from the actual StockTransfer table, so a tenant with no transfers
 * yet honestly shows zeros/empty states instead of this page's old static
 * mock data.
 */
export default function StockTransferOverviewPage({ tab, onTabChange, onCreate, onView, onEdit }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [notes, setNotes] = useState('');

  const { data: transfers = [], isLoading, isError } = useGetStockTransfersQuery({});
  const { data: summaryData } = useStockTransferSummaryQuery();

  const rows = useMemo(() => transfers.map(toTransferRow), [transfers]);
  const summary = useMemo(() => buildSummary(summaryData), [summaryData]);
  const transferById = useMemo(() => Object.fromEntries(transfers.map((t) => [t.id, t])), [transfers]);

  const effectiveSelectedId = selectedId && transferById[selectedId] ? selectedId : transfers[0]?.id;
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

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', lg: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Stock Transfer</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/stock-transfer" underline="hover" color="text.secondary">Stock Transfer</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Transfer List</Typography>
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

      <StockTransferSummaryCards summary={summary} />

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ height: { lg: 640 } }}>
            <StockTransferTable
              transfers={rows}
              selectedId={effectiveSelectedId}
              onSelectTransfer={handleSelectTransfer}
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
              <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>Loading transfers…</Typography>
            ) : isError ? (
              <Typography variant="body2" color="error" sx={{ p: 2 }}>Failed to load transfers.</Typography>
            ) : transferDetails ? (
              <TransferDetailsCard transfer={transferDetails} showReceivedFields={transferDetails.status === 'received'} />
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>
                No transfers yet — create one to get started.
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      <TransferTermsAndNotes notes={notes} onNotesChange={setNotes} />
    </Stack>
  );
}
