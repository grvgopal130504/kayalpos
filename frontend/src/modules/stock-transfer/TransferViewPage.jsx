import { useState } from 'react';
import {
  Stack, Box, Typography, Button, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

import TransferDetailsCard from './components/TransferDetailsCard';
import TransferTermsAndNotes from './components/TransferTermsAndNotes';
import { useGetStockTransferQuery } from '../../api/stockTransferApi';
import { toTransferDetails } from './stockTransferDisplay';

/**
 * Read-only "View Transfer" body for StockTransferTable's row menu — reuses
 * the exact same TransferDetailsCard/TransferTermsAndNotes cards the
 * Overview/Status pages already show for the selected row. Rendered by
 * StockTransferPage via props (`id`/`onBack`/`onEdit`) as part of the
 * single /stock-transfer page rather than its own route. Fully wired to the
 * real backend — every field here comes from the actual StockTransfer row
 * fetched by GET /api/stock-transfers/:id.
 */
export default function TransferViewPage({ id: propId, onBack, onEdit }) {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const id = propId ?? paramId;
  const { data: row, isLoading, isError } = useGetStockTransferQuery(id, { skip: !id });
  const transfer = row ? toTransferDetails(row) : null;
  const [notes, setNotes] = useState('');

  const handleBack = () => (onBack ? onBack() : navigate('/stock-transfer'));
  const handleEdit = () => (onEdit ? onEdit() : navigate(`/stock-transfer/edit/${id}`));

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading transfer…</Typography>
      </Stack>
    );
  }

  if (isError || !transfer) {
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
