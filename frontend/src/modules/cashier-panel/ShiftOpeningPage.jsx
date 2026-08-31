import { useMemo, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper,
  TextField, IconButton, InputAdornment, Button, Checkbox, FormControlLabel,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { showToast } from '../../features/ui/uiSlice';
import { DatePickerField } from '../../components/form/FormDatePicker';

import CashierStatCard from './components/CashierStatCard';
import ShiftOpeningDenominationTable from './components/ShiftOpeningDenominationTable';
import ShiftOpeningSummary from './components/ShiftOpeningSummary';
import { CASHIER, LOGIN_OUTLET, SHIFT_OPENING, DENOMINATIONS, SHIFT_TERMS } from './cashierPanelMockData';

function toNumber(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Shift Opening — the cash-drawer count screen reached from the Cashier
 * Panel's "Shift Opening" quick action. Matches the reference's 5-tile
 * status strip, Shift Details / Opening Cash Details (denomination count)
 * / Opening Summary+Notes+Attachments columns, and the closing Terms &
 * Conditions + Important Information + Cancel/Open Shift row.
 *
 * There's no shift backend yet, so Open Shift is mocked (toast + return
 * to Cashier Panel) — this screen exists to match the reference UI and
 * compute the denomination-count math live, not to gate real shift state.
 */
export default function ShiftOpeningPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [shiftDate, setShiftDate] = useState(SHIFT_OPENING.currentDateTime.split(' ')[0]);
  const [shiftNo, setShiftNo] = useState(SHIFT_OPENING.nextShiftNo);
  const [shiftName, setShiftName] = useState(SHIFT_OPENING.defaultShiftName);
  const [startTime, setStartTime] = useState(SHIFT_OPENING.defaultStartTime);
  const [endTime, setEndTime] = useState(SHIFT_OPENING.defaultEndTime);
  const [description, setDescription] = useState('');
  const [rows, setRows] = useState(DENOMINATIONS);
  const [notes, setNotes] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [agreed, setAgreed] = useState(false);

  const totalOpeningCash = useMemo(
    () => rows.reduce((sum, row) => sum + (row.unitValue != null ? row.unitValue * toNumber(row.pieces) : toNumber(row.amount)), 0),
    [rows],
  );

  const handleRowChange = (key, patch) => {
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const handleBack = () => navigate('/cashier-panel');
  const handleAddShiftNo = () => dispatch(showToast('Shift number picker is coming soon', 'info'));
  const handleAttachmentChange = (e) => setAttachmentName(e.target.files?.[0]?.name || '');
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleOpenShift = () => {
    if (!agreed) {
      dispatch(showToast('Please agree to the terms & conditions before opening the shift', 'error'));
      return;
    }
    dispatch(showToast(`Shift ${shiftNo} opened with ${totalOpeningCash.toFixed(2)} opening cash`, 'success'));
    handleBack();
  };

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
            Cashier : {CASHIER.name} ({CASHIER.code})
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

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <CashierStatCard label="Outlet" value={LOGIN_OUTLET.name} caption={LOGIN_OUTLET.code} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <CashierStatCard label="Cashier" value={`${CASHIER.name} (${CASHIER.code})`} caption="Cashier" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <CashierStatCard label="Current Date & Time" value={SHIFT_OPENING.currentDateTime} caption={SHIFT_OPENING.weekday} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <CashierStatCard label="Current Shift Status" value={SHIFT_OPENING.currentStatus} valueColor="error.main" caption={SHIFT_OPENING.currentStatusCaption} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <CashierStatCard label="Last Closed Shift" value={SHIFT_OPENING.lastClosed.date} caption={SHIFT_OPENING.lastClosed.caption} />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Shift Details</Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Shift Date *</Typography>
                <DatePickerField
                  value={shiftDate}
                  onChange={setShiftDate}
                />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Shift No *</Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                  <TextField fullWidth value={shiftNo} onChange={(e) => setShiftNo(e.target.value)} />
                  <IconButton onClick={handleAddShiftNo} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }} aria-label="Add shift number">
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Shift Name</Typography>
                <TextField fullWidth value={shiftName} onChange={(e) => setShiftName(e.target.value)} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Shift Start Time *</Typography>
                <TextField
                  fullWidth
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  slotProps={{ input: { endAdornment: <InputAdornment position="end"><CalendarTodayOutlinedIcon fontSize="small" /></InputAdornment> } }}
                />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Expected End Time</Typography>
                <TextField
                  fullWidth
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  slotProps={{ input: { endAdornment: <InputAdornment position="end"><CalendarTodayOutlinedIcon fontSize="small" /></InputAdornment> } }}
                />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Shift Description</Typography>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  placeholder="Enter description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 5 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Opening Cash Details</Typography>
            <ShiftOpeningDenominationTable rows={rows} onRowChange={handleRowChange} />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 12, lg: 4 }}>
          <Stack spacing={2}>
            <ShiftOpeningSummary totalOpeningCash={totalOpeningCash} previousClosingCash={SHIFT_OPENING.previousClosingCash} />

            <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Notes</Typography>
              <TextField
                fullWidth
                multiline
                minRows={3}
                placeholder="Enter notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
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
            <FormControlLabel
              control={<Checkbox size="small" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />}
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
            <Button variant="outlined" color="inherit" onClick={handleBack}>Cancel</Button>
            <Button
              variant="contained"
              startIcon={<LockOutlinedIcon fontSize="small" />}
              onClick={handleOpenShift}
              sx={{ bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' } }}
            >
              Open Shift
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
