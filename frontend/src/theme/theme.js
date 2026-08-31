import { createTheme } from '@mui/material/styles';
import { getAccentTheme, DEFAULT_ACCENT_KEY } from './accentThemes';

// Palette sampled from the Nexora POS reference screens: orange brand
// accent, dark slate sidebar, light neutral background. `getTheme(mode,
// accentKey)` builds the same shape/typography/component overrides for
// either a 'light' or 'dark' MUI palette, with `primary` swapped in from
// the selected ACCENT_THEMES preset — so the whole app can switch both
// light/dark mode and accent color at runtime (see uiSlice's `themeMode` /
// `accentThemeKey` + Topbar's pickers).
const SHARED = {
  secondary: {
    main: '#1F2A3C',
  },
  success: { main: '#22A06B' },
  warning: { main: '#F5A623' },
  error: { main: '#E5484D' },
};

function buildPalette(mode, accentKey) {
  const accent = getAccentTheme(accentKey);
  // For a gradient preset there's no single "main" MUI can use for solid
  // surfaces (buttons, focus rings, links) — fall back to its first color.
  const primaryMain = accent.colors[0];

  return {
    mode,
    ...SHARED,
    primary: { main: primaryMain, contrastText: '#FFFFFF' },
    background: mode === 'dark'
      ? { default: '#12161F', paper: '#1A1F2B' }
      : { default: '#F5F6F8', paper: '#FFFFFF' },
    text: mode === 'dark'
      ? { primary: '#F3F4F6', secondary: '#9CA3AF' }
      : { primary: '#1F2A3C', secondary: '#6B7280' },
    divider: mode === 'dark' ? '#2B3141' : '#E5E7EB',
  };
}

export function getTheme(mode = 'light', accentKey = DEFAULT_ACCENT_KEY) {
  const isDark = mode === 'dark';
  const scrollbarThumb = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.22)';
  const scrollbarThumbHover = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';

  return createTheme({
    palette: buildPalette(mode === 'dark' ? 'dark' : 'light', accentKey),
    shape: {
      borderRadius: 10,
    },
    // MUI's default durations (standard: 300ms, etc.) read as too snappy for
    // this app's menus/drawers/popovers/tooltips — scaled up ~1.5x across
    // the board so open/close animations feel smoother instead of instant.
    transitions: {
      duration: {
        shortest: 220,
        shorter: 280,
        short: 320,
        standard: 400,
        complex: 480,
        enteringScreen: 320,
        leavingScreen: 260,
      },
    },
    typography: {
      fontFamily: ['"Inter"', '"Roboto"', '"Helvetica"', '"Arial"', 'sans-serif'].join(','),
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 8, paddingTop: 10, paddingBottom: 10 },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: 'medium',
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      // App-wide thin scrollbar — covers every scrollable table container,
      // the dashboard panels, etc. (the sidebar keeps its own copy of this
      // since it needs a fixed light-on-dark thumb regardless of mode).
      MuiCssBaseline: {
        styleOverrides: {
          '*': {
            scrollbarWidth: 'thin',
            scrollbarColor: `${scrollbarThumb} transparent`,
          },
          '*::-webkit-scrollbar': { width: 6, height: 6 },
          '*::-webkit-scrollbar-track': { background: 'transparent' },
          '*::-webkit-scrollbar-button': { display: 'none', height: 0, width: 0 },
          '*::-webkit-scrollbar-thumb': { backgroundColor: scrollbarThumb, borderRadius: 4 },
          '*::-webkit-scrollbar-thumb:hover': { backgroundColor: scrollbarThumbHover },
        },
      },
    },
  });
}

// Default export kept for any existing static imports — equivalent to
// getTheme('light', 'orange').
export const theme = getTheme('light', DEFAULT_ACCENT_KEY);
