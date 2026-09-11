import {
  Stack, Box, Typography, Button, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

import StockCountDetailsCard from './components/StockCountDetailsCard';
import { getCountDetails } from './stockCountMockData';

/**
 * Read-only "View Count" destination for StockCountTable's row menu —
 * reuses the exact same StockCountDetailsCard the list page already shows
 * for the selected row, just addressed by :code as its own full page
 * instead of a side panel.
 */
export default function CountViewPage({ code: propCode, onBack, onEdit }) {
  const navigate = useNavigate();
  const { code: paramCode } = useParams();
  const code = propCode ?? paramCode;
  const count = getCountDetails(code);

  const handleBack = () => (onBack ? onBack() : navigate('/stock-count'));
  const handleEdit = () => (onEdit ? onEdit() : navigate(`/stock-count/edit/${code}`));

  if (!count) {
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
