import {
  Stack, Box, Typography, Button, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

import LoyaltyDetailsCard from './components/LoyaltyDetailsCard';
import { useGetLoyaltyProgramQuery } from '../../api/loyaltyApi';
import { toLoyaltyDetails } from './loyaltyDisplay';

/**
 * Read-only "View Loyalty Program" destination for LoyaltyTable's row
 * menu — reuses the exact same LoyaltyDetailsCard the list page already
 * shows for the selected row, just addressed by :id as its own full page.
 * Fully wired to the backend: `id` is the real LoyaltyProgram row's cuid,
 * not the display code.
 */
export default function LoyaltyViewPage({ id: propId, onBack, onEdit }) {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const id = propId ?? paramId;
  const { data: program, isLoading, isError } = useGetLoyaltyProgramQuery(id, { skip: !id });

  const handleBack = () => (onBack ? onBack() : navigate('/loyalty'));
  const handleEdit = () => (onEdit ? onEdit() : navigate(`/loyalty/edit/${id}`));

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading loyalty program…</Typography>
      </Stack>
    );
  }

  if (isError || !program) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Loyalty program not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack} sx={{ width: 'fit-content' }}>
          Back to Loyalty List
        </Button>
      </Stack>
    );
  }

  const details = toLoyaltyDetails(program);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{details.code}</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/loyalty" underline="hover" color="text.secondary">Loyalty</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{details.code}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack}>
            Back to Loyalty List
          </Button>
          <Button variant="contained" onClick={handleEdit}>
            Edit Program
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={12}>
          <LoyaltyDetailsCard program={details} onEdit={handleEdit} />
        </Grid>
      </Grid>
    </Stack>
  );
}
