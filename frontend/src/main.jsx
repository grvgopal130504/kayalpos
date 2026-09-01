import { StrictMode, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider, useSelector } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { store } from './app/store';
import { getTheme } from './theme/theme';
import { selectThemeMode, selectAccentThemeKey, selectBodyFont, selectBodyFontStyle } from './features/ui/uiSlice';
import App from './App.jsx';
import './index.css';

// Builds the MUI theme from the redux `themeMode` + `accentThemeKey` (both
// persisted to localStorage in uiSlice) so toggling light/dark or picking a
// new accent color from the Topbar re-themes the whole app instantly. Lives
// inside <Provider> so it can read the store.
function AppThemeProvider({ children }) {
  const themeMode = useSelector(selectThemeMode);
  const accentThemeKey = useSelector(selectAccentThemeKey);
  const bodyFont = useSelector(selectBodyFont);
  const bodyFontStyle = useSelector(selectBodyFontStyle);
  const theme = useMemo(
    () => getTheme(themeMode, accentThemeKey, bodyFont, bodyFontStyle),
    [themeMode, accentThemeKey, bodyFont, bodyFontStyle],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <AppThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AppThemeProvider>
    </Provider>
  </StrictMode>,
);
