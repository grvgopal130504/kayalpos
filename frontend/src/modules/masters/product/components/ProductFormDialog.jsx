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

const EMPTY_VALUES = {
  code: '', name: '', group: PRODUCT_GROUP_OPTIONS[0], brand: BRAND_OPTIONS[0], uom: UOM_OPTIONS[0],
  hsnSac: '', taxCode: '', salePrice: '', mrp: '', availableQty: '', status: 'Active',
};

/**
 * Add/Edit dialog for the Product master. No Product backend module
 * exists yet, so Save/Update just toasts and closes (mirrors how the
 * mocked transaction-module forms behave) — this only wires up the UI
 * interaction, not real persistence.
 */
export default function ProductFormDialog({ open, mode = 'add', initialValues, onClose }) {
  const dispatch = useAppDispatch();
  const [values, setValues] = useState(EMPTY_VALUES);
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (open) setValues(isEdit && initialValues ? { ...EMPTY_VALUES, ...initialValues } : EMPTY_VALUES);
  }, [open, isEdit, initialValues]);

  const setField = (field) => (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(showToast(isEdit ? 'Product updated successfully' : 'Product saved successfully', 'success'));
    onClose?.();
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
                onChange={setField('code')}
                disabled={!isEdit}
                fullWidth
                slotProps={{ input: { readOnly: !isEdit } }}
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
          <Button type="submit" variant="contained">{isEdit ? 'Update' : 'Save'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
