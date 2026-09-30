import {
  Stack, Box, Typography, Button, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

import PromotionDetailsCard from './components/PromotionDetailsCard';
import { useGetPromotionQuery } from '../../api/promotionApi';
import { useGetProductsQuery } from '../../api/productApi';
import { toPromotionDetails } from './promotionDisplay';

/**
 * Read-only "View Promotion" destination for PromotionTable's row menu —
 * reuses the exact same PromotionDetailsCard the list page already shows
 * for the selected row, just addressed by :id as its own full page. Fully
 * wired to the backend: `id` is the real Promotion row's cuid, not the
 * display code.
 */
export default function PromotionViewPage({ id: propId, onBack, onEdit }) {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const id = propId ?? paramId;
  const { data: promotion, isLoading, isError } = useGetPromotionQuery(id, { skip: !id });
  const { data: products = [] } = useGetProductsQuery({});
  const productNameByCode = Object.fromEntries(products.map((p) => [p.code, p.name]));

  const handleBack = () => (onBack ? onBack() : navigate('/promotion'));
  const handleEdit = () => (onEdit ? onEdit() : navigate(`/promotion/edit/${id}`));

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading promotion…</Typography>
      </Stack>
    );
  }

  if (isError || !promotion) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Promotion not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack} sx={{ width: 'fit-content' }}>
          Back to Promotion List
        </Button>
      </Stack>
    );
  }

  const details = toPromotionDetails(promotion, productNameByCode);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{details.code}</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/promotion" underline="hover" color="text.secondary">Promotion</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{details.code}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack}>
            Back to Promotion List
          </Button>
          <Button variant="contained" onClick={handleEdit}>
            Edit Promotion
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={12}>
          <PromotionDetailsCard promotion={details} onEdit={handleEdit} editLabel="Edit Promotion" />
        </Grid>
      </Grid>
    </Stack>
  );
}
