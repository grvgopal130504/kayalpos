import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Stack, Typography, Button, Grid, TextField, MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';

import { useAppDispatch } from '../../../../app/hooks';
import { showToast } from '../../../../features/ui/uiSlice';
import { BATCH_SERIAL_TYPE_OPTIONS, WAREHOUSE_OPTIONS } from '../batchSerialMockData';

const EMPTY_VALUES = {
  itemCode: '', itemName: '', number: '', type: BATCH_SERIAL_TYPE_OPTIONS[0], mfgDate: '', expiryDate: '',
  warehouse: WAREHOUSE_OPTIONS[0], qty: '', uom: 'PCS', status: 'Active',
};

/** Add/Edit dialog for the Batch/Serial master. No backend yet, so Save/Update just toasts and closes. */
export default function BatchSerialFormDialog({ open, mode = 'add', initialValues, onClose }) {
  const dispatch = useAppDispatch();
  const [values, setValues] = useState(EMPTY_VALUES);
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (open) setValues(isEdit && initialValues ? { ...EMPTY_VALUES, ...initialValues } : EMPTY_VALUES);
  }, [open, isEdit, initialValues]);

  const setField = (field) => (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(showToast(isEdit ? 'Batch/Serial updated successfully' : 'Batch/Serial saved successfully', 'success'));
    onClose?.();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <QrCode2OutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography sx={{ fontWeight: 800, fontSize: 17 }}>{isEdit ? 'Edit Batch / Serial' : 'Add Batch / Serial'}</Typography>
        </Stack>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit} noValidate>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Item Code *" value={values.itemCode} onChange={setField('itemCode')} placeholder="Enter item code" fullWidth required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Item Name *" value={values.itemName} onChange={setField('itemName')} placeholder="Enter item name" fullWidth required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Batch / Serial No. *" value={values.number} onChange={setField('number')} placeholder="Enter batch/serial number" fullWidth required disabled={isEdit} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="Batch / Serial Type" value={values.type} onChange={setField('type')} fullWidth>
                {BATCH_SERIAL_TYPE_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Manufacturing Date" value={values.mfgDate} onChange={setField('mfgDate')} placeholder="dd-mm-yyyy" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Expiry Date" value={values.expiryDate} onChange={setField('expiryDate')} placeholder="dd-mm-yyyy" fullWidth disabled={values.type === 'Serial'} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="Warehouse / Outlet" value={values.warehouse} onChange={setField('warehouse')} fullWidth>
                {WAREHOUSE_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Available Qty" value={values.qty} onChange={setField('qty')} placeholder="0.00" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="UOM" value={values.uom} onChange={setField('uom')} placeholder="e.g. PCS" fullWidth />
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
