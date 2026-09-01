import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Stack, Typography, Button, Grid, TextField, MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

import { useAppDispatch } from '../../../../app/hooks';
import { showToast } from '../../../../features/ui/uiSlice';
import { PRICE_LIST_TYPE_OPTIONS, APPLICABLE_TO_OPTIONS } from '../priceListMockData';

const EMPTY_VALUES = {
  code: '', name: '', type: PRICE_LIST_TYPE_OPTIONS[0], applicableTo: APPLICABLE_TO_OPTIONS[0],
  basePriceList: '', currency: 'INR', effectiveFrom: '', effectiveTo: '', status: 'Active',
};

/** Add/Edit dialog for the Price List master. No backend yet, so Save/Update just toasts and closes. */
export default function PriceListFormDialog({ open, mode = 'add', initialValues, onClose }) {
  const dispatch = useAppDispatch();
  const [values, setValues] = useState(EMPTY_VALUES);
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (open) setValues(isEdit && initialValues ? { ...EMPTY_VALUES, ...initialValues } : EMPTY_VALUES);
  }, [open, isEdit, initialValues]);

  const setField = (field) => (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(showToast(isEdit ? 'Price List updated successfully' : 'Price List saved successfully', 'success'));
    onClose?.();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <DescriptionOutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography sx={{ fontWeight: 800, fontSize: 17 }}>{isEdit ? 'Edit Price List' : 'Add Price List'}</Typography>
        </Stack>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit} noValidate>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Price List Code *"
                value={isEdit ? values.code : 'Auto generated'}
                onChange={setField('code')}
                disabled={!isEdit}
                fullWidth
                slotProps={{ input: { readOnly: !isEdit } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Price List Name *" value={values.name} onChange={setField('name')} placeholder="Enter price list name" fullWidth required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="Price List Type" value={values.type} onChange={setField('type')} fullWidth>
                {PRICE_LIST_TYPE_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="Applicable To" value={values.applicableTo} onChange={setField('applicableTo')} fullWidth>
                {APPLICABLE_TO_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Base Price List" value={values.basePriceList} onChange={setField('basePriceList')} placeholder="Enter base price list" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Currency" value={values.currency} onChange={setField('currency')} placeholder="e.g. INR" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Effective From" value={values.effectiveFrom} onChange={setField('effectiveFrom')} placeholder="dd-mm-yyyy" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Effective To" value={values.effectiveTo} onChange={setField('effectiveTo')} placeholder="dd-mm-yyyy" fullWidth />
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
