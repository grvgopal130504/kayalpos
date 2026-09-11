import {
  Stack, Box, Typography, Button, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

import PromotionDetailsCard from './components/PromotionDetailsCard';
import { getPromotionDetails } from './promotionMockData';

/**
 * Read-only "View Promotion" destination for PromotionTable's row menu (and
 * the Overview/Status pages' own row menus) — reuses the exact same
 * PromotionDetailsCard the list pages already show for the selected row,
 * just addressed by :code as its own full page instead of a side panel.
 */
export default function PromotionViewPage({ code: propCode, onBack, onEdit }) {
  const navigate = useNavigate();
  const { code: paramCode } = useParams();
  const code = propCode ?? paramCode;
  const promotion = getPromotionDetails(code);

  const handleBack = () => (onBack ? onBack() : navigate('/promotion'));
  const handleEdit = () => (onEdit ? onEdit() : navigate(`/promotion/edit/${code}`));

  if (!promotion) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Promotion not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack} sx={{ width: 'fit-content' }}>
          Back to Promotion List
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{promotion.code}</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/promotion" underline="hover" color="text.secondary">Promotion</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{promotion.code}</Typography>
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
          <PromotionDetailsCard promotion={promotion} onEdit={handleEdit} editLabel="Edit Promotion" />
        </Grid>
      </Grid>
    </Stack>
  );
}
