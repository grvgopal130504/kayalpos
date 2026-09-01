import { useState } from 'react';
import {
  Stack, Box, Typography, Button, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

import InvoiceDetailsCard from './components/InvoiceDetailsCard';
import InvoiceTermsAndNotes from './components/InvoiceTermsAndNotes';
import { getInvoiceDetails } from './salesInvoiceMockData';

/**
 * Read-only "View Invoice" destination for SalesInvoiceTable's row menu —
 * reuses the exact same InvoiceDetailsCard/InvoiceTermsAndNotes cards the
 * Overview/Status pages already show for the selected row, just addressed
 * by :code as its own full page instead of a side panel.
 */
export default function InvoiceViewPage() {
  const navigate = useNavigate();
  const { code } = useParams();
  const invoice = getInvoiceDetails(code);
  const [notes, setNotes] = useState('');

  const handleBack = () => navigate('/sales-invoice');
  const handleEdit = () => navigate(`/sales-invoice/edit/${code}`);

  if (!invoice) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Invoice not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack} sx={{ width: 'fit-content' }}>
          Back to Sales Invoice List
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{invoice.code}</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/sales-invoice" underline="hover" color="text.secondary">Sales Invoice</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{invoice.code}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack}>
            Back to Sales Invoice List
          </Button>
          <Button variant="contained" onClick={handleEdit}>
            Edit Invoice
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={12}>
          <InvoiceDetailsCard invoice={invoice} showPaidFields={invoice.status === 'paid'} />
        </Grid>
      </Grid>

      <InvoiceTermsAndNotes notes={notes} onNotesChange={setNotes} />
    </Stack>
  );
}
