import {
  Stack, Box, Typography, Button, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

import StockReceiptDetailsCard from './components/StockReceiptDetailsCard';
import { getReceiptDetails } from './stockReceiptMockData';

/**
 * Read-only "View Receipt" destination for StockReceiptTable's row menu —
 * reuses the exact same StockReceiptDetailsCard the list page already
 * shows for the selected row, just addressed by :code as its own full page
 * instead of a side panel.
 */
export default function ReceiptViewPage() {
  const navigate = useNavigate();
  const { code } = useParams();
  const receipt = getReceiptDetails(code);

  const handleBack = () => navigate('/stock-receipt');
  const handleEdit = () => navigate(`/stock-receipt/edit/${code}`);

  if (!receipt) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Receipt not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack} sx={{ width: 'fit-content' }}>
          Back to Stock Receipt List
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{receipt.code}</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/stock-receipt" underline="hover" color="text.secondary">Stock Receipt</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{receipt.code}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack}>
            Back to Stock Receipt List
          </Button>
          <Button variant="contained" onClick={handleEdit}>
            Edit Receipt
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={12}>
          <StockReceiptDetailsCard receipt={receipt} onEdit={handleEdit} />
        </Grid>
      </Grid>
    </Stack>
  );
}
