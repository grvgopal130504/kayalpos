import { useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Stack, Typography, Button, Grid, Box, CircularProgress,
} from '@mui/material';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CloseIcon from '@mui/icons-material/Close';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';

import { useAppDispatch } from '../../../../app/hooks';
import { showToast } from '../../../../features/ui/uiSlice';
import FormTextField from '../../../../components/form/FormTextField';
import FormSelect from '../../../../components/form/FormSelect';
import FormDatePicker from '../../../../components/form/FormDatePicker';
import ItemCodeAutocomplete from '../../../../components/form/ItemCodeAutocomplete';
import { useGetProductsQuery } from '../../../../api/productApi';
import { useGetWarehousesQuery } from '../../../../api/warehouseApi';
import {
  useCreateBatchSerialMutation, useUpdateBatchSerialMutation,
} from '../../../../api/batchSerialApi';
import {
  batchSerialFormSchema, batchSerialDefaultValues, batchSerialToFormValues, batchSerialFormValuesToPayload,
  TYPE_SELECT_OPTIONS, STATUS_OPTIONS,
} from '../batchSerialSchema';

/**
 * Add/Edit dialog for the Batch / Serial Number master, backed by the real
 * Batch/Serial API (see api/batchSerialApi.js) — react-hook-form + zod, same
 * compact-dialog shape as Brand/HSN-SAC/Price List (unlike Selling Price,
 * which moved to a full page because its calculator needed the room; this
 * form has no live calculation to show). Item Code is a real
 * ItemCodeAutocomplete bound to the Product master (matches Selling Price's
 * own item picker) and Warehouse/Outlet is a real dropdown from the
 * Warehouse master, not the old static WAREHOUSE_OPTIONS list. Selecting an
 * item auto-fills UOM from that product; picking "Serial" as the type
 * clears and disables Expiry Date and locks Quantity to 1, mirroring the
 * server-side rule in batchSerial.schema.js.
 */
export default function BatchSerialFormDialog({ open, mode = 'add', initialValues, onClose }) {
  const dispatch = useAppDispatch();
  const isEdit = mode === 'edit';

  const [createBatchSerial] = useCreateBatchSerialMutation();
  const [updateBatchSerial] = useUpdateBatchSerialMutation();

  const { data: products = [] } = useGetProductsQuery({}, { skip: !open });
  // Warehouse is an `isActive` boolean model (see warehouse.schema.js), not
  // a `status` enum like Product/PriceList — crudFactory's buildWhere reads
  // a separate `isActive` query param for exactly this shape (see its own
  // doc comment), so `status` would be silently wrong here.
  const { data: warehouses = [] } = useGetWarehousesQuery({ isActive: true }, { skip: !open });
  const warehouseOptions = warehouses.map((w) => ({ value: w.id, label: `${w.name} (${w.code})` }));

  const methods = useForm({
    resolver: zodResolver(batchSerialFormSchema),
    defaultValues: batchSerialDefaultValues,
    mode: 'onTouched',
  });
  const {
    handleSubmit, reset, setValue, control, formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (open) reset(isEdit && initialValues ? batchSerialToFormValues(initialValues) : batchSerialDefaultValues);
  }, [open, isEdit, initialValues, reset]);

  const type = useWatch({ control, name: 'type' });
  const isSerial = type === 'Serial';

  useEffect(() => {
    if (isSerial) {
      setValue('expiryDate', '', { shouldValidate: true });
      setValue('qty', '1', { shouldValidate: true });
    }
  }, [isSerial, setValue]);

  const handleSelectProduct = (product) => {
    setValue('productId', product.id, { shouldValidate: true, shouldDirty: true });
    setValue('uom', product.uom || '', { shouldValidate: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload = batchSerialFormValuesToPayload(values);
      if (isEdit) {
        await updateBatchSerial({ id: initialValues.id, ...payload }).unwrap();
        dispatch(showToast('Batch / Serial updated successfully', 'success'));
      } else {
        await createBatchSerial(payload).unwrap();
        dispatch(showToast('Batch / Serial saved successfully', 'success'));
      }
      onClose?.();
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to save batch / serial record', 'error'));
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <QrCode2OutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography sx={{ fontWeight: 800, fontSize: 17 }}>{isEdit ? 'Edit Batch / Serial' : 'Add Batch / Serial'}</Typography>
        </Stack>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit} noValidate>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid size={12}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  Item Code / Name *
                </Typography>
                <Box>
                  <ItemCodeAutocomplete
                    control={control}
                    name="productCode"
                    products={products}
                    onSelectProduct={handleSelectProduct}
                    placeholder="Search Item Code / Name"
                    disabled={isEdit}
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField name="number" label="Batch / Serial No. *" placeholder="Enter batch/serial number" disabled={isEdit} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect name="type" label="Batch / Serial Type" options={TYPE_SELECT_OPTIONS} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormDatePicker name="mfgDate" label="Manufacturing Date" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormDatePicker name="expiryDate" label="Expiry Date" disabled={isSerial} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect name="warehouseId" label="Warehouse / Outlet *" options={warehouseOptions} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField name="qty" label="Available Qty *" placeholder="0.00" disabled={isSerial} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField name="uom" label="UOM *" placeholder="e.g. PCS" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect name="status" label="Status *" options={STATUS_OPTIONS} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button variant="outlined" color="inherit" onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={14} /> : null}
            >
              {isEdit ? 'Update' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
}
