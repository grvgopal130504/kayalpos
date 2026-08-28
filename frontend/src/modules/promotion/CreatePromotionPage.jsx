import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Stack, Box, Typography, Button, Menu, MenuItem, Grid, Breadcrumbs, Link as MuiLink,
  Paper, InputAdornment, IconButton, RadioGroup, FormControlLabel, Radio, Tooltip, TextField,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';
import FormTextField from '../../components/form/FormTextField';
import FormSelect from '../../components/form/FormSelect';
import FormCheckbox from '../../components/form/FormCheckbox';

import PromotionFormSection from './components/PromotionFormSection';
import PromotionPreviewPanel from './components/PromotionPreviewPanel';
import {
  createPromotionSchema, createPromotionDefaultValues,
  PROMOTION_TYPE_OPTIONS, APPLIES_TO_OPTIONS, DISCOUNT_TYPE_OPTIONS, DISCOUNT_UNIT_OPTIONS, MAXIMUM_USAGE_OPTIONS,
} from './createPromotionSchema';

export default function CreatePromotionPage({ embedded = false, onCreated, onCancel }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);

  const methods = useForm({
    resolver: zodResolver(createPromotionSchema),
    defaultValues: createPromotionDefaultValues,
    mode: 'onTouched',
  });
  const { watch, setValue, handleSubmit } = methods;
  const noExpiry = watch('noExpiry');
  const usageLimitEnabled = watch('usageLimitEnabled');
  const appliesTo = watch('appliesTo');

  const onSubmit = () => {
    dispatch(showToast('Promotion created as a draft', 'success'));
    if (embedded && onCreated) {
      onCreated();
    } else {
      navigate('/promotion/overview');
    }
  };

  const handleImport = () => dispatch(showToast('Import Promotion is coming soon', 'info'));
  const handleCancel = () => {
    if (embedded && onCancel) {
      onCancel();
    } else {
      navigate('/promotion');
    }
  };
  const handleSelectItems = () => dispatch(showToast('Item/category picker is coming soon', 'info'));
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  return (
    <Stack spacing={2}>
      {!embedded && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Promotion</Typography>
            <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
              <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
              <MuiLink component={RouterLink} to="/promotion" underline="hover" color="text.secondary">Promotion</MuiLink>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Create Promotion</Typography>
            </Breadcrumbs>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" color="inherit" startIcon={<FileUploadOutlinedIcon fontSize="small" />} onClick={handleImport}>
              Import Promotion
            </Button>
            <Button variant="contained" startIcon={<AddIcon />}>
              Create Promotion
            </Button>
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
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Create Promotion</Typography>

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
                        <FormTextField
                          name="startDate"
                          label="Start Date *"
                          slotProps={{
                            input: {
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton size="small"><CalendarTodayOutlinedIcon fontSize="small" /></IconButton>
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormTextField
                          name="endDate"
                          label="End Date *"
                          disabled={noExpiry}
                          slotProps={{
                            input: {
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton size="small" disabled={noExpiry}><CalendarTodayOutlinedIcon fontSize="small" /></IconButton>
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
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
                    <Button type="submit" variant="contained">Save Promotion</Button>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, lg: 5 }}>
              <PromotionPreviewPanel onSelectItems={handleSelectItems} />
            </Grid>
          </Grid>
        </Box>
      </FormProvider>
    </Stack>
  );
}
