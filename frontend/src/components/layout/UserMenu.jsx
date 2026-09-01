import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Box, Menu, MenuItem, Stack, Typography, ListItemIcon } from '@mui/material';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout, selectCurrentUser } from '../../features/auth/authSlice';

function initials(name = '') {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function UserMenu() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    setAnchorEl(null);
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleSettings = () => {
    setAnchorEl(null);
    navigate('/settings');
  };

  return (
    <Box>
      <Stack
        direction="row"
        spacing={1}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ alignItems: 'center', cursor: 'pointer' }}
      >
        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>
          {initials(user?.name) || 'A'}
        </Avatar>
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {user?.name || 'Admin'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : user?.role || ''}
          </Typography>
        </Box>
      </Stack>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Log out
        </MenuItem>
        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <SettingsOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
      </Menu>
    </Box>
  );
}
