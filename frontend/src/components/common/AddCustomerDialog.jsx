import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Stack, Box, Typography, Button, Grid, TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';

import FormTextField from '../form/FormTextField';
import FormSelect from '../form/FormSelect';
import FormSwitch from '../form/FormSwitch';
import {
  createCustomerSchema, createCustomerDefaultValues,
  CUSTOMER_TYPE_OPTIONS, GROUP_OPTIONS, PRICE_CATEGORY_OPTIONS,
} from '../../modules/customer/createCustomerSchema';
import { useNextCustomerCode, useCreateCustomerMutation } from '../../api/customerApi';
import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';

/**
 * Compact "Add New Customer" form rendered inside a Dialog instead of the
 * full /customer/create page — used anywhere a sale screen needs a new
 * customer on the fly (Line Sale's "Add Customer" shortcuts) without
 * leaving the bill in progress. Same schema/fields as AddNewCustomerPage,
 * minus the breadcrumbs, back-to-list button, and live preview panel.
 */
export default function AddCustomerDialog({ open, onClose, onCustomerCreated }) {
  const dispatch = useAppDispatch();
  // Only fetch the next-code preview while the dialog is actually open, same
  // gating AddNewCustomerPage uses for its own Customer Code field.
  const nextCode = useNextCustomerCode(open);
  const [createCustomer, { isLoading: isSaving }] = useCreateCustomerMutation();

  const methods = useForm({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: createCustomerDefaultValues,
    mode: 'onTouched',
  });
  const { handleSubmit, reset } = methods;

  const handleClose = () => {
    reset(createCustomerDefaultValues);
    onClose();
  };

  // Actually persists to the Customer table (same payload shape as
  // AddNewCustomerPage's onSubmit) instead of just handing a fake local
  // object back to the caller — otherwise a customer "added" here never
  // exists in the real list, so it can never be found again by search
  // (Line Sale's customer Autocomplete, the Customer module, etc).
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
      const created = await createCustomer(payload).unwrap();
      onCustomerCreated?.({
        id: created.id,
        code: created.code,
        name: created.name,
        phone: created.mobile,
        loyaltyPoints: created.loyaltyPoints || 0,
      });
      reset(createCustomerDefaultValues);
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to save customer', 'error'));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <PersonAddOutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography sx={{ fontWeight: 800, fontSize: 17 }}>Add New Customer</Typography>
        </Stack>
        <IconButton size="small" onClick={handleClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <FormProvider {...methods}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Customer Code *"
                  value={nextCode || 'Auto generated'}
                  disabled
                  fullWidth
                  slotProps={{ input: { readOnly: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField name="customerName" label="Customer Name *" placeholder="Enter customer name" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  name="mobileNumber"
                  label="Mobile Number *"
                  placeholder="10-digit mobile number"
                  numeric
                  maxLength={10}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField name="email" label="Email" placeholder="Enter email address" />
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
              <Grid size={12}>
                <FormTextField name="address" label="Address" placeholder="Enter address" multiline minRows={2} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSwitch name="activeCustomer" label={<Typography variant="body2">Active Customer</Typography>} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSwitch name="allowCreditSale" label={<Typography variant="body2">Allow Credit Sale</Typography>} />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button variant="outlined" color="inherit" onClick={handleClose} disabled={isSaving}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save Customer'}
            </Button>
          </DialogActions>
        </Box>
      </FormProvider>
    </Dialog>
  );
}
