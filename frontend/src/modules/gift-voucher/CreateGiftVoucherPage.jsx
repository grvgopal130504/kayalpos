import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Stack, Box, Typography, Button, Menu, MenuItem, Grid, Breadcrumbs, Link as MuiLink,
  Paper, RadioGroup, FormControlLabel, Radio, Tooltip, TextField,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';
import FormTextField from '../../components/form/FormTextField';
import FormDatePicker from '../../components/form/FormDatePicker';
import FormSelect from '../../components/form/FormSelect';
import FormCheckbox from '../../components/form/FormCheckbox';

import VoucherFormSection from './components/VoucherFormSection';
import VoucherPreviewPanel from './components/VoucherPreviewPanel';
import { getGiftVoucherDetails } from './giftVoucherMockData';
import {
  createGiftVoucherSchema, createGiftVoucherDefaultValues,
  VOUCHER_TYPE_OPTIONS, MAXIMUM_USAGE_OPTIONS, YES_NO_OPTIONS,
} from './createGiftVoucherSchema';

// The voucher's list/detail `type` label ('Amount Off'/'Percentage Off')
// doesn't match VOUCHER_TYPE_OPTIONS' values — map it back so edit mode can
// prefill the Voucher Type select correctly.
const VOUCHER_TYPE_LABEL_TO_VALUE = {
  'Amount Off': 'Fixed Amount',
  'Percentage Off': 'Percentage Discount',
};

// Splits a display value string ("₹250.00", "10%") into just the numeric
// amount the form's plain "Voucher Value (₹)" text field expects.
function parseVoucherValue(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/[₹%]/g, '').trim();
}

/**
 * "Create Gift Voucher" screen, also doubling as the Edit Gift Voucher page
 * when reached via `/gift-voucher/edit/:code` — the Gift Voucher module has
 * no backend yet, so "editing" prefills from getGiftVoucherDetails() the
 * same best-effort way GiftVoucherPage's own detail panel does.
 */
