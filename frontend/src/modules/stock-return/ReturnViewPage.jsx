import {
  Stack, Box, Typography, Button, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

import StockReturnDetailsCard from './components/StockReturnDetailsCard';
import { getReturnDetails } from './stockReturnMockData';

/**
 * Read-only "View Return" destination for StockReturnTable's row menu —
 * reuses the exact same StockReturnDetailsCard the list page already shows
 * for the selected row, just addressed by :code as its own full page
 * instead of a side panel.
 */
export default function ReturnViewPage() {
  const navigate = useNavigate();
  const { code } = useParams();
  const returnRecord = getReturnDetails(code);

  const handleBack = () => navigate('/stock-return');
  const handleEdit = () => navigate(`/stock-return/edit/${code}`);

  if (!returnRecord) {
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
