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

import StockWastageSummaryCards from './components/StockWastageSummaryCards';
import StockWastageTable from './components/StockWastageTable';
import StockWastageDetailsCard from './components/StockWastageDetailsCard';
import CreateStockWastagePage from './CreateStockWastagePage';
import WastageViewPage from './WastageViewPage';
import { useGetStockWastagesQuery, useStockWastageSummaryQuery } from '../../api/stockWastageApi';
import { toWastageRow, toWastageDetails, buildSummary } from './stockWastageDisplay';

/**
 * Landing page for the sidebar's Stock Wastage item — summary tiles, the
 * wastage list with a detail panel for whichever row is selected, plus the
 * create/edit form and the read-only view, all swapped in via local state
 * instead of separate /create, /edit/:id, /view/:id routes. Fully wired to
 * the real backend (see backend/src/modules/stock-wastage): every tile, row
 * and detail field comes from the actual StockWastage table, so a tenant
 * with no wastages yet honestly shows zeros/empty states instead of this
 * page's old static mock data. Rows are keyed/selected by real `id` (not
 * `code`), same convention every other module's table adopted once it was
 * wired to a real backend.
 */
export default function StockWastagePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [tab, setTab] = useState('list');
  const [activeId, setActiveId] = useState(null);
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const { data: wastages = [], isLoading, isError } = useGetStockWastagesQuery({});
  const { data: summaryData } = useStockWastageSummaryQuery();

  const rows = useMemo(() => wastages.map(toWastageRow), [wastages]);
  const summary = useMemo(() => buildSummary(summaryData), [summaryData]);
  const wastageById = useMemo(() => Object.fromEntries(wastages.map((w) => [w.id, w])), [wastages]);

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
      <CreateStockWastagePage
        id={tab === 'edit' ? activeId : undefined}
        onBack={(savedId) => (tab === 'edit' ? openView(savedId || activeId) : goToList())}
      />
    );
  }

  if (tab === 'view') {
    return <WastageViewPage id={activeId} onBack={goToList} onEdit={() => openEdit(activeId)} />;
  }

  const effectiveSelectedId = selectedId && wastageById[selectedId] ? selectedId : wastages[0]?.id;
  const selectedWastage = effectiveSelectedId ? wastageById[effectiveSelectedId] : null;
  const wastageDetails = selectedWastage ? toWastageDetails(selectedWastage) : null;

  const handleSelectWastage = (row) => setSelectedId(row.id);
  const handleRowAction = (label, row) => {
    if (label === 'View') return openView(row.id);
    if (label === 'Edit') return openEdit(row.id);
    dispatch(showToast(`${label} "${row.code}" is coming soon`, 'info'));
  };
  const handleImport = () => dispatch(showToast('Import Wastages is coming soon', 'info'));
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
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Stock Wastage</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Stock Wastage</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<FileUploadOutlinedIcon fontSize="small" />} onClick={handleImport}>
            Import Wastages
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Create Wastage
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
            <MenuItem onClick={() => handleMoreAction('Export Wastages')}>Export Wastages</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Print Wastages')}>Print Wastages</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Wastage Settings')}>Wastage Settings</MenuItem>
          </Menu>
        </Stack>
      </Stack>

      <StockWastageSummaryCards summary={summary} />

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ height: { lg: 560 } }}>
            <StockWastageTable
              wastages={rows}
              selectedId={effectiveSelectedId}
              onSelectWastage={handleSelectWastage}
              onRowAction={handleRowAction}
              onFilters={handleFilters}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ height: { lg: 560 }, overflow: 'auto' }}>
            {isLoading ? (
              <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>Loading wastages…</Typography>
            ) : isError ? (
              <Typography variant="body2" color="error" sx={{ p: 2 }}>Failed to load wastages.</Typography>
            ) : wastageDetails ? (
              <StockWastageDetailsCard wastage={wastageDetails} onEdit={handleEdit} />
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>
                No wastages yet — create one to get started.
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
}
