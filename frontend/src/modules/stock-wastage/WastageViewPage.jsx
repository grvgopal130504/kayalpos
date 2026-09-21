import {
  Stack, Box, Typography, Button, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

import StockWastageDetailsCard from './components/StockWastageDetailsCard';
import { useGetStockWastageQuery } from '../../api/stockWastageApi';
import { toWastageDetails } from './stockWastageDisplay';

/**
 * Read-only "View Wastage" body for StockWastageTable's row menu — reuses
 * the exact same StockWastageDetailsCard the list page already shows for
 * the selected row. Rendered by StockWastagePage via props (`id`/`onBack`/
 * `onEdit`) as part of the single /stock-wastage page rather than its own
 * route. Fully wired to the real backend — every field here comes from the
 * actual StockWastage row fetched by GET /api/stock-wastages/:id.
 */
export default function WastageViewPage({ id: propId, onBack, onEdit }) {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const id = propId ?? paramId;
  const { data: row, isLoading, isError } = useGetStockWastageQuery(id, { skip: !id });
  const wastage = row ? toWastageDetails(row) : null;

  const handleBack = () => (onBack ? onBack() : navigate('/stock-wastage'));
  const handleEdit = () => (onEdit ? onEdit() : navigate(`/stock-wastage/edit/${id}`));

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading wastage…</Typography>
      </Stack>
    );
  }

  if (isError || !wastage) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Wastage not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack} sx={{ width: 'fit-content' }}>
          Back to Stock Wastage List
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{wastage.code}</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/stock-wastage" underline="hover" color="text.secondary">Stock Wastage</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{wastage.code}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack}>
            Back to Stock Wastage List
          </Button>
          <Button variant="contained" onClick={handleEdit}>
            Edit Wastage
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={12}>
          <StockWastageDetailsCard wastage={wastage} onEdit={handleEdit} />
        </Grid>
      </Grid>
    </Stack>
  );
}
