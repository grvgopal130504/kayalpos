import { useRef, useState } from 'react';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Avatar, Button,
  Paper, Tabs, Tab, Divider, TextField, IconButton,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectCurrentUser, setCredentials } from '../../features/auth/authSlice';
import { showToast } from '../../features/ui/uiSlice';
import { useChangePasswordMutation } from '../../api/authApi';

function initials(name = '') {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function ProfileTab({ user, token, dispatch }) {
  const fileInputRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [name, setName] = useState(user?.name || 'Admin User');
  const [email, setEmail] = useState(user?.email || 'admin@nexora.com');

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUrl(URL.createObjectURL(file));
  };

  const handleSave = () => {
    dispatch(setCredentials({ user: { ...user, name, email }, token }, true));
    dispatch(showToast('Profile updated', 'success'));
  };

  const handleCancel = () => {
    setName(user?.name || 'Admin User');
    setEmail(user?.email || 'admin@nexora.com');
    setAvatarUrl(null);
  };

  return (
    <Stack spacing={3} sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ position: 'relative', width: 'fit-content' }}>
        <Avatar src={avatarUrl} sx={{ bgcolor: 'primary.main', width: 72, height: 72, fontSize: 26, fontWeight: 700 }}>
          {initials(name) || 'A'}
        </Avatar>
        <IconButton
          size="small"
          onClick={handleAvatarClick}
          sx={{
            position: 'absolute', right: -4, bottom: -4,
            bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
            '&:hover': { bgcolor: 'background.paper' },
          }}
        >
          <PhotoCameraOutlinedIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <Box component="input" ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} sx={{ display: 'none' }} />
      </Box>

      <Stack spacing={2.5} sx={{ maxWidth: 420 }}>
        <TextField label="Name" size="small" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
        <TextField label="Email" size="small" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
      </Stack>

      <Stack direction="row" spacing={1.5}>
        <Button variant="contained" onClick={handleSave}>Save</Button>
        <Button variant="outlined" color="inherit" onClick={handleCancel}>Cancel</Button>
      </Stack>
    </Stack>
  );
}

function SecurityTab({ dispatch }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handleSave = async () => {
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
      dispatch(showToast('Please check your password fields', 'error'));
      return;
    }
    if (newPassword.length < 6) {
      dispatch(showToast('New password must be at least 6 characters', 'error'));
      return;
    }
    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      dispatch(showToast('Password updated', 'success'));
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to update password', 'error'));
    }
  };

  return (
    <Stack spacing={3} sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack spacing={2.5} sx={{ maxWidth: 420 }}>
        <TextField
          label="Current Password"
          type="password"
          size="small"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          fullWidth
        />
        <TextField
          label="New Password"
          type="password"
          size="small"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          fullWidth
        />
        <TextField
          label="Confirm New Password"
          type="password"
          size="small"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
        />
      </Stack>

      <Stack direction="row" spacing={1.5}>
        <Button variant="contained" onClick={handleSave} disabled={isLoading}>Save</Button>
        <Button variant="outlined" color="inherit" onClick={() => { setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}>
          Cancel
        </Button>
      </Stack>
    </Stack>
  );
}

/**
 * "Manage Profile" destination from the Settings page's Profile card —
 * avatar/name/email editing plus a Security tab for password changes.
 * Local-state only (no dedicated profile/security backend endpoints exist
 * yet), mirroring the "coming soon" mock pattern used elsewhere; Save on
 * the Profile tab does update the authenticated user's name/email in
 * authSlice so the change reflects immediately in the Topbar/UserMenu.
 */
export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const token = useAppSelector((state) => state.auth.token);
  const [tab, setTab] = useState('profile');

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Profile</Typography>
        <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
          <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
          <MuiLink component={RouterLink} to="/settings" underline="hover" color="text.secondary">Settings</MuiLink>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Profile</Typography>
        </Breadcrumbs>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 3 }}>
        <Tabs
          value={tab}
          onChange={(e, value) => setTab(value)}
          sx={{ px: { xs: 2, sm: 3 }, minHeight: 0, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 48 } }}
        >
          <Tab value="profile" label="Profile" />
          <Tab value="security" label="Security" />
        </Tabs>
        <Divider />

        {tab === 'profile' ? <ProfileTab user={user} token={token} dispatch={dispatch} /> : <SecurityTab dispatch={dispatch} />}
      </Paper>
    </Stack>
  );
}
