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

import SalesQuotationSummaryCards from './components/SalesQuotationSummaryCards';
import SalesQuotationTable from './components/SalesQuotationTable';
import QuotationDetailsCard from './components/QuotationDetailsCard';
import QuotationTermsAndNotes from './components/QuotationTermsAndNotes';
import { useGetSalesQuotationsQuery, useSalesQuotationSummaryQuery } from '../../api/salesQuotationApi';
import { toQuotationRow, toQuotationDetails, buildSummary } from './salesQuotationDisplay';

/**
 * Sales Quotation list/detail page — summary tiles, the quotation table
 * with a detail panel for whichever row is selected, and a Terms &
 * Conditions / Notes strip below. Fully wired to the real backend (see
 * backend/src/modules/sales-quotation): every tile, row and detail field
 * comes from the actual SalesQuotation table, so a tenant with no
 * quotations yet honestly shows zeros/empty states instead of this page's
 * old static mock data.
 */
export default function SalesQuotationOverviewPage({ tab, onTabChange, onCreate, onView, onEdit }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [notes, setNotes] = useState('');

  const { data: quotations = [], isLoading, isError } = useGetSalesQuotationsQuery({});
  const { data: summaryData } = useSalesQuotationSummaryQuery();

  const rows = useMemo(() => quotations.map(toQuotationRow), [quotations]);
  const summary = useMemo(() => buildSummary(summaryData), [summaryData]);
  const quotationById = useMemo(() => Object.fromEntries(quotations.map((q) => [q.id, q])), [quotations]);

  const effectiveSelectedId = selectedId && quotationById[selectedId] ? selectedId : quotations[0]?.id;
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

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', lg: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Sales Quotation</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/sales-quotation" underline="hover" color="text.secondary">Sales Quotation</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Quotation List</Typography>
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

      <SalesQuotationSummaryCards summary={summary} />

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ height: { lg: 640 } }}>
            <SalesQuotationTable
              quotations={rows}
              selectedId={effectiveSelectedId}
              onSelectQuotation={handleSelectQuotation}
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
              <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>Loading quotations…</Typography>
            ) : isError ? (
              <Typography variant="body2" color="error" sx={{ p: 2 }}>Failed to load quotations.</Typography>
            ) : quotationDetails ? (
              <QuotationDetailsCard quotation={quotationDetails} showConvertedFields={quotationDetails.status === 'converted'} />
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>
                No quotations yet — create one to get started.
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      <QuotationTermsAndNotes notes={notes} onNotesChange={setNotes} />
    </Stack>
  );
}