export default function CreateGiftVoucherPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { code } = useParams();
  const isEditMode = Boolean(code);
  const existingVoucher = isEditMode ? getGiftVoucherDetails(code) : null;
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);

  const methods = useForm({
    resolver: zodResolver(createGiftVoucherSchema),
    defaultValues: useMemo(() => {
      if (!existingVoucher) return createGiftVoucherDefaultValues;
      return {
        ...createGiftVoucherDefaultValues,
        voucherName: existingVoucher.name,
        voucherType: VOUCHER_TYPE_LABEL_TO_VALUE[existingVoucher.type] || '',
        voucherValue: parseVoucherValue(existingVoucher.value),
        description: existingVoucher.description || '',
        validFrom: existingVoucher.validFrom,
        validTill: existingVoucher.validTill,
        minimumBillAmount: parseVoucherValue(existingVoucher.minimumBillAmount),
        applicableTo: existingVoucher.applicableTo === 'All Items' ? 'all' : (existingVoucher.applicableTo || 'all'),
        active: existingVoucher.status === 'active',
      };
    }, [existingVoucher]),
    mode: 'onTouched',
  });
  const { watch, setValue, handleSubmit } = methods;
  const noExpiry = watch('noExpiry');
  const applicableTo = watch('applicableTo');

  const handleBack = () => {
    if (isEditMode) navigate(`/gift-voucher/view/${code}`);
    else navigate('/gift-voucher');
  };

  const onSubmit = () => {
    dispatch(showToast(isEditMode ? `Gift voucher ${code} updated successfully` : 'Gift voucher created as a draft', 'success'));
    if (isEditMode) navigate(`/gift-voucher/view/${code}`);
    else navigate('/gift-voucher');
  };

  const handleHistory = () => dispatch(showToast('Gift Voucher History is coming soon', 'info'));
  const handleCancel = handleBack;
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  if (isEditMode && !existingVoucher) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Gift voucher not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={() => navigate('/gift-voucher')} sx={{ width: 'fit-content' }}>
          Back to Gift Voucher List
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Gift Voucher</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/gift-voucher" underline="hover" color="text.secondary">Gift Voucher</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{isEditMode ? `Edit ${code}` : 'Create Gift Voucher'}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack}>
            Back
          </Button>
          {!isEditMode && (
            <Button variant="outlined" color="inherit" startIcon={<HistoryOutlinedIcon fontSize="small" />} onClick={handleHistory}>
              Gift Voucher History
            </Button>
          )}
          <Button
            variant="outlined"
            color="inherit"
            endIcon={<ExpandMoreIcon />}
            onClick={(e) => setMoreActionsAnchor(e.currentTarget)}
          >
            More Actions
          </Button>
          <Menu anchorEl={moreActionsAnchor} open={Boolean(moreActionsAnchor)} onClose={() => setMoreActionsAnchor(null)}>
            <MenuItem onClick={() => handleMoreAction('Export Vouchers')}>Export Vouchers</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Bulk Deactivate')}>Bulk Deactivate</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Voucher Settings')}>Voucher Settings</MenuItem>
          </Menu>
        </Stack>
      </Stack>

      <FormProvider {...methods}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Grid size={{ xs: 12, lg: 7 }}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2.5, sm: 3 } }}>
                <Stack spacing={3.5}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{isEditMode ? `Edit Gift Voucher (${code})` : 'Create Gift Voucher'}</Typography>

                  <VoucherFormSection number={1} title="Voucher Information">
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Voucher Code"
                          value={isEditMode ? code : 'Auto generated'}
                          disabled
                          fullWidth
                          slotProps={{ input: { readOnly: true } }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormTextField name="voucherName" label="Voucher Name *" placeholder="Enter voucher name" />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormSelect name="voucherType" label="Voucher Type *" options={VOUCHER_TYPE_OPTIONS} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormTextField name="voucherValue" label="Voucher Value (₹) *" placeholder="Enter value" />
                      </Grid>
                      <Grid size={12}>
                        <FormTextField name="description" label="Description" placeholder="Enter description (optional)" />
                      </Grid>
                    </Grid>
                  </VoucherFormSection>

                  <VoucherFormSection number={2} title="Validity">
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormDatePicker name="validFrom" label="Valid From *" />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormDatePicker name="validTill" label="Valid Till *" disabled={noExpiry} />
                      </Grid>
                      <Grid size={12}>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                          <FormCheckbox
                            name="noExpiry"
                            label={<Typography variant="body2">No Expiry (Valid Till Date)</Typography>}
                          />
                          <Tooltip title="The voucher stays valid indefinitely instead of ending on a fixed date.">
                            <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          </Tooltip>
                        </Stack>
                      </Grid>
                    </Grid>
                  </VoucherFormSection>

                  <VoucherFormSection number={3} title="Redemption Rules">
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormTextField name="minimumBillAmount" label="Minimum Bill Amount (₹)" placeholder="Enter amount" />
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                          Set 0 for no minimum
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormSelect name="maximumUsage" label="Maximum Usage" options={MAXIMUM_USAGE_OPTIONS} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormSelect name="oneTimePerCustomer" label="One Time Per Customer" options={YES_NO_OPTIONS} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormSelect name="partialRedemptionAllowed" label="Partial Redemption Allowed" options={YES_NO_OPTIONS} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormSelect name="allowMultipleInOneBill" label="Allow Multiple Vouchers in One Bill" options={YES_NO_OPTIONS} />
                      </Grid>
                    </Grid>
                  </VoucherFormSection>

                  <VoucherFormSection number={4} title="Applicable To">
                    <RadioGroup
                      row
                      value={applicableTo}
                      onChange={(e) => setValue('applicableTo', e.target.value, { shouldValidate: true })}
                      sx={{ flexWrap: 'wrap' }}
                    >
                      <FormControlLabel value="all" control={<Radio size="small" />} label={<Typography variant="body2">All Items</Typography>} />
                      <FormControlLabel value="specific" control={<Radio size="small" />} label={<Typography variant="body2">Specific Items</Typography>} />
                      <FormControlLabel value="category" control={<Radio size="small" />} label={<Typography variant="body2">Category</Typography>} />
                    </RadioGroup>
                  </VoucherFormSection>

                  <VoucherFormSection number={5} title="Additional Settings">
                    <Stack spacing={1.5}>
                      <FormCheckbox name="active" label={<Typography variant="body2">Active</Typography>} />
                      <FormCheckbox name="sendSms" label={<Typography variant="body2">Send SMS to Customer</Typography>} />
                      <FormCheckbox name="sendEmail" label={<Typography variant="body2">Send Email to Customer</Typography>} />
                    </Stack>
                  </VoucherFormSection>

                  <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end', pt: 1 }}>
                    <Button variant="outlined" color="inherit" onClick={handleCancel}>Cancel</Button>
                    <Button type="submit" variant="contained">{isEditMode ? 'Update Voucher' : 'Save Voucher'}</Button>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, lg: 5 }}>
              <VoucherPreviewPanel />
            </Grid>
          </Grid>
        </Box>
      </FormProvider>
    </Stack>
  );
}
