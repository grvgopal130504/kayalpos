import {
  Stack, Box, Typography, Button, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

import GiftVoucherDetailsCard from './components/GiftVoucherDetailsCard';
import { getGiftVoucherDetails } from './giftVoucherMockData';

/**
 * Read-only "View Gift Voucher" destination for GiftVoucherTable's row
 * menu — reuses the exact same GiftVoucherDetailsCard the list page already
 * shows for the selected row, just addressed by :code as its own full page
 * instead of a side panel.
 */
export default function GiftVoucherViewPage() {
  const navigate = useNavigate();
  const { code } = useParams();
  const voucher = getGiftVoucherDetails(code);

  const handleBack = () => navigate('/gift-voucher');
  const handleEdit = () => navigate(`/gift-voucher/edit/${code}`);

  if (!voucher) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Gift voucher not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack} sx={{ width: 'fit-content' }}>
          Back to Gift Voucher List
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{voucher.code}</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/gift-voucher" underline="hover" color="text.secondary">Gift Voucher</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{voucher.code}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack}>
            Back to Gift Voucher List
          </Button>
          <Button variant="contained" onClick={handleEdit}>
            Edit Voucher
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={12}>
          <GiftVoucherDetailsCard voucher={voucher} onEdit={handleEdit} />
        </Grid>
      </Grid>
    </Stack>
  );
}
