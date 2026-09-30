import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { FormProvider, useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Button, Alert,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout, selectCurrentUser, selectActiveOutletId } from '../../features/auth/authSlice';
import { showToast } from '../../features/ui/uiSlice';
import FormTextField from '../../components/form/FormTextField';
import FormDatePicker from '../../components/form/FormDatePicker';
import FormCheckbox from '../../components/form/FormCheckbox';
import { useGetOutletQuery } from '../../api/outletApi';
import { useShiftSessionStatusQuery, useOpenShiftMutation } from '../../api/shiftSessionApi';

import CashierStatCard from './components/CashierStatCard';
import ShiftOpeningDenominationTable from './components/ShiftOpeningDenominationTable';
import ShiftOpeningSummary from './components/ShiftOpeningSummary';
import {
  shiftOpeningSchema, shiftOpeningDefaultValues, shiftOpeningFormValuesToPayload, computeTotalOpeningCash,
} from './shiftOpeningSchema';

const SHIFT_TERMS = [
  'Please count and verify opening cash before starting the shift.',
  'You will be responsible for the cash in hand during this shift.',
  'Ensure to close the shift at the end of the day.',
];

function formatDateOnly(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB');
}
function formatTimeOnly(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
function formatDateTime(iso) {
  if (!iso) return '—';
  return `${formatDateOnly(iso)} ${formatTimeOnly(iso)}`;
}

// Picks the single most useful validation message to surface in the
// catch-all toast below — in a sensible top-to-bottom reading order — so
// "Please fix the highlighted fields" always comes with the actual reason
// (e.g. "Total opening cash must be greater than zero") rather than making
// the cashier hunt for which field is red.
const ERROR_PRIORITY = ['shiftDate', 'shiftNo', 'startTime', 'endTime', 'denominations', 'agreedTerms'];
function firstErrorMessage(errors) {
  for (const key of ERROR_PRIORITY) {
    if (errors[key]?.message) return errors[key].message;
  }
  const anyKey = Object.keys(errors)[0];
  return errors[anyKey]?.message || 'Please fix the highlighted fields before opening the shift';
}

/**
 * Shift Opening — the cash-drawer count screen reached from the Cashier
 * Panel's "Shift Opening" quick action. Fully wired to the real backend
 * (see backend/src/modules/shift-session): the 5-tile status strip and the
 * live Shift No. preview come from GET /shift-sessions/status, and "Open
 * Shift" actually creates a ShiftSession row — with the same validations
 * (denomination total > 0, terms accepted, one open shift per outlet)
 * enforced again server-side, never trusted from the client alone.
 *
 * A shift already OPEN for this outlet blocks the form entirely (the real
 * POS rule: only one open shift per cash drawer at a time) — the page shows
 * that shift's details instead of a form nobody could submit successfully
 * anyway. Outlet/Cashier come from the logged-in session (authSlice), not
 * from mock data — there is no separate cashier-login backend yet, so the
 * cashier for the shift is whoever is authenticated into the main app (see
 * the "Cashier Login" discussion elsewhere in this app: it's a mid-shift
 * re-auth screen, not the real access gate).
 */
export default function ShiftOpeningPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const outletId = useAppSelector(selectActiveOutletId);
  const [attachmentName, setAttachmentName] = useState('');

  const { data: status, isLoading: isLoadingStatus, isError: isStatusError } = useShiftSessionStatusQuery();
  const { data: outlet } = useGetOutletQuery(outletId, { skip: !outletId });
  const [openShift, { isLoading: isOpening }] = useOpenShiftMutation();

  const currentShift = status?.currentShift ?? null;
  const isShiftOpen = Boolean(currentShift);

  const methods = useForm({
    resolver: zodResolver(shiftOpeningSchema),
    defaultValues: shiftOpeningDefaultValues(),
    mode: 'onTouched',
  });
  const {
    handleSubmit, control, reset, watch,
  } = methods;
  const { fields } = useFieldArray({ control, name: 'denominations' });
  const denominations = watch('denominations');
  const totalOpeningCash = useMemo(() => computeTotalOpeningCash(denominations), [denominations]);

  // Shift No. is a live preview of the real next number for this outlet —
  // can't be seeded via useForm's defaultValues since that only runs once,
  // before the status query resolves. reset() re-seeds it (and Start Time)
  // the moment the real status arrives, same pattern CreateStockCountPage
  // uses to seed its edit-mode form from an async fetch.
  useEffect(() => {
    if (status && !isShiftOpen) {
      reset(shiftOpeningDefaultValues({ shiftNo: status.nextShiftNo }));
    }
  }, [status, isShiftOpen, reset]);

  const handleBack = () => navigate('/cashier-panel');
  const handleAttachmentChange = (e) => setAttachmentName(e.target.files?.[0]?.name || '');
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const onOpenShift = handleSubmit(
    async (values) => {
      try {
        const payload = shiftOpeningFormValuesToPayload(values, { attachmentName });
        const created = await openShift(payload).unwrap();
        dispatch(showToast(
          `Shift ${created.shiftNo} opened with ₹${Number(created.openingCash).toFixed(2)} opening cash`,
          'success',
        ));
        handleBack();
      } catch (err) {
        dispatch(showToast(err?.data?.message || 'Failed to open the shift', 'error'));
      }
    },
    // Without this, a failed client-side validation (most commonly: every
    // denomination Pieces left at 0, so Total Opening Cash is ₹0.00 — or the
    // terms checkbox left unchecked) makes handleSubmit silently do nothing:
    // the invalid callback never ran, no request was ever sent, and nothing
    // on screen explained why clicking "Open Shift" appeared to do nothing.
    // firstErrorMessage() turns whatever failed into the actual reason,
    // rather than a generic "something's wrong, go find it" toast.
    (formErrors) => {
      dispatch(showToast(firstErrorMessage(formErrors), 'error'));
    },
  );

  const cashierLabel = user ? `${user.name}${user.username ? ` (${user.username})` : ''}` : '—';

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Shift Opening</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/cashier-panel" underline="hover" color="text.secondary">Cashier Panel</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Shift Opening</Typography>
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

      {isStatusError && (
        <Alert severity="error">Couldn't load shift status from the server. Check your connection and try reloading.</Alert>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <CashierStatCard label="Outlet" value={outlet?.name || '—'} caption={outlet?.code || ''} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <CashierStatCard label="Cashier" value={cashierLabel} caption="Cashier" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <CashierStatCard
            label="Current Date & Time"
            value={status ? formatDateTime(status.serverTime) : '—'}
            caption={status ? new Date(status.serverTime).toLocaleDateString('en-US', { weekday: 'long' }) : ''}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <CashierStatCard
            label="Current Shift Status"
            value={isShiftOpen ? 'OPEN' : 'CLOSED'}
            valueColor={isShiftOpen ? 'success.main' : 'error.main'}
            caption={isShiftOpen ? `Shift ${currentShift.shiftNo}` : 'No active shift'}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <CashierStatCard
            label="Last Closed Shift"
            value={status?.lastClosedShift ? formatDateOnly(status.lastClosedShift.closedAt) : '—'}
            caption={status?.lastClosedShift ? `Closed at ${formatTimeOnly(status.lastClosedShift.closedAt)}` : 'No shift closed yet'}
          />
        </Grid>
      </Grid>

      {isShiftOpen ? (
        <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2.5, sm: 3 } }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <Box
              sx={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: 'success.main', color: '#fff',
              }}
            >
              <InfoOutlinedIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Shift {currentShift.shiftNo} is already open
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                Opened {formatDateTime(currentShift.openedAt)} by {currentShift.cashierName} with an opening
                cash of ₹{Number(currentShift.openingCash).toFixed(2)}. Close this shift from Shift Closing
                before opening a new one.
              </Typography>
              <Button variant="contained" onClick={handleBack} sx={{ bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' } }}>
                Back to Cashier Panel
              </Button>
            </Box>
          </Stack>
        </Paper>
      ) : isLoadingStatus ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading shift status…</Typography>
      ) : (
        <FormProvider {...methods}>
          <Stack spacing={2} component="form" noValidate>
            <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Shift Details</Typography>
                  <Stack spacing={2}>
                    <FormDatePicker name="shiftDate" label="Shift Date *" />
                    <FormTextField name="shiftNo" label="Shift No *" disabled slotProps={{ input: { readOnly: true } }} />
                    <FormTextField name="shiftName" label="Shift Name" />
                    <FormTextField
                      name="startTime"
                      label="Shift Start Time *"
                      type="time"
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <FormTextField
                      name="endTime"
                      label="Expected End Time"
                      type="time"
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <FormTextField name="description" label="Shift Description" multiline minRows={3} placeholder="Enter description (optional)" />
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6, lg: 5 }}>
                <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Opening Cash Details</Typography>
                  <ShiftOpeningDenominationTable control={control} fields={fields} />
                  {methods.formState.errors.denominations?.message && (
                    <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mt: 1 }}>
                      {methods.formState.errors.denominations.message}
                    </Typography>
                  )}
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 12, lg: 4 }}>
                <Stack spacing={2}>
                  <ShiftOpeningSummary totalOpeningCash={totalOpeningCash} previousClosingCash={status?.previousClosingCash || 0} />

                  <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Notes</Typography>
                    <FormTextField name="notes" placeholder="Enter notes (optional)" multiline minRows={3} fullWidth />
                  </Paper>

                  <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Attachments</Typography>
                    <Button variant="outlined" color="inherit" component="label" sx={{ justifyContent: 'flex-start', width: { xs: '100%', sm: 'auto' } }}>
                      Choose File
                      <input type="file" hidden onChange={handleAttachmentChange} />
                    </Button>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                      {attachmentName || 'No file chosen'} &nbsp;(Max file size: 5MB)
                    </Typography>
                  </Paper>
                </Stack>
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Terms &amp; Conditions</Typography>
                  <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2.5, mb: 1.5 }}>
                    {SHIFT_TERMS.map((term) => (
                      <Typography key={term} component="li" variant="body2" sx={{ color: 'text.secondary' }}>
                        {term}
                      </Typography>
                    ))}
                  </Stack>
                  <FormCheckbox
                    name="agreedTerms"
                    label={<Typography variant="body2">I agree to the above terms &amp; conditions.</Typography>}
                  />
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 5 }}>
                <Paper sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, bgcolor: 'rgba(37,99,235,0.06)', border: 'none', height: '100%' }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: '#2563EB', color: '#fff',
                      }}
                    >
                      <InfoOutlinedIcon fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#1D4ED8' }}>Important Information</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Once you open the shift, you can start making sales.
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Stack direction="row" spacing={1.5} sx={{ justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                  <Button variant="outlined" color="inherit" onClick={handleBack} disabled={isOpening}>Cancel</Button>
                  <Button
                    variant="contained"
                    startIcon={<LockOutlinedIcon fontSize="small" />}
                    onClick={onOpenShift}
                    disabled={isOpening}
                    sx={{ bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' } }}
                  >
                    {isOpening ? 'Opening…' : 'Open Shift'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </FormProvider>
      )}
    </Stack>
  );
}
