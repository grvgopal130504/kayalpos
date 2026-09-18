import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Stack, Box, Typography, Button, Grid, Breadcrumbs, Link as MuiLink,
  Paper, RadioGroup, FormControlLabel, Radio, TextField,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';
import FormTextField from '../../components/form/FormTextField';
import FormSelect from '../../components/form/FormSelect';
import FormSwitch from '../../components/form/FormSwitch';

import NewCustomerPreviewPanel from './components/NewCustomerPreviewPanel';
import {
  createCustomerSchema, createCustomerDefaultValues,
  CUSTOMER_TYPE_OPTIONS, GROUP_OPTIONS, PRICE_CATEGORY_OPTIONS,
  OPENING_BALANCE_TYPE_OPTIONS, SALES_REP_OPTIONS, TERRITORY_OPTIONS, SAVE_OPTION_VALUES,
} from './createCustomerSchema';
import { useGetCustomersQuery, useCreateCustomerMutation, useUpdateCustomerMutation } from '../../api/customerApi';

/**
 * Add New Customer form, also doubling as the Edit Customer page when
 * reached via `/customer/edit/:code`. Wired to the real Customer API:
 * editing prefills from the live record (looked up by code from the list
 * query, since the API's by-id lookup takes the database id, not the
 * display code) and Save/Update actually creates or updates the row.
 */
