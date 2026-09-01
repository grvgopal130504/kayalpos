import { useState } from 'react';
import {
  AppBar, Toolbar, IconButton, Box, Badge, Tooltip, Menu, MenuItem, ListItemText,
} from '@mui/material';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  showToast, toggleThemeMode, selectThemeMode, setAccentTheme, selectAccentThemeKey,
} from '../../features/ui/uiSlice';
import { ACCENT_THEMES, accentCssBackground } from '../../theme/accentThemes';
import GlobalSearch from './GlobalSearch';
import OutletSwitcher from './OutletSwitcher';
import UserMenu from './UserMenu';

// Mock counts until Notifications is a real module — flagged so it's easy to
// find and wire up once that backend exists.
const MOCK_NOTIFICATION_COUNT = 5;

// Accent color picker, sitting right next to the light/dark toggle: six
// flat colors + six two-color gradient combos (ACCENT_THEMES), each shown
// as a small round swatch with the selected row highlighted — separate from
// light/dark mode, which controls the page background/text palette.
function AccentThemeMenu() {
  const dispatch = useAppDispatch();
  const accentThemeKey = useAppSelector(selectAccentThemeKey);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleSelect = (key) => {
    setAnchorEl(null);
    dispatch(setAccentTheme(key));
  };

  return (
    <>
      <Tooltip title="Theme color">
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
          <PaletteOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { maxHeight: 420 } } }}
      >
        {ACCENT_THEMES.map((accent) => (
          <MenuItem key={accent.key} selected={accentThemeKey === accent.key} onClick={() => handleSelect(accent.key)}>
            <Box
              sx={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                mr: 1.5,
                flexShrink: 0,
                background: accentCssBackground(accent),
              }}
            />
            <ListItemText>{accent.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default function Topbar({ onMenuClick }) {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector(selectThemeMode);
  const isDark = themeMode === 'dark';

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
    >
      <Toolbar sx={{ gap: { xs: 1, sm: 2 }, py: 1 }}>
        <IconButton onClick={onMenuClick} edge="start">
          <MenuOutlinedIcon />
        </IconButton>

        <OutletSwitcher />

        <Box sx={{ flex: '0 1 480px', display: { xs: 'none', md: 'block' } }}>
          <GlobalSearch placeholder="Search pages… (e.g. Customer, Stock Count)" />
        </Box>

        {/* Always-present spacer — absorbs whatever space the (capped) search
            bar doesn't use, so notifications/theme-toggle/user stay pinned to
            the far right corner on every breakpoint instead of trailing the
            search box. */}
        <Box sx={{ flex: 1 }} />

        <Tooltip title="Notifications">
          <IconButton onClick={() => dispatch(showToast('Notifications are coming soon', 'info'))}>
            <Badge badgeContent={MOCK_NOTIFICATION_COUNT} color="error">
              <NotificationsNoneOutlinedIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
          <IconButton onClick={() => dispatch(toggleThemeMode())}>
            {isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
          </IconButton>
        </Tooltip>

        <AccentThemeMenu />

        <UserMenu />
      </Toolbar>
    </AppBar>
  );
}
