import { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, IconButton, Tooltip } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import PlaylistRemoveOutlinedIcon from '@mui/icons-material/PlaylistRemoveOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectOpenTabPaths, closeTab, closeAllTabs } from '../../features/tabs/tabsSlice';
import { getPageMeta, HOME_TAB_PATH } from './pageMeta';

const SCROLL_STEP = 240;

/**
 * Browser-tab-style strip of recently opened pages, sitting under the
 * Topbar (see AppShell.jsx, which is also what pushes the current route
 * into tabsSlice on navigation). Home is pinned and can't be closed;
 * closing the active tab falls back to the last remaining tab. The list
 * respects Settings > Tabs > "Max open tabs" (tabsSlice evicts the oldest
 * tab once that cap is hit) and "Close All Tabs" there calls the same
 * `closeAllTabs` action this bar's icon does.
 */
export default function TabBar() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const openPaths = useAppSelector(selectOpenTabPaths);
  const scrollerRef = useRef(null);

  const handleScroll = (dir) => {
    scrollerRef.current?.scrollBy({ left: dir * SCROLL_STEP, behavior: 'smooth' });
  };

  const handleClose = (e, path) => {
    e.stopPropagation();
    const wasActive = location.pathname === path;
    dispatch(closeTab(path));
    if (wasActive) {
      const remaining = openPaths.filter((p) => p !== path);
      navigate(remaining[remaining.length - 1] || HOME_TAB_PATH);
    }
  };

  const handleCloseAll = () => {
    dispatch(closeAllTabs());
    if (location.pathname !== HOME_TAB_PATH) navigate(HOME_TAB_PATH);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <IconButton size="small" onClick={() => handleScroll(-1)}>
        <ChevronLeftIcon fontSize="small" />
      </IconButton>

      <Box
        ref={scrollerRef}
        sx={{
          display: 'flex',
          overflowX: 'auto',
          flex: 1,
          minWidth: 0,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {openPaths.map((path) => {
          const { label, icon: Icon } = getPageMeta(path, t);
          const active = location.pathname === path;
          const pinned = path === HOME_TAB_PATH;

          return (
            <Box
              key={path}
              onClick={() => navigate(path)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 1,
                flexShrink: 0,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                borderBottom: '2px solid',
                borderColor: active ? 'primary.main' : 'transparent',
                bgcolor: active ? 'action.selected' : 'transparent',
                color: active ? 'primary.main' : 'text.secondary',
                fontWeight: active ? 700 : 500,
                fontSize: 13.5,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Icon sx={{ fontSize: 17 }} />
              {label}
              {!pinned && (
                <Box
                  component="span"
                  onClick={(e) => handleClose(e, path)}
                  sx={{
                    display: 'inline-flex',
                    borderRadius: '50%',
                    p: 0.25,
                    ml: 0.25,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 14 }} />
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      <IconButton size="small" onClick={() => handleScroll(1)}>
        <ChevronRightIcon fontSize="small" />
      </IconButton>

      <Tooltip title="Close all tabs">
        <IconButton size="small" onClick={handleCloseAll}>
          <PlaylistRemoveOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Settings">
        <IconButton size="small" onClick={() => navigate('/settings')} aria-label="Open Settings">
          <SettingsOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

    </Box>
  );
}
