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
import { getPromotionDetails } from './promotionMockData';
import {
  createPromotionSchema, createPromotionDefaultValues,
  PROMOTION_TYPE_OPTIONS, APPLIES_TO_OPTIONS, DISCOUNT_TYPE_OPTIONS, DISCOUNT_UNIT_OPTIONS,
  MAXIMUM_USAGE_OPTIONS, MAXIMUM_USAGE_DESCRIPTIONS,
} from './createPromotionSchema';

// The PROMOTIONS list row only carries `appliesTo` as a display label
// ('Item'/'Category'/'Bill'), not the form's radio value — map it back so
// edit mode can prefill the "Applies To" radio group correctly.
const APPLIES_TO_LABEL_TO_VALUE = { Item: 'specific', Category: 'category', Bill: 'all' };

// The list row's `type` matches PROMOTION_TYPE_OPTIONS directly, but the
// form also has a separate Discount Type field the list doesn't carry —
// derive a plausible one from the promotion type since there's no backend
// record with the real value.
const PROMOTION_TYPE_TO_DISCOUNT_TYPE = {
  'Percentage Off': 'Percentage',
  'Amount Off': 'Flat Amount',
  'Buy X Get Y': 'Free Item',
  'Bundle Offer': 'Special Price',
};

// Splits a display discount string ("10%", "₹100.00", "Free", "—") into the
// form's separate value/unit fields.
function parseDiscount(discount) {
  if (typeof discount === 'string' && discount.endsWith('%')) {
    return { discountValue: discount.slice(0, -1), discountUnit: '%' };
  }
  if (typeof discount === 'string' && discount.startsWith('₹')) {
    return { discountValue: discount.slice(1), discountUnit: '₹' };
  }
  return { discountValue: '', discountUnit: '%' };
}

/**
 * "Create Promotion" screen, also doubling as the Edit Promotion page when
 * reached via `/promotion/edit/:code` — the Promotion module has no backend
 * yet, so "editing" prefills from getPromotionDetails() the same best-effort
 * way the list/status pages' own detail panel does.
 */
export default function CreatePromotionPage({ code: propCode, onBack, embedded = false, onCreated, onCancel }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { code: paramCode } = useParams();
  const code = propCode ?? paramCode;
  const isEditMode = Boolean(code);
  const existingPromotion = isEditMode ? getPromotionDetails(code) : null;
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const methods = useForm({
    resolver: zodResolver(createPromotionSchema),
    defaultValues: useMemo(() => {
      if (!existingPromotion) return createPromotionDefaultValues;
      const { discountValue, discountUnit } = parseDiscount(existingPromotion.discount);
      return {
        ...createPromotionDefaultValues,
        promotionName: existingPromotion.name,
        promotionType: existingPromotion.type,
        appliesTo: APPLIES_TO_LABEL_TO_VALUE[existingPromotion.appliesTo] || 'all',
        discountType: PROMOTION_TYPE_TO_DISCOUNT_TYPE[existingPromotion.type] || '',
        discountValue,
        discountUnit,
        startDate: existingPromotion.startDate,
        endDate: existingPromotion.endDate,
      };
    }, [existingPromotion]),
    mode: 'onTouched',
  });
  const { watch, setValue, handleSubmit, formState: { errors } } = methods;
  const noExpiry = watch('noExpiry');
  const usageLimitEnabled = watch('usageLimitEnabled');
  const appliesTo = watch('appliesTo');
  const selectedItems = watch('selectedItems');
  const selectedCategories = watch('selectedCategories');
  const maximumUsage = watch('maximumUsage');

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
    if (isEditMode) return navigate(`/promotion/view/${code}`);
    if (embedded && onCancel) return onCancel();
    navigate('/promotion');
  };

  const onSubmit = () => {
    dispatch(showToast(isEditMode ? `Promotion ${code} updated successfully` : 'Promotion created as a draft', 'success'));
    if (onBack) {
      onBack();
    } else if (isEditMode) {
      navigate(`/promotion/view/${code}`);
    } else if (embedded && onCreated) {
      onCreated();
    } else {
      navigate('/promotion');
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

  if (isEditMode && !existingPromotion) {
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
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{isEditMode ? `Edit ${code}` : 'Create Promotion'}</Typography>
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
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{isEditMode ? `Edit Promotion (${code})` : 'Create Promotion'}</Typography>

                  <PromotionFormSection number={1} title="Promotion Information">
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormTextField name="promotionName" label="Promotion Name *" placeholder="Enter promotion name" />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Promotion Code"
                          value="Auto generated"
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
                    <Button variant="outlined" color="inherit" onClick={handleCancel}>Cancel</Button>
                    <Button type="submit" variant="contained">{isEditMode ? 'Update Promotion' : 'Save Promotion'}</Button>
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
