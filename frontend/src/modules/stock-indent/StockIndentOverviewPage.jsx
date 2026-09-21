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

import StockIndentSummaryCards from './components/StockIndentSummaryCards';
import StockIndentTable from './components/StockIndentTable';
import IndentDetailsCard from './components/IndentDetailsCard';
import IndentTermsAndNotes from './components/IndentTermsAndNotes';
import { useGetStockIndentsQuery, useStockIndentSummaryQuery } from '../../api/stockIndentApi';
import { toIndentRow, toIndentDetails, buildSummary } from './stockIndentDisplay';

/**
 * Stock Indent list/detail page — summary tiles, the indent table with a
 * detail panel for whichever row is selected, and a Terms & Conditions /
 * Notes strip below. Fully wired to the real backend (see
 * backend/src/modules/stock-indent): every tile, row and detail field comes
 * from the actual StockIndent table, so a tenant with no indents yet
 * honestly shows zeros/empty states instead of this page's old static mock
 * data.
 */
export default function StockIndentOverviewPage({ tab, onTabChange, onCreate, onView, onEdit }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [notes, setNotes] = useState('');

  const { data: indents = [], isLoading, isError } = useGetStockIndentsQuery({});
  const { data: summaryData } = useStockIndentSummaryQuery();

  const rows = useMemo(() => indents.map(toIndentRow), [indents]);
  const summary = useMemo(() => buildSummary(summaryData), [summaryData]);
  const indentById = useMemo(() => Object.fromEntries(indents.map((i) => [i.id, i])), [indents]);

  const effectiveSelectedId = selectedId && indentById[selectedId] ? selectedId : indents[0]?.id;
  const selectedIndent = effectiveSelectedId ? indentById[effectiveSelectedId] : null;
  const indentDetails = selectedIndent ? toIndentDetails(selectedIndent) : null;

  const handleSelectIndent = (row) => setSelectedId(row.id);
  const handleRowAction = (label, row) => {
    if (label === 'View') return onView ? onView(row.id) : navigate(`/stock-indent/view/${row.id}`);
    if (label === 'Edit') return onEdit ? onEdit(row.id) : navigate(`/stock-indent/edit/${row.id}`);
    return dispatch(showToast(`${label} "${row.code}" is coming soon`, 'info'));
  };
  const handlePrintPreview = () => dispatch(showToast('Print / Preview is coming soon', 'info'));
  const handleCreate = () => {
    if (onCreate) onCreate(); else navigate('/stock-indent/create');
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
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Stock Indent</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/stock-indent" underline="hover" color="text.secondary">Stock Indent</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Indent List</Typography>
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
            <MenuItem onClick={() => handleMoreAction('Export Indents')}>Export Indents</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Duplicate Indent')}>Duplicate Indent</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Delete Indent')}>Delete Indent</MenuItem>
          </Menu>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            New Stock Indent
          </Button>
        </Stack>
      </Stack>

      <StockIndentSummaryCards summary={summary} />

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ height: { lg: 640 } }}>
            <StockIndentTable
              indents={rows}
              selectedId={effectiveSelectedId}
              onSelectIndent={handleSelectIndent}
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
              <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>Loading indents…</Typography>
            ) : isError ? (
              <Typography variant="body2" color="error" sx={{ p: 2 }}>Failed to load indents.</Typography>
            ) : indentDetails ? (
              <IndentDetailsCard indent={indentDetails} showApprovedFields={indentDetails.status === 'approved'} />
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>
                No indents yet — create one to get started.
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      <IndentTermsAndNotes notes={notes} onNotesChange={setNotes} />
    </Stack>
  );
}
