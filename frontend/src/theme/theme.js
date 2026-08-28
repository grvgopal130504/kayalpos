import { createTheme } from '@mui/material/styles';

// Palette sampled from the Nexora POS reference screens: orange brand
// accent, dark slate sidebar, light neutral background.
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#F26B21',
      dark: '#D45A17',
      light: '#FF8A45',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#1F2A3C',
    },
    background: {
      default: '#F5F6F8',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1F2A3C',
      secondary: '#6B7280',
    },
    success: { main: '#22A06B' },
    warning: { main: '#F5A623' },
    error: { main: '#E5484D' },
    divider: '#E5E7EB',
  },
  shape: {
    borderRadius: 10,
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
  },
});
