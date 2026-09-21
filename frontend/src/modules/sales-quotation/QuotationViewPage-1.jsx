import { useState } from 'react';
import {
  Stack, Box, Typography, Button, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

import QuotationDetailsCard from './components/QuotationDetailsCard';
import QuotationTermsAndNotes from './components/QuotationTermsAndNotes';
import { useGetSalesQuotationQuery } from '../../api/salesQuotationApi';
import { toQuotationDetails } from './salesQuotationDisplay';

/**
 * Read-only "View Quotation" body for SalesQuotationTable's row menu —
 * reuses the exact same QuotationDetailsCard/QuotationTermsAndNotes cards
 * the Overview/Status pages already show for the selected row. Rendered by
 * SalesQuotationPage via props (`id`/`onBack`/`onEdit`) as part of the
 * single /sales-quotation page rather than its own route. Fully wired to
 * the real backend — every field here comes from the actual SalesQuotation
 * row fetched by GET /api/sales-quotations/:id.
 */
export default function QuotationViewPage({ id: propId, onBack, onEdit }) {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const id = propId ?? paramId;
  const { data: row, isLoading, isError } = useGetSalesQuotationQuery(id, { skip: !id });
  const quotation = row ? toQuotationDetails(row) : null;
  const [notes, setNotes] = useState('');

  const handleBack = () => (onBack ? onBack() : navigate('/sales-quotation'));
  const handleEdit = () => (onEdit ? onEdit() : navigate(`/sales-quotation/edit/${id}`));

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading quotation…</Typography>
      </Stack>
    );
  }

  if (isError || !quotation) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Quotation not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack} sx={{ width: 'fit-content' }}>
          Back to Sales Quotation List
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{quotation.code}</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/sales-quotation" underline="hover" color="text.secondary">Sales Quotation</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{quotation.code}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack}>
            Back to Sales Quotation List
          </Button>
          <Button variant="contained" onClick={handleEdit}>
            Edit Quotation
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={12}>
          <QuotationDetailsCard quotation={quotation} showConvertedFields={quotation.status === 'converted'} />
        </Grid>
      </Grid>

      <QuotationTermsAndNotes notes={notes} onNotesChange={setNotes} />
    </Stack>
  );
}
