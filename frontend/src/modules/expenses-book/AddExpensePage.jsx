import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Stack, Box, Typography, Button, Grid, Breadcrumbs, Link as MuiLink,
  Paper, TextField, InputAdornment,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CloseIcon from '@mui/icons-material/Close';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout, selectCurrentUser } from '../../features/auth/authSlice';
import { showToast } from '../../features/ui/uiSlice';
import FormTextField from '../../components/form/FormTextField';
import FormDatePicker from '../../components/form/FormDatePicker';
import FormSelect from '../../components/form/FormSelect';
import { useCreateExpenseMutation } from '../../api/expenseApi';

import ExpenseSummarySidebar from './components/ExpenseSummarySidebar';
import {
  createExpenseSchema, createExpenseDefaultValues, expenseFormValuesToPayload,
  CATEGORY_OPTIONS, PAYMENT_MODE_OPTIONS, COST_CENTER_OPTIONS, ACCOUNT_HEAD_OPTIONS, PROJECT_OPTIONS,
} from './createExpenseSchema';

function toNumber(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Total Amount field mirrors ExpenseSummarySidebar's computation
 * (Amount + Tax) but read-only, inline in the form itself, matching the
 * reference's greyed-out "Total Amount (₹)" field next to Tax (₹).
 */
function TotalAmountField() {
  const amount = toNumber(useWatch({ name: 'amount' }));
  const tax = toNumber(useWatch({ name: 'tax' }));
  return (
    <TextField
      label="Total Amount (₹) *"
      value={(amount + tax).toFixed(2)}
      disabled
      fullWidth
      slotProps={{
        input: {
          readOnly: true,
          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
        },
      }}
    />
  );
}

/**
 * "Add Expense" create-form screen, reached from the Expenses Book page's
 * "Add Expenses" button. Matches the reference's two-panel layout: a left
 * form (Expense Information + optional Accounting Information) and a
 * right sidebar (live Expense Summary + a local-only receipt/attachment
 * drop zone — there's no file-storage backend yet, so only the file's
 * name is sent and saved, same honest limitation the Expense model's own
 * comment calls out). Saving posts a real Expense row via
 * POST /expenses (see expense.service.js's createExpense) — the server
 * generates the real "EXP-YYMMDD-NNNN" reference number and recomputes
 * Total Amount itself, so nothing here is trusted from the client beyond
 * the raw entered fields.
 */
export default function AddExpensePage({ onBack }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const [attachmentName, setAttachmentName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [createExpense, { isLoading: isSaving }] = useCreateExpenseMutation();

  const methods = useForm({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: createExpenseDefaultValues,
    mode: 'onTouched',
  });
  const { handleSubmit, reset } = methods;

  const cashierLabel = user ? `${user.name}${user.username ? ` (${user.username})` : ''}` : '—';

  const handleBack = () => (onBack ? onBack() : navigate('/expenses-book'));
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleFile = (file) => setAttachmentName(file?.name || '');
  const handleFileInputChange = (e) => handleFile(e.target.files?.[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const submitExpense = async (values, { clearAfter } = {}) => {
    try {
      const payload = { ...expenseFormValuesToPayload(values), attachmentName: attachmentName || undefined };
      const saved = await createExpense(payload).unwrap();
      dispatch(showToast(`Expense ${saved.referenceNo} saved successfully`, 'success'));
      if (clearAfter) {
        reset(createExpenseDefaultValues);
        setAttachmentName('');
      } else {
        handleBack();
      }
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Could not save this expense. Please try again.', 'error'));
    }
  };

  const onSaveExpense = handleSubmit((values) => submitExpense(values));
  const onSaveAndAddNew = handleSubmit((values) => submitExpense(values, { clearAfter: true }));
  const onCancel = () => handleBack();

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Add Expense</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/expenses-book" underline="hover" color="text.secondary">Expense Book</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Add Expense</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#2563EB' }}>
            Cashier : {cashierLabel}
          </Typography>
          <MuiLink
            component="button"
            type="button"
            variant="body2"
            underline="hover"
            onClick={handleLogout}
            sx={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 0.5, color: '#2563EB' }}
          >
            <LogoutOutlinedIcon fontSize="inherit" /> Logout
          </MuiLink>
        </Stack>
      </Stack>

      <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
        <Button variant="outlined" color="inherit" startIcon={<ArrowBackIcon fontSize="small" />} onClick={handleBack}>
          Back to Expenses Book
        </Button>
      </Stack>

      <FormProvider {...methods}>
        <Stack spacing={2} component="form" noValidate>
          <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Expense Information</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormDatePicker
                      name="expenseDate"
                      label="Expense Date *"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Reference No."
                      value=""
                      placeholder="Auto generated"
                      disabled
                      fullWidth
                      slotProps={{ input: { readOnly: true } }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormSelect name="category" label="Category *" options={CATEGORY_OPTIONS} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormTextField
                      name="amount"
                      label="Amount (₹) *"
                      slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormTextField name="description" label="Description *" placeholder="Enter expense description" multiline minRows={2} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormTextField
                      name="tax"
                      label="Tax (₹)"
                      slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormSelect name="paymentMode" label="Payment Mode *" options={PAYMENT_MODE_OPTIONS} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TotalAmountField />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormTextField name="paidToVendor" label="Paid To / Vendor *" placeholder="Enter vendor name" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormTextField name="remarks" label="Remarks" placeholder="Enter remarks (optional)" multiline minRows={2} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <Stack spacing={2}>
                <ExpenseSummarySidebar />

                <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Upload Receipt / Attachment</Typography>
                  <Box
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    sx={{
                      border: '2px dashed',
                      borderColor: dragActive ? 'primary.main' : 'divider',
                      borderRadius: 2.5,
                      py: 4,
                      px: 2,
                      textAlign: 'center',
                      bgcolor: dragActive ? 'action.hover' : 'transparent',
                      transition: 'border-color 0.15s, background-color 0.15s',
                    }}
                  >
                    <FileUploadOutlinedIcon sx={{ fontSize: 34, color: 'primary.light' }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                      Drag &amp; drop files here
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>or</Typography>
                    <Box sx={{ mt: 1 }}>
                      <Button variant="outlined" color="inherit" component="label" size="small">
                        Choose File
                        <input type="file" hidden onChange={handleFileInputChange} />
                      </Button>
                    </Box>
                  </Box>
                  {attachmentName && (
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minWidth: 0 }}>
                        <DescriptionOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        <Typography variant="caption" noWrap title={attachmentName}>{attachmentName}</Typography>
                      </Stack>
                      <Button size="small" color="inherit" onClick={() => setAttachmentName('')} startIcon={<CloseIcon fontSize="small" />}>
                        Remove
                      </Button>
                    </Stack>
                  )}
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1.5 }}>
                    Allowed formats: JPG, PNG, PDF (Max 5MB) — only the file name is saved; the file itself is not
                    uploaded anywhere yet.
                  </Typography>
                </Paper>
              </Stack>
            </Grid>
          </Grid>

          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Accounting Information (Optional)</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormSelect name="costCenter" label="Cost Center" options={COST_CENTER_OPTIONS} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormSelect name="accountHead" label="Account Head" options={ACCOUNT_HEAD_OPTIONS} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormSelect name="project" label="Project" options={PROJECT_OPTIONS} />
              </Grid>
            </Grid>
          </Paper>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' } }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button variant="contained" color="primary" startIcon={<SaveOutlinedIcon fontSize="small" />} onClick={onSaveExpense} disabled={isSaving}>
                Save Expense
              </Button>
              <Button variant="outlined" color="inherit" startIcon={<CurrencyRupeeOutlinedIcon fontSize="small" />} onClick={onSaveAndAddNew} disabled={isSaving}>
                Save &amp; Add New
              </Button>
            </Stack>
            <Button variant="outlined" color="inherit" startIcon={<CloseIcon fontSize="small" />} onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </FormProvider>
    </Stack>
  );
}
