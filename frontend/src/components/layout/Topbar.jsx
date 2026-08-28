import { AppBar, Toolbar, IconButton, Box, Badge, Tooltip } from '@mui/material';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';
import SearchBar from '../common/SearchBar';
import OutletSwitcher from './OutletSwitcher';
import UserMenu from './UserMenu';

// Mock counts until Notifications is a real module — flagged so it's easy to
// find and wire up once that backend exists.
const MOCK_NOTIFICATION_COUNT = 5;

export default function Topbar({ onMenuClick }) {
  const dispatch = useAppDispatch();

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
          <SearchBar placeholder="Search menus, items, invoices, customers…" />
        </Box>

        {/* Always-present spacer — absorbs whatever space the (capped) search
            bar doesn't use, so notifications/help/user stay pinned to the
            far right corner on every breakpoint instead of trailing the
            search box. */}
        <Box sx={{ flex: 1 }} />

        <Tooltip title="Notifications">
          <IconButton onClick={() => dispatch(showToast('Notifications are coming soon', 'info'))}>
            <Badge badgeContent={MOCK_NOTIFICATION_COUNT} color="error">
              <NotificationsNoneOutlinedIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <Tooltip title="Help">
          <IconButton
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            onClick={() => dispatch(showToast('Help center is coming soon', 'info'))}
          >
            <HelpOutlineOutlinedIcon />
          </IconButton>
        </Tooltip>

        <UserMenu />
      </Toolbar>
    </AppBar>
  );
}
