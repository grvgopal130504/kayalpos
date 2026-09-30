import {
  Stack, Box, Typography, Button, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

import StockReturnDetailsCard from './components/StockReturnDetailsCard';
import { useGetStockReturnQuery } from '../../api/stockReturnApi';
import { toReturnDetails } from './stockReturnDisplay';

/**
 * Read-only "View Return" body for StockReturnTable's row menu — reuses the
 * exact same StockReturnDetailsCard the list page already shows for the
 * selected row. Rendered by StockReturnPage via props (`id`/`onBack`/
 * `onEdit`) as part of the single /stock-return page rather than its own
 * route. Fully wired to the real backend — every field here comes from the
 * actual StockReturn row fetched by GET /api/stock-returns/:id.
 */
export default function ReturnViewPage({ id: propId, onBack, onEdit }) {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const id = propId ?? paramId;
  const { data: row, isLoading, isError } = useGetStockReturnQuery(id, { skip: !id });
  const returnRecord = row ? toReturnDetails(row) : null;

  const handleBack = () => (onBack ? onBack() : navigate('/stock-return'));
  const handleEdit = () => (onEdit ? onEdit() : navigate(`/stock-return/edit/${id}`));

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading return…</Typography>
      </Stack>
    );
  }

  if (isError || !returnRecord) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Return not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack} sx={{ width: 'fit-content' }}>
          Back to Stock Return List
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{returnRecord.code}</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/stock-return" underline="hover" color="text.secondary">Stock Return</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{returnRecord.code}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack}>
            Back to Stock Return List
          </Button>
          <Button variant="contained" onClick={handleEdit}>
            Edit Return
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={12}>
          <StockReturnDetailsCard returnRecord={returnRecord} onEdit={handleEdit} />
        </Grid>
      </Grid>
    </Stack>
  );
}
