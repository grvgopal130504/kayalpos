import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Stack, Box, Typography, Button, Menu, MenuItem, Grid, Breadcrumbs, Link as MuiLink,
  Paper, Alert, Tooltip, TextField,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';
import FormTextField from '../../components/form/FormTextField';
import FormSelect from '../../components/form/FormSelect';
import FormCheckbox from '../../components/form/FormCheckbox';

import LoyaltyFormSection from './components/LoyaltyFormSection';
import LoyaltyPreviewPanel from './components/LoyaltyPreviewPanel';
import {
  useGetLoyaltyProgramQuery, useNextLoyaltyProgramCodeQuery, useCreateLoyaltyProgramMutation, useUpdateLoyaltyProgramMutation,
} from '../../api/loyaltyApi';
import {
  createLoyaltyProgramSchema, createLoyaltyProgramDefaultValues,
  STATUS_OPTIONS, EARN_POINTS_ON_OPTIONS, POINTS_TYPE_OPTIONS, REDEMPTION_TYPE_OPTIONS,
  APPLY_ON_OPTIONS, MEMBERSHIP_VALIDITY_OPTIONS, POINTS_EXPIRY_OPTIONS,
} from './createLoyaltyProgramSchema';

/** Builds react-hook-form default values from a real LoyaltyProgram row (as
 * returned by GET /api/loyalty-programs/:id) — the backend stores the raw
 * option values directly (not display labels), so every select field can be
 * prefilled as-is; numeric fields come back as numbers/Decimals and are
 * stringified for the text fields that hold them. */
function programToFormValues(program) {
  return {
    ...createLoyaltyProgramDefaultValues,
    programName: program.name,
    description: program.description || '',
    status: program.status,
    earnPointsOn: program.earnPointsOn,
    pointsType: program.pointsType,
    pointsValue: String(program.pointsValue ?? '0'),
    redemptionType: program.redemptionType,
    redemptionValue: String(program.redemptionValue ?? '0'),
    minimumPointsRequired: String(program.minimumPointsRequired ?? '0'),
    maximumDiscountPerTransaction: String(program.maximumDiscountPerTransaction ?? '0'),
    applyOn: program.applyOn,
    membershipValidity: program.membershipValidity,
    validityPeriodMonths: String(program.validityPeriodMonths ?? '0'),
    pointsExpiry: program.pointsExpiry,
    welcomePointsEnabled: Boolean(program.welcomePointsEnabled),
    welcomePointsValue: String(program.welcomePointsValue ?? '0'),
    allowPointsRedemption: Boolean(program.allowPointsRedemption),
    showLoyaltyDetailsInInvoice: Boolean(program.showLoyaltyDetailsInInvoice),
    allowNegativePoints: Boolean(program.allowNegativePoints),
    pointsExpiryNotification: Boolean(program.pointsExpiryNotification),
  };
}

/** Converts the form's string-based values back into the types the backend
 * expects (real numbers instead of strings), so the payload sent to
 * POST/PUT /api/loyalty-programs matches loyalty.schema.js exactly. */
function formValuesToPayload(values) {
  return {
    programName: values.programName,
    description: values.description || '',
    status: values.status,
    earnPointsOn: values.earnPointsOn,
    pointsType: values.pointsType,
    pointsValue: Number(values.pointsValue || 0),
    redemptionType: values.redemptionType,
    redemptionValue: Number(values.redemptionValue || 0),
    minimumPointsRequired: Number(values.minimumPointsRequired || 0),
    maximumDiscountPerTransaction: Number(values.maximumDiscountPerTransaction || 0),
    applyOn: values.applyOn,
    membershipValidity: values.membershipValidity,
    validityPeriodMonths: Number(values.validityPeriodMonths || 0),
    pointsExpiry: values.pointsExpiry,
    welcomePointsEnabled: values.welcomePointsEnabled,
    welcomePointsValue: Number(values.welcomePointsValue || 0),
    allowPointsRedemption: values.allowPointsRedemption,
    showLoyaltyDetailsInInvoice: values.showLoyaltyDetailsInInvoice,
    allowNegativePoints: values.allowNegativePoints,
    pointsExpiryNotification: values.pointsExpiryNotification,
  };
}

