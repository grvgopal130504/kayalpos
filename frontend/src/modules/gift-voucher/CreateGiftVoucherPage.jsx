import { useEffect, useState } from 'react';
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
import {
  useGetGiftVoucherQuery, useNextGiftVoucherCodeQuery, useCreateGiftVoucherMutation, useUpdateGiftVoucherMutation,
} from '../../api/giftVoucherApi';
import {
  createGiftVoucherSchema, createGiftVoucherDefaultValues, parseGiftVoucherDate, formatGiftVoucherDate,
  VOUCHER_TYPE_OPTIONS, MAXIMUM_USAGE_OPTIONS, YES_NO_OPTIONS,
} from './createGiftVoucherSchema';

/** Builds react-hook-form default values from a real GiftVoucher row (as
 * returned by GET /api/gift-vouchers/:id) — dates come back as ISO strings
 * from Postgres, so they're reformatted into the "DD Mon YYYY" shape
 * FormDatePicker expects; numeric fields come back as numbers/Decimals and
 * are stringified for the text fields that hold them. */
function voucherToFormValues(voucher) {
  return {
    ...createGiftVoucherDefaultValues,
    voucherName: voucher.name,
    voucherType: voucher.voucherType,
    voucherValue: String(voucher.voucherValue ?? ''),
    description: voucher.description || '',
    validFrom: formatGiftVoucherDate(new Date(voucher.startDate)),
    validTill: voucher.endDate ? formatGiftVoucherDate(new Date(voucher.endDate)) : '',
    noExpiry: Boolean(voucher.noExpiry),
    minimumBillAmount: String(voucher.minimumBillAmount ?? '0'),
    maximumUsage: voucher.maximumUsage,
    oneTimePerCustomer: voucher.onePerCustomer ? 'yes' : 'no',
    partialRedemptionAllowed: voucher.partialRedemptionAllowed ? 'yes' : 'no',
    allowMultipleInOneBill: voucher.allowMultipleInOneBill ? 'yes' : 'no',
    applicableTo: voucher.applicableTo,
    active: Boolean(voucher.isActive),
    sendSms: Boolean(voucher.sendSms),
    sendEmail: Boolean(voucher.sendEmail),
  };
}

/** Converts the form's string-based values back into the types the backend
 * expects (real numbers, ISO dates, booleans instead of 'yes'/'no'), so the
 * payload sent to POST/PUT /api/gift-vouchers matches
 * giftVoucher.schema.js exactly. */
function formValuesToPayload(values) {
  const start = parseGiftVoucherDate(values.validFrom);
  const end = values.noExpiry ? null : parseGiftVoucherDate(values.validTill);
  return {
    voucherName: values.voucherName,
    voucherType: values.voucherType,
    voucherValue: Number(values.voucherValue || 0),
    description: values.description || '',
    startDate: start ? start.toISOString() : undefined,
    endDate: end ? end.toISOString() : null,
    noExpiry: values.noExpiry,
    minimumBillAmount: Number(values.minimumBillAmount || 0),
    maximumUsage: values.maximumUsage,
    onePerCustomer: values.oneTimePerCustomer === 'yes',
    partialRedemptionAllowed: values.partialRedemptionAllowed === 'yes',
    allowMultipleInOneBill: values.allowMultipleInOneBill === 'yes',
    applicableTo: values.applicableTo,
    isActive: values.active,
    sendSms: values.sendSms,
    sendEmail: values.sendEmail,
  };
}

/**
 * "Create Gift Voucher" screen, also doubling as the Edit Gift Voucher page
 * when reached via `/gift-voucher/edit/:id` — fully wired to the backend:
 * creating or updating a voucher here actually writes to the GiftVoucher
 * table (see backend/src/modules/gift-voucher), with the same validations
 * enforced again server-side so a request built outside this form can never
 * bypass them.
 */
export default function CreateGiftVoucherPage({ id: propId, onBack }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const id = propId ?? paramId;
  const isEditMode = Boolean(id);
  const { data: existingVoucher, isLoading: isLoadingExisting, isError: loadError } = useGetGiftVoucherQuery(id, { skip: !isEditMode });
  const nextCode = useNextGiftVoucherCodeQuery(undefined, { skip: isEditMode });
  const [createGiftVoucher, { isLoading: isCreating }] = useCreateGiftVoucherMutation();
  const [updateGiftVoucher, { isLoading: isUpdating }] = useUpdateGiftVoucherMutation();
  const isSaving = isCreating || isUpdating;
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);

  const methods = useForm({
    resolver: zodResolver(createGiftVoucherSchema),
    defaultValues: createGiftVoucherDefaultValues,
    mode: 'onTouched',
  });
  const { watch, setValue, reset, handleSubmit } = methods;
  const noExpiry = watch('noExpiry');
  const applicableTo = watch('applicableTo');

  // The edit-mode fetch is async, so the form can't be seeded via
  // useForm's defaultValues (that only runs once, before the data exists) —
  // reset() re-seeds every field once the real voucher row arrives.
  useEffect(() => {
    if (existingVoucher) reset(voucherToFormValues(existingVoucher));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingVoucher]);

  const handleBack = () => {
    if (onBack) return onBack();
    if (isEditMode) return navigate(`/gift-voucher/view/${id}`);
    navigate('/gift-voucher');
  };

  const onSubmit = async (values) => {
    const payload = formValuesToPayload(values);
    try {
      const saved = isEditMode
        ? await updateGiftVoucher({ id, ...payload }).unwrap()
        : await createGiftVoucher(payload).unwrap();

      dispatch(showToast(isEditMode ? `Gift voucher ${saved.code} updated successfully` : `Gift voucher ${saved.code} created successfully`, 'success'));
      if (onBack) onBack(saved.id);
      else if (isEditMode) navigate(`/gift-voucher/view/${saved.id}`);
      else navigate('/gift-voucher');
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to save the gift voucher', 'error'));
    }
  };

  const handleHistory = () => dispatch(showToast('Gift Voucher History is coming soon', 'info'));
  const handleCancel = handleBack;
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  if (isEditMode && isLoadingExisting) {
    return (
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading gift voucher…</Typography>
      </Stack>
    );
  }

  if (isEditMode && (loadError || !existingVoucher)) {
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
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{isEditMode ? `Edit ${existingVoucher?.code || ''}` : 'Create Gift Voucher'}</Typography>
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
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{isEditMode ? `Edit Gift Voucher (${existingVoucher?.code || ''})` : 'Create Gift Voucher'}</Typography>

                  <VoucherFormSection number={1} title="Voucher Information">
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Voucher Code"
                          value={isEditMode ? (existingVoucher?.code || '') : (nextCode.data || 'Generating…')}
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
                    <Button variant="outlined" color="inherit" onClick={handleCancel} disabled={isSaving}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={isSaving}>
                      {isSaving ? 'Saving…' : (isEditMode ? 'Update Voucher' : 'Save Voucher')}
                    </Button>
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
