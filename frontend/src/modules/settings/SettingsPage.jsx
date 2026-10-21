import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Avatar, Button,
  ToggleButton, ToggleButtonGroup, TextField, MenuItem, Grid,
  Switch, FormControlLabel,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectCurrentUser } from '../../features/auth/authSlice';
import {
  selectThemeMode, setThemeMode,
  selectAccentThemeKey, setAccentTheme,
  selectSidebarFont, setSidebarFont,
  selectBodyFont, setBodyFont,
  selectSidebarFontStyle, toggleSidebarFontStyle,
  selectBodyFontStyle, toggleBodyFontStyle,
  selectLanguage, setLanguage,
  selectSidebarIconColorsEnabled, setSidebarIconColorsEnabled,
  selectSidebarAnimationsEnabled, setSidebarAnimationsEnabled,
  selectEmailButtonEnabled, setEmailButtonEnabled,
  selectWhatsappButtonEnabled, setWhatsappButtonEnabled,
  FONT_OPTIONS, LANGUAGE_OPTIONS,
} from '../../features/ui/uiSlice';
import { ACCENT_THEMES, accentCssBackground } from '../../theme/accentThemes';
import InfoCard from '../../components/common/InfoCard';
import TabsSettingsCard from './TabsSettingsCard';

function initials(name = '') {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function FontStyleToggles({ value, onToggle }) {
  return (
    <ToggleButtonGroup size="small" sx={{ flexShrink: 0 }}>
      <ToggleButton
        value="bold"
        selected={Boolean(value?.bold)}
        onClick={() => onToggle('bold')}
        sx={{ px: 1.25 }}
      >
        <FormatBoldIcon fontSize="small" />
      </ToggleButton>
      <ToggleButton
        value="italic"
        selected={Boolean(value?.italic)}
        onClick={() => onToggle('italic')}
        sx={{ px: 1.25 }}
      >
        <FormatItalicIcon fontSize="small" />
      </ToggleButton>
      <ToggleButton
        value="underline"
        selected={Boolean(value?.underline)}
        onClick={() => onToggle('underline')}
        sx={{ px: 1.25 }}
      >
        <FormatUnderlinedIcon fontSize="small" />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

function FontRow({ label, fontValue, onFontChange, styleValue, onStyleToggle }) {
  return (
    <Stack spacing={1}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{label}</Typography>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <TextField
          select
          size="small"
          value={fontValue}
          onChange={(e) => onFontChange(e.target.value)}
          sx={{ flex: 1, minWidth: 0 }}
        >
          {FONT_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </TextField>
        <FontStyleToggles value={styleValue} onToggle={onStyleToggle} />
      </Stack>
    </Stack>
  );
}

/**
 * Account/appearance preferences — Profile, Theme (accent color + light/dark
 * mode), Fonts (sidebar + body, each with a family picker and B/I/U style
 * toggles), Language, Email & WhatsApp (button toggles), and Tabs (a 1-10 "max open tabs" slider + a bulk close
 * action). Theme mode/accent, the fonts, and the tab limit all drive the
 * live app (see main.jsx/theme.js, Sidebar.jsx, and AppShell.jsx) via
 * uiSlice, so changes here apply immediately app-wide — lowering the tab
 * slider trims already-open tabs right away, not just future ones.
 */
export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);

  const themeMode = useAppSelector(selectThemeMode);
  const accentThemeKey = useAppSelector(selectAccentThemeKey);
  const sidebarFont = useAppSelector(selectSidebarFont);
  const bodyFont = useAppSelector(selectBodyFont);
  const sidebarFontStyle = useAppSelector(selectSidebarFontStyle);
  const bodyFontStyle = useAppSelector(selectBodyFontStyle);
  const language = useAppSelector(selectLanguage);
  const sidebarIconColorsEnabled = useAppSelector(selectSidebarIconColorsEnabled);
  const sidebarAnimationsEnabled = useAppSelector(selectSidebarAnimationsEnabled);
  const emailButtonEnabled = useAppSelector(selectEmailButtonEnabled);
  const whatsappButtonEnabled = useAppSelector(selectWhatsappButtonEnabled);

  const handleManageProfile = () => navigate('/settings/profile');

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Settings</Typography>
        <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
          <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Settings</Typography>
        </Breadcrumbs>
      </Box>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <InfoCard title="Profile">
            <Stack spacing={2} sx={{ height: '100%', justifyContent: 'space-between' }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, fontSize: 20, fontWeight: 700 }}>
                  {initials(user?.name) || 'A'}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                    {user?.name || 'Admin'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                    {user?.email || (user?.username ? `${user.username}@nexora.com` : 'admin@nexora.com')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                    {user?.username || (user?.role === 'SUPER_ADMIN' ? 'admin' : user?.role || '')}
                  </Typography>
                </Box>
              </Stack>
              <Box sx={{ textAlign: 'right' }}>
                <Button variant="outlined" size="small" onClick={handleManageProfile}>
                  Manage Profile
                </Button>
              </Box>
            </Stack>
          </InfoCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <InfoCard title="Theme">
            <Stack spacing={2.5}>
              <Stack spacing={1}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Color</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
                  {ACCENT_THEMES.map((accent) => {
                    const selected = accentThemeKey === accent.key;
                    return (
                      <Box
                        key={accent.key}
                        role="button"
                        aria-label={accent.label}
                        title={accent.label}
                        onClick={() => dispatch(setAccentTheme(accent.key))}
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          cursor: 'pointer',
                          background: accentCssBackground(accent),
                          outline: selected ? '2px solid' : 'none',
                          outlineColor: 'text.primary',
                          outlineOffset: '2px',
                          transition: (t) => t.transitions.create(['outline-offset']),
                        }}
                      />
                    );
                  })}
                </Box>
              </Stack>

              <Stack spacing={1}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Mode</Typography>
                <ToggleButtonGroup
                  exclusive
                  value={themeMode}
                  onChange={(e, value) => value && dispatch(setThemeMode(value))}
                  size="small"
                >
                  <ToggleButton value="light" sx={{ px: 2.5, textTransform: 'none' }}>Light Mode</ToggleButton>
                  <ToggleButton value="dark" sx={{ px: 2.5, textTransform: 'none' }}>Dark Mode</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            </Stack>
          </InfoCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <InfoCard title="Fonts">
            <Stack spacing={2.5}>
              <FontRow
                label="Sidebar font"
                fontValue={sidebarFont}
                onFontChange={(v) => dispatch(setSidebarFont(v))}
                styleValue={sidebarFontStyle}
                onStyleToggle={(key) => dispatch(toggleSidebarFontStyle(key))}
              />
              <FontRow
                label="Body font (dashboard & all pages)"
                fontValue={bodyFont}
                onFontChange={(v) => dispatch(setBodyFont(v))}
                styleValue={bodyFontStyle}
                onStyleToggle={(key) => dispatch(toggleBodyFontStyle(key))}
              />
            </Stack>
          </InfoCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <InfoCard title="Email & WhatsApp">
            <Stack spacing={1} sx={{ height: '100%', justifyContent: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={emailButtonEnabled}
                    onChange={(_, checked) => dispatch(setEmailButtonEnabled(checked))}
                  />
                }
                label="Enable Email"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={whatsappButtonEnabled}
                    onChange={(_, checked) => dispatch(setWhatsappButtonEnabled(checked))}
                  />
                }
                label="Enable WhatsApp"
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Show the Email and WhatsApp buttons on all pages that have them (Line Sale, Sales Return, ...). They stay hidden until enabled here.
              </Typography>
            </Stack>
          </InfoCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <InfoCard title="Language">
            <TextField
              select
              size="small"
              label="Language"
              value={language}
              onChange={(e) => dispatch(setLanguage(e.target.value))}
              fullWidth
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
          </InfoCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <InfoCard title="Tabs">
            <TabsSettingsCard />
          </InfoCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <InfoCard title="Sidebar Icons">
            <Stack spacing={1} sx={{ height: '100%', justifyContent: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={sidebarIconColorsEnabled}
                    onChange={(e) => dispatch(setSidebarIconColorsEnabled(e.target.checked))}
                  />
                }
                label="Unique icon colors"
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Show each sidebar menu with its own icon color. Turn off for single-tone icons.
              </Typography>
            </Stack>
          </InfoCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <InfoCard title="Sidebar Animation">
            <Stack spacing={1} sx={{ height: '100%', justifyContent: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={sidebarAnimationsEnabled}
                    onChange={(e) => dispatch(setSidebarAnimationsEnabled(e.target.checked))}
                  />
                }
                label="Menu animations"
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Play the 3D entrance and hover-tilt effects on sidebar menus. Turn off for instant, static rows.
              </Typography>
            </Stack>
          </InfoCard>
        </Grid>
      </Grid>
    </Stack>
  );
}
