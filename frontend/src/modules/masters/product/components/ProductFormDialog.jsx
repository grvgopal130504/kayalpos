import { useEffect, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Stack, Typography, Button, Grid, TextField, CircularProgress,
} from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CloseIcon from '@mui/icons-material/Close';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

import { useAppDispatch } from '../../../../app/hooks';
import { showToast } from '../../../../features/ui/uiSlice';
import FormTextField from '../../../../components/form/FormTextField';
import FormSelect from '../../../../components/form/FormSelect';
import { useGetBrandsQuery } from '../../../../api/brandApi';
import { useGetTaxCodesQuery } from '../../../../api/taxCodeApi';
import { useCreateProductMutation, useUpdateProductMutation, useNextProductCode } from '../../../../api/productApi';
import {
  createProductSchema, createProductDefaultValues, productToFormValues, productFormValuesToPayload,
  PRODUCT_GROUP_SELECT_OPTIONS, PRODUCT_TYPE_SELECT_OPTIONS, UOM_SELECT_OPTIONS, STATUS_OPTIONS,
  BRAND_PLACEHOLDER_OPTION, TAX_CODE_PLACEHOLDER_OPTION,
} from '../createProductSchema';

/**
 * Add/Edit dialog for the Product master, backed by the real Product API
 * (see api/productApi.js). Same react-hook-form + zod shape as the
 * Outlet/Warehouse detail pages (FormTextField/FormSelect + inline
 * per-field errors) rather than the older hand-rolled useState + one-toast
 * validation this dialog used to have — every field here is checked
 * against the same rules as the backend's createProductSchema
 * (product.schema.js) before the request ever leaves the browser. The
 * Brand dropdown is backed by the real Brand master (useGetBrandsQuery)
 * instead of a static list, though Product.brand itself stays a plain
 * name string (not a foreign key) — this app's Brand master has no other
 * consumer that needs a hard relation yet, and free text also means an
 * older/bulk-imported brand name that isn't in the Brand master can still
 * be edited without being silently reset.
 */
export default function ProductFormDialog({ open, mode = 'add', initialValues, onClose }) {
  const dispatch = useAppDispatch();
  const isEdit = mode === 'edit';

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  // Only fetched while the dialog is open in Add mode — skipped for Edit
  // (real code already known) and while closed.
  const nextCode = useNextProductCode(open && !isEdit);
  const { data: brands = [] } = useGetBrandsQuery(open ? { status: 'ACTIVE' } : undefined, { skip: !open });

  const brandOptions = useMemo(() => {
    const options = [BRAND_PLACEHOLDER_OPTION, ...brands.map((b) => ({ value: b.name, label: b.name }))];
    // Editing a row whose brand isn't in the current active Brand list
    // (renamed/deactivated brand, or a bulk-imported free-text value) —
    // keep it selectable so opening Edit never silently blanks the field.
    const existingBrand = isEdit ? initialValues?.brand : '';
    if (existingBrand && !options.some((o) => o.value === existingBrand)) {
      options.push({ value: existingBrand, label: existingBrand });
    }
    return options;
  }, [brands, isEdit, initialValues]);

  const { data: taxCodes = [] } = useGetTaxCodesQuery(open ? { status: 'ACTIVE' } : undefined, { skip: !open });

  const taxCodeOptions = useMemo(() => {
    const options = [TAX_CODE_PLACEHOLDER_OPTION, ...taxCodes.map((t) => ({ value: t.name, label: t.name }))];
    // Editing a product whose saved tax code isn't in the active Tax Code
    // list (renamed/deactivated, or bulk-imported text) — keep it selectable.
    const existingTaxCode = isEdit ? initialValues?.taxCode : '';
    if (existingTaxCode && !options.some((o) => o.value === existingTaxCode)) {
      options.push({ value: existingTaxCode, label: existingTaxCode });
    }
    return options;
  }, [taxCodes, isEdit, initialValues]);

  const methods = useForm({
    resolver: zodResolver(createProductSchema),
    defaultValues: createProductDefaultValues,
    mode: 'onTouched',
  });
  const { handleSubmit, reset, formState: { isSubmitting } } = methods;

  useEffect(() => {
    if (open) reset(isEdit && initialValues ? productToFormValues(initialValues) : createProductDefaultValues);
  }, [open, isEdit, initialValues, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload = productFormValuesToPayload(values);
      if (isEdit) {
        await updateProduct({ id: initialValues.id, ...payload }).unwrap();
        dispatch(showToast('Product updated successfully', 'success'));
      } else {
        await createProduct(payload).unwrap();
        dispatch(showToast('Product saved successfully', 'success'));
      }
      onClose?.();
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to save product', 'error'));
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Inventory2OutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography sx={{ fontWeight: 800, fontSize: 17 }}>{isEdit ? 'Edit Product' : 'Add Product'}</Typography>
        </Stack>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit} noValidate>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Product Code *"
                  value={isEdit ? (initialValues?.code || '') : (nextCode || 'Auto generated')}
                  disabled
                  fullWidth
                  slotProps={{ input: { readOnly: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField name="shortId" label="Short ID" placeholder="Enter short ID (unique)" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField name="name" label="Product Name *" placeholder="Enter product name" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect name="group" label="Product Group *" options={[{ value: '', label: 'Select Product Group', disabled: true }, ...PRODUCT_GROUP_SELECT_OPTIONS]} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect name="productType" label="Product Type" options={PRODUCT_TYPE_SELECT_OPTIONS} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect name="brand" label="Brand" options={brandOptions} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect name="uom" label="UOM *" options={[{ value: '', label: 'Select UOM', disabled: true }, ...UOM_SELECT_OPTIONS]} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField name="hsnSac" label="HSN / SAC" placeholder="Enter HSN/SAC code" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect name="taxCode" label="Tax Code" options={taxCodeOptions} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField name="salePrice" label="Sale Price (₹) *" placeholder="0.00" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField name="mrp" label="MRP (₹) *" placeholder="0.00" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField name="availableQty" label="Available Qty *" placeholder="0" numeric />
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
