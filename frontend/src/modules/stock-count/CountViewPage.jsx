import {
  Stack, Box, Typography, Button, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

import StockCountDetailsCard from './components/StockCountDetailsCard';
import { useGetStockCountQuery } from '../../api/stockCountApi';
import { toCountDetails } from './stockCountDisplay';

/**
 * Read-only "View Count" body for StockCountTable's row menu — reuses the
 * exact same StockCountDetailsCard the list page already shows for the
 * selected row. Rendered by StockCountPage via props (`id`/`onBack`/
 * `onEdit`) as part of the single /stock-count page rather than its own
 * route. Fully wired to the real backend — every field here comes from the
 * actual StockCount row fetched by GET /api/stock-counts/:id.
 */
export default function CountViewPage({ id: propId, onBack, onEdit }) {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const id = propId ?? paramId;
  const { data: row, isLoading, isError } = useGetStockCountQuery(id, { skip: !id });
  const count = row ? toCountDetails(row) : null;

  const handleBack = () => (onBack ? onBack() : navigate('/stock-count'));
  const handleEdit = () => (onEdit ? onEdit() : navigate(`/stock-count/edit/${id}`));

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading count…</Typography>
      </Stack>
    );
  }

  if (isError || !count) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Count not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack} sx={{ width: 'fit-content' }}>
          Back to Stock Count List
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{count.code}</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/stock-count" underline="hover" color="text.secondary">Stock Count</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{count.code}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack}>
            Back to Stock Count List
          </Button>
          <Button variant="contained" onClick={handleEdit}>
            Edit Count
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={12}>
          <StockCountDetailsCard count={count} onEdit={handleEdit} />
        </Grid>
      </Grid>
    </Stack>
  );
}
