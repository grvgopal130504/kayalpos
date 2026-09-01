import { useState } from 'react';
import {
  Stack, Box, Typography, Button, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

import TransferDetailsCard from './components/TransferDetailsCard';
import TransferTermsAndNotes from './components/TransferTermsAndNotes';
import { getTransferDetails } from './stockTransferMockData';

/**
 * Read-only "View Transfer" destination for StockTransferTable's row menu —
 * reuses the exact same TransferDetailsCard/TransferTermsAndNotes cards
 * the Overview/Status pages already show for the selected row, just
 * addressed by :code as its own full page instead of a side panel.
 */
export default function TransferViewPage() {
  const navigate = useNavigate();
  const { code } = useParams();
  const transfer = getTransferDetails(code);
  const [notes, setNotes] = useState('');

  const handleBack = () => navigate('/stock-transfer');
  const handleEdit = () => navigate(`/stock-transfer/edit/${code}`);

  if (!transfer) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Transfer not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack} sx={{ width: 'fit-content' }}>
          Back to Stock Transfer List
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{transfer.code}</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/stock-transfer" underline="hover" color="text.secondary">Stock Transfer</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{transfer.code}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack}>
            Back to Stock Transfer List
          </Button>
          <Button variant="contained" onClick={handleEdit}>
            Edit Transfer
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={12}>
          <TransferDetailsCard transfer={transfer} showReceivedFields={transfer.status === 'received'} />
        </Grid>
      </Grid>

      <TransferTermsAndNotes notes={notes} onNotesChange={setNotes} />
    </Stack>
  );
}
