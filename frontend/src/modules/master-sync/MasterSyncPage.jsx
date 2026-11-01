import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Button, Divider,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';
import StatusBadge from '../../components/common/StatusBadge';

import { MASTER_SYNC_ITEMS } from './masterSyncMockData';

function formatSyncTimestamp(iso) {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours %= 12;
  hours = hours || 12;
  return `${day}-${month}-${year} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

function MasterSyncCard({ item, onSync }) {
  const Icon = item.icon;
  const isSyncing = item.status === 'syncing';

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, height: '100%', p: 2.25, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Stack direction="row" spacing={1.75} sx={{ alignItems: 'flex-start' }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${item.color}1F`,
            color: item.color,
            flexShrink: 0,
          }}
        >
          <Icon />
        </Box>
        <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: item.color }}>
            {item.label}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {item.description}
          </Typography>
        </Stack>
      </Stack>

      <Divider />

      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Stack spacing={0.5}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            Last Sync
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {formatSyncTimestamp(item.lastSync)}
          </Typography>
        </Stack>
        <Stack spacing={0.5} sx={{ alignItems: 'flex-end' }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            Status
          </Typography>
          <StatusBadge status={isSyncing ? 'pending' : item.status} label={isSyncing ? 'Syncing' : 'Success'} />
        </Stack>
      </Stack>

      <Button
        variant="outlined"
        startIcon={<RefreshOutlinedIcon fontSize="small" sx={isSyncing ? { animation: 'spin 1s linear infinite', '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } } } : undefined} />}
        onClick={() => onSync(item)}
        disabled={isSyncing}
        fullWidth
      >
        {isSyncing ? 'Syncing…' : 'Sync Now'}
      </Button>
    </Paper>
  );
}

/**
 * Master Sync — the master-data sync landing page, reached from the main
 * sidebar's "Master Sync" quick action. Each card represents one master
 * data type (Item, Customer, Supplier, Category, UoM, Warehouse,
 * Salesperson, Other) synced from POS to SAP Business One, showing its
 * last sync time and status with a "Sync Now" trigger. There's no Master
 * Sync backend module yet, so state lives locally: clicking "Sync Now"
 * simulates a sync (briefly shows "Syncing" then flips back to "Success"
 * with an updated timestamp) instead of calling a real API.
 */
export default function MasterSyncPage() {
  const dispatch = useAppDispatch();
  const [items, setItems] = useState(MASTER_SYNC_ITEMS);


  const handleSync = (item) => {
    setItems((prev) => prev.map((it) => (it.key === item.key ? { ...it, status: 'syncing' } : it)));
    dispatch(showToast(`${item.label} started`, 'info'));
    setTimeout(() => {
      setItems((prev) => prev.map((it) => (
        it.key === item.key ? { ...it, status: 'success', lastSync: new Date().toISOString() } : it
      )));
      dispatch(showToast(`${item.label} completed successfully`, 'success'));
    }, 1200);
  };

  const handleViewHistory = () => dispatch(showToast('Sync History is coming soon', 'info'));

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Master Sync</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Master Sync</Typography>
          </Breadcrumbs>
        </Box>
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3, p: { xs: 1.75, sm: 2 }, display: 'flex', alignItems: 'flex-start', gap: 1.5,
          bgcolor: 'rgba(37,99,235,0.06)', borderColor: 'rgba(37,99,235,0.25)',
        }}
      >
        <Box
          sx={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: '#2563EB', color: '#fff',
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 18 }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#2563EB' }}>About Master Sync</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Synchronize master data from POS to SAP Business One. Keep your items, customers, suppliers and other
            master data consistent across both systems.
          </Typography>
        </Box>
      </Paper>

      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid key={item.key} size={{ xs: 12, sm: 6, md: 3 }}>
            <MasterSyncCard item={item} onSync={handleSync} />
          </Grid>
        ))}
      </Grid>

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3, p: { xs: 1.75, sm: 2 }, display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 1.5,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: 'rgba(37,99,235,0.12)', color: '#2563EB',
            }}
          >
            <HistoryOutlinedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Sync History</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              View all master sync activities and status history.
            </Typography>
          </Box>
        </Stack>
        <Button
          variant="outlined"
          endIcon={<ArrowForwardIcon fontSize="small" />}
          onClick={handleViewHistory}
          sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}
        >
          View History
        </Button>
      </Paper>
    </Stack>
  );
}
