import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Sidebar, { SIDEBAR_WIDTH, SIDEBAR_RAIL_WIDTH } from './Sidebar';
import Topbar from './Topbar';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectSidebarOpen, toggleSidebar } from '../../features/ui/uiSlice';

/**
 * Shared shell for every authenticated page: Sidebar + Topbar + content
 * outlet. Below `md` the sidebar becomes a temporary overlay drawer (closed
 * by default, opened via the topbar menu button — purely local UI state);
 * at/above `md` it's a permanent rail that can collapse to icons-only
 * (that collapsed/expanded state is the one thing worth sharing globally,
 * hence it lives in the ui redux slice).
 */
export default function AppShell() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const dispatch = useAppDispatch();
  const sidebarExpanded = useAppSelector(selectSidebarOpen);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const desktopWidth = sidebarExpanded ? SIDEBAR_WIDTH : SIDEBAR_RAIL_WIDTH;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {isDesktop ? (
        <Sidebar variant="permanent" collapsed={!sidebarExpanded} />
      ) : (
        <Sidebar
          variant="temporary"
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          onNavigate={() => setMobileNavOpen(false)}
        />
      )}

      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: isDesktop ? `calc(100% - ${desktopWidth}px)` : '100%',
        }}
      >
        <Topbar onMenuClick={() => (isDesktop ? dispatch(toggleSidebar()) : setMobileNavOpen((v) => !v))} />
        <Box component="main" sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
