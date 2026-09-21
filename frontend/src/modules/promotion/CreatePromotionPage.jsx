import { useEffect, useMemo, useState } from 'react';
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
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';
import FormTextField from '../../components/form/FormTextField';
import FormDatePicker from '../../components/form/FormDatePicker';
import FormSelect from '../../components/form/FormSelect';
import FormCheckbox from '../../components/form/FormCheckbox';

import PromotionFormSection from './components/PromotionFormSection';
import PromotionPreviewPanel from './components/PromotionPreviewPanel';
import PromotionItemPickerDialog from './components/PromotionItemPickerDialog';
import {
  useGetPromotionQuery, useNextPromotionCodeQuery, useCreatePromotionMutation, useUpdatePromotionMutation,
} from '../../api/promotionApi';
import {
  createPromotionSchema, createPromotionDefaultValues, parsePromotionDate, formatPromotionDate,
  PROMOTION_TYPE_OPTIONS, APPLIES_TO_OPTIONS, DISCOUNT_TYPE_OPTIONS, DISCOUNT_UNIT_OPTIONS,
  MAXIMUM_USAGE_OPTIONS, MAXIMUM_USAGE_DESCRIPTIONS,
} from './createPromotionSchema';

/** Builds react-hook-form default values from a real Promotion row (as
 * returned by GET /api/promotions/:id) — dates come back as ISO strings
 * from Postgres, so they're reformatted into the "DD Mon YYYY" shape
 * FormDatePicker expects; numeric fields come back as numbers/Decimals and
 * are stringified for the text fields that hold them. */
function promotionToFormValues(promotion) {
  return {
    ...createPromotionDefaultValues,
    promotionName: promotion.name,
    promotionType: promotion.promotionType,
    description: promotion.description || '',
    appliesTo: promotion.appliesTo,
    discountType: promotion.discountType,
    discountValue: String(promotion.discountValue ?? ''),
    discountUnit: promotion.discountUnit,
    maximumUsage: promotion.maximumUsage,
    minimumBillAmount: String(promotion.minimumBillAmount ?? '0'),
    startDate: formatPromotionDate(new Date(promotion.startDate)),
    endDate: promotion.endDate ? formatPromotionDate(new Date(promotion.endDate)) : '',
    noExpiry: Boolean(promotion.noExpiry),
    usageLimitEnabled: Boolean(promotion.usageLimitEnabled),
    usageLimitCount: String(promotion.usageLimitCount ?? '0'),
    onePerCustomer: Boolean(promotion.onePerCustomer),
    combinable: Boolean(promotion.combinable),
    showInInvoice: Boolean(promotion.showInInvoice),
    selectedItems: promotion.selectedItems || [],
    selectedCategories: promotion.selectedCategories || [],
  };
}

/** Converts the form's string-based values back into the types the backend
 * expects (real numbers, ISO dates, null instead of ''), so the payload
 * sent to POST/PUT /api/promotions matches promotion.schema.js exactly. */
function formValuesToPayload(values) {
  const start = parsePromotionDate(values.startDate);
  const end = values.noExpiry ? null : parsePromotionDate(values.endDate);
  return {
    promotionName: values.promotionName,
    promotionType: values.promotionType,
    description: values.description || '',
    appliesTo: values.appliesTo,
    discountType: values.discountType,
    discountValue: Number(values.discountValue || 0),
    discountUnit: values.discountUnit,
    maximumUsage: values.maximumUsage,
    minimumBillAmount: Number(values.minimumBillAmount || 0),
    startDate: start ? start.toISOString() : undefined,
    endDate: end ? end.toISOString() : null,
    noExpiry: values.noExpiry,
    usageLimitEnabled: values.usageLimitEnabled,
    usageLimitCount: Number(values.usageLimitCount || 0),
    onePerCustomer: values.onePerCustomer,
    combinable: values.combinable,
    showInInvoice: values.showInInvoice,
    selectedItems: values.appliesTo === 'specific' ? values.selectedItems : [],
    selectedCategories: values.appliesTo === 'category' ? values.selectedCategories : [],
  };
}