/**
 * "Create Loyalty Program" screen, also doubling as the Edit Loyalty
 * Program page when reached via `/loyalty/edit/:id` — fully wired to the
 * backend: creating or updating a program here actually writes to the
 * LoyaltyProgram table (see backend/src/modules/loyalty), with the same
 * validations enforced again server-side so a request built outside this
 * form can never bypass them.
 */
export default function CreateLoyaltyProgramPage({ id: propId, onBack }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const id = propId ?? paramId;
  const isEditMode = Boolean(id);
  const { data: existingProgram, isLoading: isLoadingExisting, isError: loadError } = useGetLoyaltyProgramQuery(id, { skip: !isEditMode });
  const nextCode = useNextLoyaltyProgramCodeQuery(undefined, { skip: isEditMode });
  const [createLoyaltyProgram, { isLoading: isCreating }] = useCreateLoyaltyProgramMutation();
  const [updateLoyaltyProgram, { isLoading: isUpdating }] = useUpdateLoyaltyProgramMutation();
  const isSaving = isCreating || isUpdating;
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);

  const methods = useForm({
    resolver: zodResolver(createLoyaltyProgramSchema),
    defaultValues: createLoyaltyProgramDefaultValues,
    mode: 'onTouched',
  });
  const { watch, reset, handleSubmit } = methods;
  const welcomePointsEnabled = watch('welcomePointsEnabled');

  // The edit-mode fetch is async, so the form can't be seeded via
  // useForm's defaultValues (that only runs once, before the data exists) —
  // reset() re-seeds every field once the real program row arrives.
  useEffect(() => {
    if (existingProgram) reset(programToFormValues(existingProgram));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingProgram]);

  const handleBack = () => {
    if (onBack) return onBack();
    if (isEditMode) return navigate(`/loyalty/view/${id}`);
    navigate('/loyalty');
  };

  const onSubmit = async (values) => {
    const payload = formValuesToPayload(values);
    try {
      const saved = isEditMode
        ? await updateLoyaltyProgram({ id, ...payload }).unwrap()
        : await createLoyaltyProgram(payload).unwrap();

      dispatch(showToast(isEditMode ? `Loyalty program ${saved.code} updated successfully` : `Loyalty program ${saved.code} created successfully`, 'success'));
      if (onBack) onBack(saved.id);
      else if (isEditMode) navigate(`/loyalty/view/${saved.id}`);
      else navigate('/loyalty');
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to save the loyalty program', 'error'));
    }
  };

  const handleProgramList = () => dispatch(showToast('Loyalty Program List is coming soon', 'info'));
  const handleCancel = handleBack;
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  if (isEditMode && isLoadingExisting) {
    return (
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading loyalty program…</Typography>
      </Stack>
    );
  }

  if (isEditMode && (loadError || !existingProgram)) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Loyalty program not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={() => navigate('/loyalty')} sx={{ width: 'fit-content' }}>
          Back to Loyalty List
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Loyalty Program</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/loyalty" underline="hover" color="text.secondary">Loyalty</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{isEditMode ? `Edit ${existingProgram?.code || ''}` : 'Create Loyalty Program'}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack}>
            Back
          </Button>
          {!isEditMode && (
            <Button variant="outlined" color="inherit" startIcon={<ListOutlinedIcon fontSize="small" />} onClick={handleProgramList}>
              Loyalty Program List
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
            <MenuItem onClick={() => handleMoreAction('Export Programs')}>Export Programs</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Bulk Deactivate')}>Bulk Deactivate</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Loyalty Settings')}>Loyalty Settings</MenuItem>
          </Menu>
        </Stack>
      </Stack>

      <FormProvider {...methods}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Grid size={{ xs: 12, lg: 7 }}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2.5, sm: 3 } }}>
                <Stack spacing={3.5}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{isEditMode ? `Edit Loyalty Program (${existingProgram?.code || ''})` : 'Create Loyalty Program'}</Typography>

                  <LoyaltyFormSection number={1} title="Program Information">
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormTextField name="programName" label="Program Name *" placeholder="Enter program name" />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Program Code"
                          value={isEditMode ? (existingProgram?.code || '') : (nextCode.data || 'Generating…')}
                          disabled
                          fullWidth
                          slotProps={{ input: { readOnly: true } }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormTextField name="description" label="Description" placeholder="Enter description (optional)" />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormSelect name="status" label="Status" options={STATUS_OPTIONS} />
                      </Grid>
                    </Grid>
                  </LoyaltyFormSection>

                  <LoyaltyFormSection number={2} title="Earning Rules">
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormSelect name="earnPointsOn" label="Earn Points On *" options={EARN_POINTS_ON_OPTIONS} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormSelect name="pointsType" label="Points Type *" options={POINTS_TYPE_OPTIONS} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormTextField name="pointsValue" label="Points Value *" placeholder="0" />
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                          Enter points value
                        </Typography>
                      </Grid>
                      <Grid size={12}>
                        <Alert severity="info" icon={<InfoOutlinedIcon fontSize="small" />} sx={{ bgcolor: '#EAF3FC', color: 'text.primary', '& .MuiAlert-icon': { color: '#2563EB' } }}>
                          Example: Earn 1 Point for every ₹100 spent
                        </Alert>
                      </Grid>
                    </Grid>
                  </LoyaltyFormSection>

                  <LoyaltyFormSection number={3} title="Redemption Rules">
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormSelect name="redemptionType" label="Redemption Type *" options={REDEMPTION_TYPE_OPTIONS} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormTextField name="redemptionValue" label="Redemption Value *" placeholder="0.00" />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormTextField name="minimumPointsRequired" label="Minimum Points Required *" placeholder="0" />
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                          Points needed for redemption
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormTextField name="maximumDiscountPerTransaction" label="Maximum Discount per Transaction (₹)" placeholder="0.00" />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormSelect name="applyOn" label="Apply On *" options={APPLY_ON_OPTIONS} />
                      </Grid>
                    </Grid>
                  </LoyaltyFormSection>

                  <LoyaltyFormSection number={4} title="Validity">
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormSelect name="membershipValidity" label="Membership Validity *" options={MEMBERSHIP_VALIDITY_OPTIONS} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormTextField name="validityPeriodMonths" label="Validity Period (in Months)" placeholder="0" />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormSelect name="pointsExpiry" label="Points Expiry" options={POINTS_EXPIRY_OPTIONS} />
                      </Grid>
                    </Grid>
                  </LoyaltyFormSection>

                  <LoyaltyFormSection number={5} title="Additional Settings">
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, md: 4 }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                        <Box>
                          <FormCheckbox name="welcomePointsEnabled" label={<Typography variant="body2">Welcome Points</Typography>} />
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', pl: 4 }}>
                            Points given on enrollment
                          </Typography>
                        </Box>
                        <Box sx={{ width: 110, pt: 0.5 }}>
                          <FormTextField name="welcomePointsValue" label="" placeholder="0" disabled={!welcomePointsEnabled} size="small" />
                        </Box>
                      </Stack>
                      <Stack spacing={1}>
                        <FormCheckbox name="allowPointsRedemption" label={<Typography variant="body2">Allow Points Redemption</Typography>} />
                        <FormCheckbox name="showLoyaltyDetailsInInvoice" label={<Typography variant="body2">Show Loyalty Details in Invoice</Typography>} />
                        <FormCheckbox name="allowNegativePoints" label={<Typography variant="body2">Allow Negative Points</Typography>} />
                      </Stack>
                    </Stack>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <FormCheckbox name="pointsExpiryNotification" label={<Typography variant="body2">Points Expiry Notification</Typography>} />
                      <Tooltip title="Notify customers before their points expire.">
                        <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      </Tooltip>
                    </Stack>
                  </LoyaltyFormSection>

                  <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end', pt: 1 }}>
                    <Button variant="outlined" color="inherit" onClick={handleCancel} disabled={isSaving}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={isSaving}>
                      {isSaving ? 'Saving…' : (isEditMode ? 'Update Program' : 'Save Program')}
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, lg: 5 }}>
              <LoyaltyPreviewPanel />
            </Grid>
          </Grid>
        </Box>
      </FormProvider>
    </Stack>
  );
}
