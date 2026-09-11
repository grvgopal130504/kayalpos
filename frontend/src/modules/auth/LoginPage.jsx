import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  Link,
  Divider,
  InputAdornment,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PinIcon from '@mui/icons-material/Pin';

import { useAppDispatch } from '../../app/hooks';
import { useLoginMutation } from '../../api/authApi';
import { setCredentials } from '../../features/auth/authSlice';
import { showToast } from '../../features/ui/uiSlice';
import FormTextField from '../../components/form/FormTextField';
import FormPasswordField from '../../components/form/FormPasswordField';
import FormSelect from '../../components/form/FormSelect';
import FormCheckbox from '../../components/form/FormCheckbox';
import AppLogo from '../../components/common/AppLogo';
import HealthStatusTag from '../../components/common/HealthStatusTag';
import { useHealthStatus } from '../../hooks/useHealthStatus';
import { useGetPublicOutletsQuery } from '../../api/outletApi';
import { loginSchema, loginDefaultValues } from './loginSchema';
import LoginMarketingPanel from './components/LoginMarketingPanel';

const APP_VERSION = '1.0.0';
const TENANT_NAME = 'Kayal Agro Foods'; // TODO: replace with tenant context once multi-tenant lookup exists

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [serverError, setServerError] = useState(null);
  const { status: healthStatus, services: healthServices } = useHealthStatus();
  const { data: outlets = [], isLoading: outletsLoading } = useGetPublicOutletsQuery();
  const outletOptions = outlets.map((outlet) => ({ value: outlet.id, label: outlet.name }));

  const methods = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: loginDefaultValues,
    // A field only shows its error once the user has focused it and left
    // (first blur), then revalidates live as they fix it — avoids flashing
    // "required" errors before the user has even reached a field.
    mode: 'onTouched',
  });

  // Login button stays disabled until every field has a value — separate
  // from the onTouched error display above, which only shows messages
  // after a field is visited. Watched directly (not via formState.isValid)
  // so it reflects raw field values ("is anything typed") rather than full
  // schema validity, which shouldn't gate the button on username/password
  // format the backend already checks.
  const [watchedUsername, watchedPassword, watchedOutletId] = useWatch({
    control: methods.control,
    name: ['username', 'password', 'outletId'],
  });
  const allFieldsFilled = Boolean(watchedUsername?.trim()) && Boolean(watchedPassword) && Boolean(watchedOutletId);

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      const result = await login({
        username: values.username,
        password: values.password,
        outletId: values.outletId,
      }).unwrap();

      dispatch(setCredentials(result, values.rememberMe));
      dispatch(showToast(`Welcome back, ${result.user.name}!`, 'success'));
      navigate('/home', { replace: true });
    } catch (err) {
      setServerError(err?.data?.message || 'Unable to sign in. Please try again.');
    }
  };

  const handleComingSoon = (feature) => {
    dispatch(showToast(`${feature} is coming soon`, 'info'));
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      {/* Left half — full-bleed branded panel. Hidden on phones/small tablets,
          where the form takes the whole screen instead. */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, flex: 1, minWidth: 0 }}>
        <LoginMarketingPanel />
      </Box>

      {/* Right half — login form. Fixed, comfortable column on desktop so the
          fields never stretch to an unusable width on ultrawide monitors. */}
      <Box
        sx={{
          width: { xs: '100%', md: '46%', lg: '43%', xl: '40%' },
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, sm: 4, md: 5 },
          py: 3,
          overflowY: 'auto',
        }}
      >
          <Paper
            elevation={3}
            sx={{
              width: '100%',
              maxWidth: { xs: 420, xl: 460 },
              p: { xs: 3, sm: 4 },
              borderRadius: 4,
            }}
          >
            <Stack spacing={2.5}>
              <Stack spacing={1.25} sx={{ alignItems: 'center' }}>
                <AppLogo iconSize={40} titleFontSize="1.2rem" subtitleFontSize="0.64rem" />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Welcome to <Box component="span" sx={{ color: 'primary.main' }}>Nexora</Box> POS
                  </Typography>
                  <Box sx={{ width: 52, height: 3, bgcolor: 'primary.main', borderRadius: 1, mx: 'auto', mt: 0.75 }} />
                  <Typography variant="body2" sx={{ mt: 0.75, fontWeight: 600, color: 'text.secondary' }}>
                    {TENANT_NAME}
                  </Typography>
                </Box>
              </Stack>

              <FormProvider {...methods}>
                <Box component="form" onSubmit={methods.handleSubmit(onSubmit)} noValidate>
                  <Stack spacing={1.75}>
                    {serverError && (
                      <Typography variant="body2" color="error" role="alert">
                        {serverError}
                      </Typography>
                    )}

                    <FormTextField
                      name="username"
                      label="Username"
                      autoComplete="username"
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonOutlineIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />

                    <FormPasswordField
                      name="password"
                      label="Password"
                      autoComplete="current-password"
                    />

                    <FormSelect
                      name="outletId"
                      label="Select Outlet"
                      options={outletOptions}
                      disabled={outletsLoading}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <StorefrontIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />

                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <FormCheckbox
                        name="rememberMe"
                        label={<Typography variant="body2">Remember me</Typography>}
                      />
                      <Link
                        component="button"
                        type="button"
                        variant="body2"
                        underline="hover"
                        onClick={() => handleComingSoon('Forgot password')}
                      >
                        Forgot Password?
                      </Link>
                    </Stack>

                    <Button type="submit" variant="contained" size="large" disabled={isLoading || !allFieldsFilled} fullWidth>
                      {isLoading ? 'Signing in…' : 'Login'}
                    </Button>

                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <HealthStatusTag status={healthStatus} services={healthServices} />
                    </Box>

                    <Divider>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        OR
                      </Typography>
                    </Divider>

                    <Button
                      variant="outlined"
                      size="large"
                      fullWidth
                      startIcon={<PinIcon />}
                      onClick={() => handleComingSoon('Login with PIN')}
                    >
                      Login with PIN
                    </Button>
                  </Stack>
                </Box>
              </FormProvider>

              <Typography variant="caption" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                Version {APP_VERSION}
              </Typography>
            </Stack>
          </Paper>
      </Box>
    </Box>
  );
}