/**
 * "Create Promotion" screen, also doubling as the Edit Promotion page when
 * reached via `/promotion/edit/:id` — fully wired to the backend: creating
 * or updating a promotion here actually writes to the Promotion table (see
 * backend/src/modules/promotion), with the same validations enforced again
 * server-side so a request built outside this form can never bypass them.
 */
export default function CreatePromotionPage({ id: propId, onBack, embedded = false, onCreated, onCancel }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const id = propId ?? paramId;
  const isEditMode = Boolean(id);
  const { data: existingPromotion, isLoading: isLoadingExisting, isError: loadError } = useGetPromotionQuery(id, { skip: !isEditMode });
  const nextCode = useNextPromotionCodeQuery(undefined, { skip: isEditMode });
  const [createPromotion, { isLoading: isCreating }] = useCreatePromotionMutation();
  const [updatePromotion, { isLoading: isUpdating }] = useUpdatePromotionMutation();
  const isSaving = isCreating || isUpdating;
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const methods = useForm({
    resolver: zodResolver(createPromotionSchema),
    defaultValues: createPromotionDefaultValues,
    mode: 'onTouched',
  });
  const { watch, setValue, reset, handleSubmit, formState: { errors } } = methods;
  const noExpiry = watch('noExpiry');
  const usageLimitEnabled = watch('usageLimitEnabled');
  const appliesTo = watch('appliesTo');
  const selectedItems = watch('selectedItems');
  const selectedCategories = watch('selectedCategories');
  const maximumUsage = watch('maximumUsage');

  // The edit-mode fetch is async, so the form can't be seeded via
  // useForm's defaultValues (that only runs once, before the data exists) —
  // reset() re-seeds every field once the real promotion row arrives.
  useEffect(() => {
    if (existingPromotion) reset(promotionToFormValues(existingPromotion));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingPromotion]);

  // Switching "Applies To" away from Specific Items / Category drops
  // whichever selection no longer applies, so a stale pick from a previous
  // choice can't silently ride along (e.g. picking items, then switching to
  // "All Items", then back to "Specific Items" starts fresh rather than
  // reusing the old list).
  useEffect(() => {
    if (appliesTo !== 'specific' && selectedItems?.length) setValue('selectedItems', []);
    if (appliesTo !== 'category' && selectedCategories?.length) setValue('selectedCategories', []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliesTo]);

  const handleBack = () => {
    if (onBack) return onBack();
    if (isEditMode) return navigate(`/promotion/view/${id}`);
    if (embedded && onCancel) return onCancel();
    navigate('/promotion');
  };

  const onSubmit = async (values) => {
    const payload = formValuesToPayload(values);
    try {
      const saved = isEditMode
        ? await updatePromotion({ id, ...payload }).unwrap()
        : await createPromotion(payload).unwrap();

      dispatch(showToast(isEditMode ? `Promotion ${saved.code} updated successfully` : `Promotion ${saved.code} created successfully`, 'success'));
      if (onBack) {
        onBack(saved.id);
      } else if (isEditMode) {
        navigate(`/promotion/view/${saved.id}`);
      } else if (embedded && onCreated) {
        onCreated(saved.id);
      } else {
        navigate('/promotion');
      }
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to save the promotion', 'error'));
    }
  };

  const handleImport = () => dispatch(showToast('Import Promotion is coming soon', 'info'));
  const handleCancel = handleBack;
  const handleOpenPicker = () => setPickerOpen(true);
  const handleClosePicker = () => setPickerOpen(false);
  const handleApplyPicker = (values) => {
    if (appliesTo === 'category') {
      setValue('selectedCategories', values, { shouldValidate: true });
    } else {
      setValue('selectedItems', values, { shouldValidate: true });
    }
    setPickerOpen(false);
  };
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  if (isEditMode && isLoadingExisting) {
    return (
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading promotion…</Typography>
      </Stack>
    );
  }

  if (isEditMode && (loadError || !existingPromotion)) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Promotion not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={() => navigate('/promotion')} sx={{ width: 'fit-content' }}>
          Back to Promotion List
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      {!embedded && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Promotion</Typography>
            <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
              <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
              <MuiLink component={RouterLink} to="/promotion" underline="hover" color="text.secondary">Promotion</MuiLink>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{isEditMode ? `Edit ${existingPromotion?.code || ''}` : 'Create Promotion'}</Typography>
            </Breadcrumbs>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" color="inherit" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack}>
              Back
            </Button>
            {!isEditMode && (
              <Button variant="outlined" color="inherit" startIcon={<FileUploadOutlinedIcon fontSize="small" />} onClick={handleImport}>
                Import Promotion
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
              <MenuItem onClick={() => handleMoreAction('Export Promotions')}>Export Promotions</MenuItem>
              <MenuItem onClick={() => handleMoreAction('Bulk Deactivate')}>Bulk Deactivate</MenuItem>
              <MenuItem onClick={() => handleMoreAction('Promotion Settings')}>Promotion Settings</MenuItem>
            </Menu>
          </Stack>
        </Stack>
      )}

      <FormProvider {...methods}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Grid size={{ xs: 12, lg: 7 }}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2.5, sm: 3 } }}>
                <Stack spacing={3.5}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{isEditMode ? `Edit Promotion (${existingPromotion?.code || ''})` : 'Create Promotion'}</Typography>

                  <PromotionFormSection number={1} title="Promotion Information">
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormTextField name="promotionName" label="Promotion Name *" placeholder="Enter promotion name" />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Promotion Code"
                          value={isEditMode ? (existingPromotion?.code || '') : (nextCode.data || 'Generating…')}
                          disabled
                          fullWidth
                          slotProps={{ input: { readOnly: true } }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormSelect name="promotionType" label="Promotion Type *" options={PROMOTION_TYPE_OPTIONS} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormTextField name="description" label="Description" placeholder="Enter description (optional)" />
                      </Grid>
                    </Grid>
                  </PromotionFormSection>

                  <PromotionFormSection number={2} title="Applies To">
                    <Stack spacing={1.5}>
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
                        <Box sx={{ width: { xs: '100%', md: 260 }, flexShrink: 0 }}>
                          <FormSelect name="appliesTo" label="Applies To *" options={APPLIES_TO_OPTIONS} />
                        </Box>
                        <RadioGroup
                          row
                          value={appliesTo}
                          onChange={(e) => setValue('appliesTo', e.target.value, { shouldValidate: true })}
                          sx={{ flexWrap: 'wrap' }}
                        >
                          <FormControlLabel value="all" control={<Radio size="small" />} label={<Typography variant="body2">All Items</Typography>} />
                          <FormControlLabel value="specific" control={<Radio size="small" />} label={<Typography variant="body2">Specific Items</Typography>} />
                          <FormControlLabel value="category" control={<Radio size="small" />} label={<Typography variant="body2">Category</Typography>} />
                        </RadioGroup>
                      </Stack>

                      {appliesTo === 'all' && (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          This promotion will apply to every item in the catalog.
                        </Typography>
                      )}

                      {(appliesTo === 'specific' || appliesTo === 'category') && (
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
                          <Button variant="outlined" size="small" startIcon={<AddIcon fontSize="small" />} onClick={handleOpenPicker}>
                            {(appliesTo === 'category' ? selectedCategories : selectedItems)?.length > 0
                              ? `Change ${appliesTo === 'category' ? 'Categories' : 'Items'}`
                              : `Select ${appliesTo === 'category' ? 'Categories' : 'Items'}`}
                          </Button>
                          {(appliesTo === 'category' ? selectedCategories : selectedItems)?.length > 0 && (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {(appliesTo === 'category' ? selectedCategories : selectedItems).length}{' '}
                              {appliesTo === 'category' ? 'categor' : 'item'}
                              {(appliesTo === 'category' ? selectedCategories : selectedItems).length === 1
                                ? (appliesTo === 'category' ? 'y' : '')
                                : (appliesTo === 'category' ? 'ies' : 's')} selected
                            </Typography>
                          )}
                          {(errors.selectedItems || errors.selectedCategories) && (
                            <Typography variant="caption" color="error">
                              {(appliesTo === 'category' ? errors.selectedCategories : errors.selectedItems)?.message}
                            </Typography>
                          )}
                        </Stack>
                      )}
                    </Stack>
                  </PromotionFormSection>

                  <PromotionFormSection number={3} title="Discount &amp; Offer Details">
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormSelect name="discountType" label="Discount Type *" options={DISCOUNT_TYPE_OPTIONS} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Stack direction="row" spacing={1}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <FormTextField name="discountValue" label="Discount Value *" placeholder="Enter value" />
                          </Box>
                          <Box sx={{ width: 90, flexShrink: 0 }}>
                            <FormSelect name="discountUnit" label="Unit" options={DISCOUNT_UNIT_OPTIONS} />
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormSelect name="maximumUsage" label="Maximum Usage" options={MAXIMUM_USAGE_OPTIONS} />
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                          {MAXIMUM_USAGE_DESCRIPTIONS[maximumUsage]}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormTextField name="minimumBillAmount" label="Minimum Bill Amount (₹)" placeholder="Enter amount" />
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                          Set 0 for no minimum
                        </Typography>
                      </Grid>
                    </Grid>
                  </PromotionFormSection>

                  <PromotionFormSection number={4} title="Validity Period">
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormDatePicker name="startDate" label="Start Date *" />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormDatePicker name="endDate" label="End Date *" disabled={noExpiry} />
                      </Grid>
                      <Grid size={12}>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                          <FormCheckbox
                            name="noExpiry"
                            label={<Typography variant="body2">No Expiry (Valid Till Date)</Typography>}
                          />
                          <Tooltip title="The promotion stays active indefinitely instead of ending on a fixed date.">
                            <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          </Tooltip>
                        </Stack>
                      </Grid>
                    </Grid>
                  </PromotionFormSection>

                  <PromotionFormSection number={5} title="Additional Settings">
                    <Stack spacing={1.5}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
                        <FormCheckbox
                          name="usageLimitEnabled"
                          label={<Typography variant="body2">Usage Limit (Till Date)</Typography>}
                        />
                        <Box sx={{ width: { xs: '100%', sm: 120 } }}>
                          <FormTextField name="usageLimitCount" label="" placeholder="0" disabled={!usageLimitEnabled} size="small" />
                        </Box>
                      </Stack>
                      <FormCheckbox
                        name="combinable"
                        label={<Typography variant="body2">Can be combined with other promotions</Typography>}
                      />
                      <FormCheckbox
                        name="showInInvoice"
                        label={<Typography variant="body2">Show in Invoice</Typography>}
                      />
                    </Stack>
                  </PromotionFormSection>

                  <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end', pt: 1 }}>
                    <Button variant="outlined" color="inherit" onClick={handleCancel} disabled={isSaving}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={isSaving}>
                      {isSaving ? 'Saving…' : (isEditMode ? 'Update Promotion' : 'Save Promotion')}
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, lg: 5 }}>
              <PromotionPreviewPanel onSelectItems={handleOpenPicker} />
            </Grid>
          </Grid>
        </Box>
      </FormProvider>

      <PromotionItemPickerDialog
        open={pickerOpen}
        mode={appliesTo === 'category' ? 'category' : 'items'}
        initialSelected={appliesTo === 'category' ? selectedCategories : selectedItems}
        onApply={handleApplyPicker}
        onClose={handleClosePicker}
      />
    </Stack>
  );
}
