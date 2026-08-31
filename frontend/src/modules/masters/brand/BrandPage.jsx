import { useMemo, useRef, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Button,
  TextField, MenuItem, InputAdornment, IconButton, Pagination,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddIcon from '@mui/icons-material/Add';
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

import { useAppDispatch } from '../../../app/hooks';
import { logout } from '../../../features/auth/authSlice';
import { showToast } from '../../../features/ui/uiSlice';
import StatCard from '../../../components/common/StatCard';
import { formatNumber } from '../../../utils/format';

import BrandTable from './components/BrandTable';
import { CASHIER } from '../mastersMockData';
import { BRANDS, CATEGORY_OPTIONS, STATS } from './brandMockData';

// Converts a native <input type="date"> value ("YYYY-MM-DD") into this
// filter bar's "dd-mm-yyyy" display format.
function formatDdMmYyyy(isoValue) {
  if (!isoValue) return '';
  const [y, m, d] = isoValue.split('-');
  return `${d}-${m}-${y}`;
}

/**
 * Brand — the Brand master's list screen, reached from the Masters
 * page's "Brand" card. Same searchable/filterable list shape as the
 * Product master (filter bar + table + records footer + bottom stat
 * row), sized for a small catalog of brands rather than thousands of
 * products, so all 8 mock rows fit on a single page. Filters run
 * entirely client-side over BRANDS; every row action and the Import/
 * Export/New Brand buttons are mocked — there's no Brand backend module
 * yet.
 */
export default function BrandPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('All');
  const [category, setCategory] = useState('All');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const createdFromNativeRef = useRef(null);
  const createdToNativeRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleNewBrand = () => dispatch(showToast('New Brand form is coming soon', 'info'));
  const handleImport = () => dispatch(showToast('Import Brands is coming soon', 'info'));
  const handleExport = () => dispatch(showToast('Export Brands is coming soon', 'info'));
  const handleSearch = () => setAppliedSearch(searchInput.trim().toLowerCase());
  const handleReset = () => {
    setSearchInput('');
    setStatus('All');
    setCategory('All');
    setCreatedFrom('');
    setCreatedTo('');
    setAppliedSearch('');
  };
  const handleEditRow = (row) => dispatch(showToast(`Edit ${row.name} is coming soon`, 'info'));
  const handleDeleteRow = (row) => dispatch(showToast(`Delete ${row.name} is coming soon`, 'info'));

  const filteredRows = useMemo(() => BRANDS.filter((row) => {
    if (appliedSearch) {
      const haystack = `${row.code} ${row.name}`.toLowerCase();
      if (!haystack.includes(appliedSearch)) return false;
    }
    if (status !== 'All' && row.status !== status) return false;
    if (category !== 'All' && row.category !== category) return false;
    return true;
  }), [appliedSearch, status, category]);

  const isFiltered = Boolean(appliedSearch) || status !== 'All' || category !== 'All' || Boolean(createdFrom) || Boolean(createdTo);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Brand</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/masters" underline="hover" color="text.secondary">Masters</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Brand</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#2563EB' }}>
            Cashier : {CASHIER.name} ({CASHIER.code})
          </Typography>
          <MuiLink
            component="button"
            type="button"
            variant="body2"
            underline="hover"
            onClick={handleLogout}
            sx={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 0.5, color: '#2563EB' }}
          >
            <LogoutOutlinedIcon fontSize="inherit" /> Logout
          </MuiLink>
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'stretch', lg: 'center' }, justifyContent: 'space-between' }}>
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 3, p: { xs: 1.75, sm: 2 }, display: 'flex', alignItems: 'center', gap: 1.5, flex: 1,
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
          <Typography variant="body2">Manage and organize item brands. Brands help to classify items and generate reports.</Typography>
        </Paper>

        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
          <Button variant="contained" color="primary" startIcon={<AddIcon fontSize="small" />} onClick={handleNewBrand}>
            New Brand
          </Button>
          <Button variant="outlined" color="primary" startIcon={<MoveToInboxOutlinedIcon fontSize="small" />} onClick={handleImport}>
            Import
          </Button>
          <Button variant="outlined" color="primary" startIcon={<FileUploadOutlinedIcon fontSize="small" />} onClick={handleExport}>
            Export
          </Button>
        </Stack>
      </Stack>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Grid container spacing={1.5} sx={{ alignItems: 'flex-end' }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Search Brand"
              placeholder="Search by brand name or code..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              fullWidth
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.8 }}>
            <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2.2 }}>
            <TextField select label="Item Group / Category" value={category} onChange={(e) => setCategory(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              {CATEGORY_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.8 }}>
            <TextField
              label="Created From"
              placeholder="dd-mm-yyyy"
              value={createdFrom}
              onChange={(e) => setCreatedFrom(e.target.value)}
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        edge="end"
                        aria-label="Open Created From date picker"
                        onClick={() => (createdFromNativeRef.current?.showPicker?.() ?? createdFromNativeRef.current?.click())}
                      >
                        <CalendarTodayOutlinedIcon fontSize="small" />
                      </IconButton>
                      <input
                        ref={createdFromNativeRef}
                        type="date"
                        onChange={(e) => setCreatedFrom(formatDdMmYyyy(e.target.value))}
                        style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.8 }}>
            <TextField
              label="Created To"
              placeholder="dd-mm-yyyy"
              value={createdTo}
              onChange={(e) => setCreatedTo(e.target.value)}
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        edge="end"
                        aria-label="Open Created To date picker"
                        onClick={() => (createdToNativeRef.current?.showPicker?.() ?? createdToNativeRef.current?.click())}
                      >
                        <CalendarTodayOutlinedIcon fontSize="small" />
                      </IconButton>
                      <input
                        ref={createdToNativeRef}
                        type="date"
                        onChange={(e) => setCreatedTo(formatDdMmYyyy(e.target.value))}
                        style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 1.4 }}>
            <Button variant="contained" color="primary" startIcon={<SearchIcon fontSize="small" />} onClick={handleSearch} fullWidth>
              Search
            </Button>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 1 }}>
            <Button variant="outlined" color="inherit" startIcon={<CloseIcon fontSize="small" />} onClick={handleReset} fullWidth>
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Brand List</Typography>
        <BrandTable rows={filteredRows} onEditRow={handleEditRow} onDeleteRow={handleDeleteRow} />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Showing {filteredRows.length ? 1 : 0} to {filteredRows.length} of {isFiltered ? filteredRows.length : BRANDS.length} records
          </Typography>
          <Pagination
            count={1}
            page={page}
            onChange={(_e, value) => setPage(value)}
            color="primary"
            shape="rounded"
          />
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={ReceiptOutlinedIcon} iconColor="#2563EB" iconShape="circle" label="Total Brands" value={formatNumber(STATS.totalBrands)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={FactCheckOutlinedIcon} iconColor="success" iconShape="circle" label="Active Brands" value={formatNumber(STATS.activeBrands)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={CloseIcon} iconColor="error" iconShape="circle" label="Inactive Brands" value={formatNumber(STATS.inactiveBrands)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={Inventory2OutlinedIcon} iconColor="warning" iconShape="circle" label="Total Items Under Brands" value={formatNumber(STATS.totalItemsUnderBrands)} />
        </Grid>
      </Grid>
    </Stack>
  );
}
