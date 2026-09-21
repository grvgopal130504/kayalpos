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

import StockCountSummaryCards from './components/StockCountSummaryCards';
import StockCountTable from './components/StockCountTable';
import StockCountDetailsCard from './components/StockCountDetailsCard';
import CreateStockCountPage from './CreateStockCountPage';
import CountViewPage from './CountViewPage';
import { useGetStockCountsQuery, useStockCountSummaryQuery } from '../../api/stockCountApi';
import { toCountRow, toCountDetails, buildSummary } from './stockCountDisplay';

/**
 * Landing page for the sidebar's Stock Count item — summary tiles, the
 * count list with a detail panel for whichever row is selected, plus the
 * create/edit form and the read-only view, all swapped in via local state
 * instead of separate /create, /edit/:id, /view/:id routes. Fully wired to
 * the real backend (see backend/src/modules/stock-count): every tile, row
 * and detail field comes from the actual StockCount table, so a tenant with
 * no counts yet honestly shows zeros/empty states instead of this page's
 * old static mock data. Rows are keyed/selected by real `id` (not `code`),
 * same convention every other module's table adopted once it was wired to
 * a real backend.
 */
export default function StockCountPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [tab, setTab] = useState('list');
  const [activeId, setActiveId] = useState(null);
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const { data: counts = [], isLoading, isError } = useGetStockCountsQuery({});
  const { data: summaryData } = useStockCountSummaryQuery();

  const rows = useMemo(() => counts.map(toCountRow), [counts]);
  const summary = useMemo(() => buildSummary(summaryData), [summaryData]);
  const countById = useMemo(() => Object.fromEntries(counts.map((c) => [c.id, c])), [counts]);

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
      <CreateStockCountPage
        id={tab === 'edit' ? activeId : undefined}
        onBack={(savedId) => (tab === 'edit' ? openView(savedId || activeId) : goToList())}
      />
    );
  }

  if (tab === 'view') {
    return <CountViewPage id={activeId} onBack={goToList} onEdit={() => openEdit(activeId)} />;
  }

  const effectiveSelectedId = selectedId && countById[selectedId] ? selectedId : counts[0]?.id;
  const selectedCount = effectiveSelectedId ? countById[effectiveSelectedId] : null;
  const countDetails = selectedCount ? toCountDetails(selectedCount) : null;

  const handleSelectCount = (row) => setSelectedId(row.id);
  const handleRowAction = (label, row) => {
    if (label === 'View') return openView(row.id);
    if (label === 'Edit') return openEdit(row.id);
    dispatch(showToast(`${label} "${row.code}" is coming soon`, 'info'));
  };
  const handleImport = () => dispatch(showToast('Import Counts is coming soon', 'info'));
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
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Stock Count</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Stock Count</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<FileUploadOutlinedIcon fontSize="small" />} onClick={handleImport}>
            Import Counts
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Create Count
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
            <MenuItem onClick={() => handleMoreAction('Export Counts')}>Export Counts</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Print Counts')}>Print Counts</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Count Settings')}>Count Settings</MenuItem>
          </Menu>
        </Stack>
      </Stack>

      <StockCountSummaryCards summary={summary} />

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ height: { lg: 560 } }}>
            <StockCountTable
              counts={rows}
              selectedId={effectiveSelectedId}
              onSelectCount={handleSelectCount}
              onRowAction={handleRowAction}
              onFilters={handleFilters}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ height: { lg: 560 }, overflow: 'auto' }}>
            {isLoading ? (
              <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>Loading counts…</Typography>
            ) : isError ? (
              <Typography variant="body2" color="error" sx={{ p: 2 }}>Failed to load counts.</Typography>
            ) : countDetails ? (
              <StockCountDetailsCard count={countDetails} onEdit={handleEdit} />
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>
                No counts yet — create one to get started.
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
}
