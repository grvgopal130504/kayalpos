import { useState } from 'react';
import {
  Stack, Box, Typography, Button, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

import LabelDetailsCard from './components/LabelDetailsCard';
import LabelTermsAndNotes from './components/LabelTermsAndNotes';
import { getBatchDetails } from './barcodeLabelMockData';

/**
 * Read-only "View Barcode & Label" destination for BarcodeLabelTable's row
 * menu (used from both the Overview and Draft/Pending Print/Printed status
 * pages) — reuses the exact same LabelDetailsCard/LabelTermsAndNotes cards
 * those pages already show for the selected row, just addressed by :code
 * as its own full page instead of a side panel. Mirrors QuotationViewPage.
 */
export default function BarcodeLabelViewPage({ code: propCode, onBack, onEdit }) {
  const navigate = useNavigate();
  const { code: paramCode } = useParams();
  const code = propCode ?? paramCode;
  const batch = getBatchDetails(code);
  const [notes, setNotes] = useState('');

  const handleBack = () => (onBack ? onBack() : navigate('/barcode-label'));
  const handleEdit = () => (onEdit ? onEdit() : navigate(`/barcode-label/edit/${code}`));

  if (!batch) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Batch not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack} sx={{ width: 'fit-content' }}>
          Back to Barcode &amp; Label List
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{batch.code}</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/barcode-label" underline="hover" color="text.secondary">Barcode &amp; Label</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{batch.code}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack}>
            Back to Barcode &amp; Label List
          </Button>
          <Button variant="contained" onClick={handleEdit}>
            Edit Batch
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={12}>
          <LabelDetailsCard batch={batch} showPrintedFields={batch.status === 'printed'} />
        </Grid>
      </Grid>

      <LabelTermsAndNotes notes={notes} onNotesChange={setNotes} />
    </Stack>
  );
}
