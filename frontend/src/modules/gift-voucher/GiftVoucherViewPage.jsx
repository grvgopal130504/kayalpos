import {
  Stack, Box, Typography, Button, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

import GiftVoucherDetailsCard from './components/GiftVoucherDetailsCard';
import { useGetGiftVoucherQuery } from '../../api/giftVoucherApi';
import { toGiftVoucherDetails } from './giftVoucherDisplay';

/**
 * Read-only "View Gift Voucher" destination for GiftVoucherTable's row
 * menu — reuses the exact same GiftVoucherDetailsCard the list page already
 * shows for the selected row, just addressed by :id as its own full page.
 * Fully wired to the backend: `id` is the real GiftVoucher row's cuid, not
 * the display code.
 */
export default function GiftVoucherViewPage({ id: propId, onBack, onEdit }) {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const id = propId ?? paramId;
  const { data: voucher, isLoading, isError } = useGetGiftVoucherQuery(id, { skip: !id });

  const handleBack = () => (onBack ? onBack() : navigate('/gift-voucher'));
  const handleEdit = () => (onEdit ? onEdit() : navigate(`/gift-voucher/edit/${id}`));

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading gift voucher…</Typography>
      </Stack>
    );
  }

  if (isError || !voucher) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Gift voucher not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack} sx={{ width: 'fit-content' }}>
          Back to Gift Voucher List
        </Button>
      </Stack>
    );
  }

  const details = toGiftVoucherDetails(voucher);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{details.code}</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/gift-voucher" underline="hover" color="text.secondary">Gift Voucher</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{details.code}</Typography>
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
          <GiftVoucherDetailsCard voucher={details} onEdit={handleEdit} />
        </Grid>
      </Grid>
    </Stack>
  );
}
