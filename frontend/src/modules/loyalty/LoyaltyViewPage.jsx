import {
  Stack, Box, Typography, Button, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

import LoyaltyDetailsCard from './components/LoyaltyDetailsCard';
import { getLoyaltyProgramDetails } from './loyaltyMockData';

/**
 * Read-only "View Loyalty Program" destination for LoyaltyTable's row
 * menu — reuses the exact same LoyaltyDetailsCard the list page already
 * shows for the selected row, just addressed by :code as its own full page
 * instead of a side panel.
 */
export default function LoyaltyViewPage() {
  const navigate = useNavigate();
  const { code } = useParams();
  const program = getLoyaltyProgramDetails(code);

  const handleBack = () => navigate('/loyalty');
  const handleEdit = () => navigate(`/loyalty/edit/${code}`);

  if (!program) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Loyalty program not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack} sx={{ width: 'fit-content' }}>
          Back to Loyalty List
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{program.code}</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/loyalty" underline="hover" color="text.secondary">Loyalty</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{program.code}</Typography>
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
          <LoyaltyDetailsCard program={program} onEdit={handleEdit} />
        </Grid>
      </Grid>
    </Stack>
  );
}
