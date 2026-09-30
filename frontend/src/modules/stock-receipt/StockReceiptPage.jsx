import { useMemo, useState } from 'react';
import {
  Stack, Box, Typography, Button, Menu, MenuItem, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';

import StockReceiptSummaryCards from './components/StockReceiptSummaryCards';
import StockReceiptTable from './components/StockReceiptTable';
import StockReceiptDetailsCard from './components/StockReceiptDetailsCard';
import CreateStockReceiptPage from './CreateStockReceiptPage';
import ReceiptViewPage from './ReceiptViewPage';
import { useGetStockReceiptsQuery, useStockReceiptSummaryQuery } from '../../api/stockReceiptApi';
import { toReceiptRow, toReceiptDetails, buildSummary } from './stockReceiptDisplay';

/**
 * Landing page for the sidebar's Stock Receipt item — summary tiles, the
 * receipt list with a detail panel for whichever row is selected, plus the
 * create/edit form and the read-only view, all swapped in via local state
 * instead of separate /create, /edit/:id, /view/:id routes. Fully wired to
 * the real backend (see backend/src/modules/stock-receipt): every tile, row
 * and detail field comes from the actual StockReceipt table, so a tenant
 * with no receipts yet honestly shows zeros/empty states instead of this
 * page's old static mock data. Rows are keyed/selected by real `id` (not
 * `code`), same convention every other module's table adopted once it was
 * wired to a real backend.
 */
export default function StockReceiptPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [tab, setTab] = useState('list');
  const [activeId, setActiveId] = useState(null);
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const { data: receipts = [], isLoading, isError } = useGetStockReceiptsQuery({});
  const { data: summaryData } = useStockReceiptSummaryQuery();

  const rows = useMemo(() => receipts.map(toReceiptRow), [receipts]);
  const summary = useMemo(() => buildSummary(summaryData), [summaryData]);
  const receiptById = useMemo(() => Object.fromEntries(receipts.map((r) => [r.id, r])), [receipts]);

  const goToList = () => {
    setActiveId(null);
    setTab('list');
  };
  const openEdit = (id) => {
    setActiveId(id);
    setTab('edit');
  };
  const openView = (id) => {
    setActiveId(id);
    setTab('view');
  };

  if (tab === 'create' || tab === 'edit') {
    return (
      <CreateStockReceiptPage
        id={tab === 'edit' ? activeId : undefined}
        onBack={(savedId) => (tab === 'edit' ? openView(savedId || activeId) : goToList())}
      />
    );
  }

  if (tab === 'view') {
    return <ReceiptViewPage id={activeId} onBack={goToList} onEdit={() => openEdit(activeId)} />;
  }

  const effectiveSelectedId = selectedId && receiptById[selectedId] ? selectedId : receipts[0]?.id;
  const selectedReceipt = effectiveSelectedId ? receiptById[effectiveSelectedId] : null;
  const receiptDetails = selectedReceipt ? toReceiptDetails(selectedReceipt) : null;

  const handleSelectReceipt = (row) => setSelectedId(row.id);
  const handleRowAction = (label, row) => {
    if (label === 'View') return openView(row.id);
    if (label === 'Edit') return openEdit(row.id);
    dispatch(showToast(`${label} "${row.code}" is coming soon`, 'info'));
  };
  const handleImport = () => dispatch(showToast('Import Receipts is coming soon', 'info'));
  const handleCreate = () => setTab('create');
  const handleFilters = () => dispatch(showToast('Filters are coming soon', 'info'));
  const handleEdit = () => openEdit(effectiveSelectedId);
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Stock Receipt</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Stock Receipt</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<FileUploadOutlinedIcon fontSize="small" />} onClick={handleImport}>
            Import Receipts
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Create Receipt
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
            <MenuItem onClick={() => handleMoreAction('Export Receipts')}>Export Receipts</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Print Receipts')}>Print Receipts</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Receipt Settings')}>Receipt Settings</MenuItem>
          </Menu>
        </Stack>
      </Stack>

      <StockReceiptSummaryCards summary={summary} />

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ height: { lg: 560 } }}>
            <StockReceiptTable
              receipts={rows}
              selectedId={effectiveSelectedId}
              onSelectReceipt={handleSelectReceipt}
              onRowAction={handleRowAction}
              onFilters={handleFilters}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ height: { lg: 560 }, overflow: 'auto' }}>
            {isLoading ? (
              <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>Loading receipts…</Typography>
            ) : isError ? (
              <Typography variant="body2" color="error" sx={{ p: 2 }}>Failed to load receipts.</Typography>
            ) : receiptDetails ? (
              <StockReceiptDetailsCard receipt={receiptDetails} onEdit={handleEdit} />
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>
                No receipts yet — create one to get started.
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
}