export default function AddNewCustomerPage({ code: propCode, onBack }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { code: paramCode } = useParams();
  const code = propCode ?? paramCode;
  const isEditMode = Boolean(code);

  const { data: customerRows = [], isLoading: customersLoading } = useGetCustomersQuery({});
  const existingRow = useMemo(() => customerRows.find((c) => c.code === code), [customerRows, code]);
  const existingCustomer = isEditMode ? existingRow : null;
  const [createCustomer] = useCreateCustomerMutation();
  const [updateCustomer] = useUpdateCustomerMutation();

  const methods = useForm({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: useMemo(() => (existingCustomer
      ? {
          ...createCustomerDefaultValues,
          customerName: existingCustomer.name,
          mobileNumber: existingCustomer.mobile,
          email: existingCustomer.email || '',
          gstin: existingCustomer.gstin || '',
          customerType: existingCustomer.customerType || '',
          group: existingCustomer.group || '',
          priceCategory: existingCustomer.priceCategory || '',
          creditLimit: String(existingCustomer.creditLimit ?? '0.00'),
          openingBalance: String(existingCustomer.openingBalance ?? '0.00'),
          openingBalanceType: existingCustomer.openingBalanceType || 'Cr',
          address: existingCustomer.address || '',
          salesRepresentative: existingCustomer.salesRepresentative || '',
          territory: existingCustomer.territory || '',
          activeCustomer: existingCustomer.status === 'ACTIVE',
          allowCreditSale: existingCustomer.allowCreditSale ?? true,
          priceInclusive: existingCustomer.priceInclusive ?? false,
          smsNotification: existingCustomer.smsNotification ?? true,
          notes: existingCustomer.notes || '',
        }
      : createCustomerDefaultValues), [existingCustomer]),
    mode: 'onTouched',
  });
  const { watch, setValue, handleSubmit } = methods;
  const saveOption = watch('saveOption');

  const onSubmit = async (values) => {
    const payload = {
      name: values.customerName.trim(),
      mobile: values.mobileNumber.trim(),
      email: values.email?.trim() || undefined,
      gstin: values.gstin?.trim() || undefined,
      customerType: values.customerType,
      group: values.group || undefined,
      priceCategory: values.priceCategory || undefined,
      creditLimit: values.creditLimit === '' ? 0 : Number(values.creditLimit),
      openingBalance: values.openingBalance === '' ? 0 : Number(values.openingBalance),
      openingBalanceType: values.openingBalanceType,
      address: values.address?.trim() || undefined,
      salesRepresentative: values.salesRepresentative || undefined,
      territory: values.territory || undefined,
      allowCreditSale: values.allowCreditSale,
      priceInclusive: values.priceInclusive,
      smsNotification: values.smsNotification,
      notes: values.notes?.trim() || undefined,
      status: values.activeCustomer ? 'ACTIVE' : 'INACTIVE',
    };

    try {
      let finalCode = code;
      if (isEditMode) {
        await updateCustomer({ id: existingRow.id, ...payload }).unwrap();
      } else {
        const created = await createCustomer(payload).unwrap();
        finalCode = created.code;
      }
      dispatch(showToast(isEditMode ? 'Customer updated successfully' : 'Customer saved successfully', 'success'));
      if (values.saveOption === 'close') {
        if (onBack) onBack(finalCode);
        else navigate(isEditMode ? `/customer/view/${finalCode}` : '/customer');
      }
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to save customer', 'error'));
    }
  };

  const handleBackToList = () => (onBack ? onBack() : navigate('/customer'));

  if (isEditMode && customersLoading) {
    return null;
  }

  if (isEditMode && !existingCustomer) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Customer not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBackToList} sx={{ width: 'fit-content' }}>
          Back to Customer List
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{isEditMode ? `Edit Customer — ${existingCustomer.code}` : 'Add New Customer'}</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/customer" underline="hover" color="text.secondary">Customer</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{isEditMode ? 'Edit Customer' : 'Add New Customer'}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBackToList}>
            Back to Customer List
          </Button>
          <Button variant="contained" startIcon={<SaveOutlinedIcon fontSize="small" />} onClick={handleSubmit(onSubmit)}>
            {isEditMode ? 'Update Customer' : 'Save Customer'}
          </Button>
        </Stack>
      </Stack>

      <FormProvider {...methods}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Grid size={{ xs: 12, lg: 7 }}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2.5, sm: 3 } }}>
                <Stack spacing={3.5}>
                  <Stack spacing={2}>
                    <Typography sx={{ fontWeight: 700, color: 'primary.main', fontSize: 14.5 }}>
                      Customer Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Customer Code *"
                          value={isEditMode ? existingCustomer.code : 'Auto generated'}
                          disabled
                          fullWidth
                          slotProps={{ input: { readOnly: true } }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormTextField name="customerName" label="Customer Name *" placeholder="Enter customer name" />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormTextField name="mobileNumber" label="Mobile Number *" placeholder="Enter mobile number" />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormTextField name="email" label="Email" placeholder="Enter email address" />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormTextField name="gstin" label="GSTIN (Optional)" placeholder="Enter GSTIN" />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormSelect name="customerType" label="Customer Type *" options={CUSTOMER_TYPE_OPTIONS} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormSelect name="group" label="Group" options={GROUP_OPTIONS} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormSelect name="priceCategory" label="Price Category" options={PRICE_CATEGORY_OPTIONS} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormTextField name="creditLimit" label="Credit Limit" placeholder="0.00" />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Stack direction="row" spacing={1}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <FormTextField name="openingBalance" label="Opening Balance" placeholder="0.00" />
                          </Box>
                          <Box sx={{ width: 90, flexShrink: 0 }}>
                            <FormSelect name="openingBalanceType" label="" options={OPENING_BALANCE_TYPE_OPTIONS} />
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid size={12}>
                        <FormTextField name="address" label="Address" placeholder="Enter address" multiline minRows={2} />
                      </Grid>
                    </Grid>
                  </Stack>

                  <Stack spacing={2}>
                    <Typography sx={{ fontWeight: 700, color: 'primary.main', fontSize: 14.5 }}>
                      Additional Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormSelect name="salesRepresentative" label="Sales Representative" options={SALES_REP_OPTIONS} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormSelect name="territory" label="Territory" options={TERRITORY_OPTIONS} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Stack spacing={1}>
                          <FormSwitch name="activeCustomer" label={<Typography variant="body2">Active Customer</Typography>} />
                          <FormSwitch name="allowCreditSale" label={<Typography variant="body2">Allow Credit Sale</Typography>} />
                        </Stack>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Stack spacing={1}>
                          <FormSwitch name="priceInclusive" label={<Typography variant="body2">Price Inclusive</Typography>} />
                          <FormSwitch name="smsNotification" label={<Typography variant="body2">SMS Notification</Typography>} />
                        </Stack>
                      </Grid>
                    </Grid>
                  </Stack>

                  <Stack spacing={1.5}>
                    <Typography sx={{ fontWeight: 700, color: 'primary.main', fontSize: 14.5 }}>
                      Save Options
                    </Typography>
                    <RadioGroup
                      row
                      value={saveOption}
                      onChange={(e) => setValue('saveOption', e.target.value, { shouldValidate: true })}
                      sx={{ flexWrap: 'wrap' }}
                    >
                      {SAVE_OPTION_VALUES.map((opt) => (
                        <FormControlLabel
                          key={opt.value}
                          value={opt.value}
                          control={<Radio size="small" />}
                          label={<Typography variant="body2">{opt.label}</Typography>}
                        />
                      ))}
                    </RadioGroup>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, lg: 5 }}>
              <NewCustomerPreviewPanel />
            </Grid>
          </Grid>
        </Box>
      </FormProvider>
    </Stack>
  );
}
