import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Stack, Typography, Button, Grid, TextField, MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

import { useAppDispatch } from '../../../../app/hooks';
import { showToast } from '../../../../features/ui/uiSlice';
import { PRODUCT_GROUP_OPTIONS, PRODUCT_TYPE_OPTIONS, BRAND_OPTIONS, UOM_OPTIONS } from '../productMockData';
import { useCreateProductMutation, useUpdateProductMutation } from '../../../../api/productApi';

const EMPTY_VALUES = {
  code: '', name: '', group: PRODUCT_GROUP_OPTIONS[0], brand: BRAND_OPTIONS[0], uom: UOM_OPTIONS[0],
  hsnSac: '', taxCode: '', salePrice: '', mrp: '', availableQty: '', status: 'Active',
};

/** Add/Edit dialog for the Product master, backed by the real Product API. */
export default function ProductFormDialog({ open, mode = 'add', initialValues, onClose }) {
  const dispatch = useAppDispatch();
  const [values, setValues] = useState(EMPTY_VALUES);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = mode === 'edit';

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();

  useEffect(() => {
    if (open) setValues(isEdit && initialValues ? { ...EMPTY_VALUES, ...initialValues } : EMPTY_VALUES);
  }, [open, isEdit, initialValues]);

  const setField = (field) => (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!values.name.trim()) {
      dispatch(showToast('Product name is required', 'error'));
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: values.name.trim(),
        group: values.group,
        brand: values.brand || undefined,
        uom: values.uom,
        hsnSac: values.hsnSac?.trim() || undefined,
        taxCode: values.taxCode?.trim() || undefined,
        salePrice: values.salePrice === '' ? 0 : Number(values.salePrice),
        mrp: values.mrp === '' ? 0 : Number(values.mrp),
        availableQty: values.availableQty === '' ? 0 : Number(values.availableQty),
        status: values.status === 'Active' ? 'ACTIVE' : 'INACTIVE',
      };

      if (isEdit) {
        await updateProduct({ id: values.id, ...payload }).unwrap();
        dispatch(showToast('Product updated successfully', 'success'));
      } else {
        await createProduct(payload).unwrap();
        dispatch(showToast('Product saved successfully', 'success'));
      }
      onClose?.();
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to save product', 'error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Inventory2OutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography sx={{ fontWeight: 800, fontSize: 17 }}>{isEdit ? 'Edit Product' : 'Add Product'}</Typography>
        </Stack>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit} noValidate>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Product Code *"
                value={isEdit ? values.code : 'Auto generated'}
                disabled
                fullWidth
                slotProps={{ input: { readOnly: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Product Name *" value={values.name} onChange={setField('name')} placeholder="Enter product name" fullWidth required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="Product Group" value={values.group} onChange={setField('group')} fullWidth>
                {PRODUCT_GROUP_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="Product Type" value={values.productType || PRODUCT_TYPE_OPTIONS[0]} onChange={setField('productType')} fullWidth>
                {PRODUCT_TYPE_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="Brand" value={values.brand} onChange={setField('brand')} fullWidth>
                {BRAND_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="UOM" value={values.uom} onChange={setField('uom')} fullWidth>
                {UOM_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="HSN / SAC" value={values.hsnSac} onChange={setField('hsnSac')} placeholder="Enter HSN/SAC code" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Tax Code" value={values.taxCode} onChange={setField('taxCode')} placeholder="e.g. GST 5%" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Sale Price (₹)" value={values.salePrice} onChange={setField('salePrice')} placeholder="0.00" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="MRP (₹)" value={values.mrp} onChange={setField('mrp')} placeholder="0.00" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Available Qty" value={values.availableQty} onChange={setField('availableQty')} placeholder="0" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="Status" value={values.status} onChange={setField('status')} fullWidth>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" color="inherit" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>{isEdit ? 'Update' : 'Save'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
