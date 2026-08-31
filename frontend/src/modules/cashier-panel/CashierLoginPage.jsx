import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Tabs, Tab,
  TextField, InputAdornment, IconButton, Button, Divider, Checkbox, FormControlLabel,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';

import CashierLoginInstructions from './components/CashierLoginInstructions';
import CashierLoginOutletInfo from './components/CashierLoginOutletInfo';
import { SHIFT, LOGIN_OUTLET } from './cashierPanelMockData';

/**
 * Cashier Login — the standalone cashier-code-and-password (or PIN)
 * gate reached from the Cashier Panel's "Cashier Login" quick action.
 * Matches the reference's three-column layout (Instructions / Login
 * card / Outlet Information) plus a full-width Security Notice banner.
 *
 * There's no cashier-account backend yet, so submitting either tab just
 * surfaces a toast and returns to the Cashier Panel — this screen exists
 * to match the reference UI, not to gate real access.
 */
export default function CashierLoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [tab, setTab] = useState('password');
  const [cashierCode, setCashierCode] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleBack = () => navigate('/cashier-panel');
  const handleForgotPassword = () => dispatch(showToast('Forgot Password is coming soon', 'info'));

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(showToast(`Welcome, Cashier ${cashierCode || SHIFT.cashier}!`, 'success'));
    handleBack();
  };
  const handlePinLogin = (e) => {
    e.preventDefault();
    dispatch(showToast('Login with PIN is coming soon', 'info'));
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Cashier Login</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/cashier-panel" underline="hover" color="text.secondary">Cashier Panel</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Cashier Login</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1.5} divider={<Divider orientation="vertical" flexItem />} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#2563EB' }}>Date : {SHIFT.openedDate}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#2563EB' }}>Time : {SHIFT.openedAt}</Typography>
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
          <CashierLoginInstructions />
        </Grid>

        <Grid size={{ xs: 12, md: 8, lg: 6 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2.5, sm: 3 }, height: '100%' }}>
            <Stack spacing={0.75} sx={{ alignItems: 'center', textAlign: 'center', mb: 2.5 }}>
              <Box
                sx={{
                  width: 56, height: 56, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: 'rgba(37,99,235,0.1)', color: '#2563EB', mb: 0.5,
                }}
              >
                <PersonOutlinedIcon fontSize="medium" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Cashier Login</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Please login to continue</Typography>
            </Stack>

            <Tabs
              value={tab}
              onChange={(_e, v) => setTab(v)}
              variant="fullWidth"
              sx={{
                mb: 3,
                minHeight: 40,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontWeight: 700, fontSize: 14.5 },
              }}
            >
              <Tab value="password" label="Password Login" />
              <Tab value="pin" label="PIN Login" />
            </Tabs>

            {tab === 'password' ? (
              <Box component="form" onSubmit={handleLogin} noValidate>
                <Stack spacing={2.25}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Cashier Code <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                    </Typography>
                    <TextField
                      fullWidth
                      value={cashierCode}
                      onChange={(e) => setCashierCode(e.target.value)}
                      placeholder="Enter Cashier Code"
                      slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> } }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Password <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                    </Typography>
                    <TextField
                      fullWidth
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter Password"
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start"><LockOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment>,
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Box>

                  <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <FormControlLabel
                      control={<Checkbox size="small" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />}
                      label={<Typography variant="body2">Remember Me</Typography>}
                    />
                    <MuiLink component="button" type="button" variant="body2" underline="hover" onClick={handleForgotPassword} sx={{ fontWeight: 700 }}>
                      Forgot Password?
                    </MuiLink>
                  </Stack>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<LockOutlinedIcon fontSize="small" />}
                    sx={{ bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' } }}
                  >
                    Login
                  </Button>

                  <Divider>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>or</Typography>
                  </Divider>

                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    startIcon={<QrCode2OutlinedIcon fontSize="small" />}
                    sx={{ color: '#2563EB', borderColor: 'divider' }}
                    onClick={() => setTab('pin')}
                  >
                    Login with PIN
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Box component="form" onSubmit={handlePinLogin} noValidate>
                <Stack spacing={2.25}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      4-Digit PIN <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                    </Typography>
                    <TextField
                      fullWidth
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="Enter PIN"
                      inputMode="numeric"
                      slotProps={{ input: { startAdornment: <InputAdornment position="start"><QrCode2OutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> } }}
                    />
                  </Box>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<LockOutlinedIcon fontSize="small" />}
                    sx={{ bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' } }}
                  >
                    Login
                  </Button>
                </Stack>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 12, lg: 3 }}>
          <CashierLoginOutletInfo outlet={LOGIN_OUTLET} />
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, bgcolor: 'rgba(37,99,235,0.06)', border: 'none' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
          <Box
            sx={{
              width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: '#2563EB', color: '#fff',
            }}
          >
            <LockOutlinedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#1D4ED8' }}>Security Notice</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              This system is for authorized users only. All activities are monitored and recorded.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
}
