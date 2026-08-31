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
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

import { useAppDispatch } from '../../../app/hooks';
import { logout } from '../../../features/auth/authSlice';
import { showToast } from '../../../features/ui/uiSlice';
import StatCard from '../../../components/common/StatCard';
import { formatNumber } from '../../../utils/format';

import PriceListTable from './components/PriceListTable';
import { CASHIER } from '../mastersMockData';
import { PRICE_LISTS, PRICE_LIST_TYPE_OPTIONS, APPLICABLE_TO_OPTIONS, STATS } from './priceListMockData';

// Converts a native <input type="date"> value ("YYYY-MM-DD") into this
// filter bar's "dd-mm-yyyy" display format.
function formatDdMmYyyy(isoValue) {
  if (!isoValue) return '';
  const [y, m, d] = isoValue.split('-');
  return `${d}-${m}-${y}`;
}

/**
 * Price List — the Price List master's list screen, reached from the
 * Masters page's "Price List" card. Same searchable/filterable list
 * shape as Brand/Tax Code/HSN-SAC (filter bar + table + records footer +
 * bottom stat row), sized for a small set of price lists so all 8 mock
 * rows fit on a single page. Filters run entirely client-side over
 * PRICE_LISTS; every row action and the Import/Export/New Price List
 * buttons are mocked — there's no Price List backend module yet.
 */
export default function PriceListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [priceListType, setPriceListType] = useState('All');
  const [applicableTo, setApplicableTo] = useState('All');
  const [status, setStatus] = useState('All');
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [effectiveTo, setEffectiveTo] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const effectiveFromNativeRef = useRef(null);
  const effectiveToNativeRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleNewPriceList = () => dispatch(showToast('New Price List form is coming soon', 'info'));
  const handleImport = () => dispatch(showToast('Import Price Lists is coming soon', 'info'));
  const handleExport = () => dispatch(showToast('Export Price Lists is coming soon', 'info'));
  const handleSearch = () => setAppliedSearch(searchInput.trim().toLowerCase());
  const handleReset = () => {
    setSearchInput('');
    setPriceListType('All');
    setApplicableTo('All');
    setStatus('All');
    setEffectiveFrom('');
    setEffectiveTo('');
    setAppliedSearch('');
  };
  const handleEditRow = (row) => dispatch(showToast(`Edit ${row.name} is coming soon`, 'info'));
  const handleDeleteRow = (row) => dispatch(showToast(`Delete ${row.name} is coming soon`, 'info'));

  const filteredRows = useMemo(() => PRICE_LISTS.filter((row) => {
    if (appliedSearch) {
      const haystack = `${row.code} ${row.name}`.toLowerCase();
      if (!haystack.includes(appliedSearch)) return false;
    }
    if (priceListType !== 'All' && row.type !== priceListType) return false;
    if (applicableTo !== 'All' && row.applicableTo !== applicableTo) return false;
    if (status !== 'All' && row.status !== status) return false;
    return true;
  }), [appliedSearch, priceListType, applicableTo, status]);

  const isFiltered = Boolean(appliedSearch) || priceListType !== 'All' || applicableTo !== 'All' || status !== 'All'
    || Boolean(effectiveFrom) || Boolean(effectiveTo);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Price List</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/masters" underline="hover" color="text.secondary">Masters</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Price List</Typography>
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
            borderRadius: 3, p: { xs: 1.75, sm: 2 }, display: 'flex', alignItems: 'flex-start', gap: 1.5, flex: 1,
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
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Create and manage price lists for different customer groups, outlets and sales channels.
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Price lists help define selling prices for items.
            </Typography>
          </Box>
        </Paper>

        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
          <Button variant="contained" color="primary" startIcon={<AddIcon fontSize="small" />} onClick={handleNewPriceList}>
            New Price List
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
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <TextField
              label="Search Price List"
              placeholder="Search by price list name or code..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              fullWidth
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.8 }}>
            <TextField select label="Price List Type" value={priceListType} onChange={(e) => setPriceListType(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              {PRICE_LIST_TYPE_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.8 }}>
            <TextField select label="Applicable To" value={applicableTo} onChange={(e) => setApplicableTo(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              {APPLICABLE_TO_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.4 }}>
            <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.6 }}>
            <TextField
              label="Effective Date"
              placeholder="dd-mm-yyyy"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        edge="end"
                        aria-label="Open Effective Date picker"
                        onClick={() => (effectiveFromNativeRef.current?.showPicker?.() ?? effectiveFromNativeRef.current?.click())}
                      >
                        <CalendarTodayOutlinedIcon fontSize="small" />
                      </IconButton>
                      <input
                        ref={effectiveFromNativeRef}
                        type="date"
                        onChange={(e) => setEffectiveFrom(formatDdMmYyyy(e.target.value))}
                        style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.6 }}>
            <TextField
              label="To"
              placeholder="dd-mm-yyyy"
              value={effectiveTo}
              onChange={(e) => setEffectiveTo(e.target.value)}
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        edge="end"
                        aria-label="Open To date picker"
                        onClick={() => (effectiveToNativeRef.current?.showPicker?.() ?? effectiveToNativeRef.current?.click())}
                      >
                        <CalendarTodayOutlinedIcon fontSize="small" />
                      </IconButton>
                      <input
                        ref={effectiveToNativeRef}
                        type="date"
                        onChange={(e) => setEffectiveTo(formatDdMmYyyy(e.target.value))}
                        style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 1.2 }}>
            <Button variant="contained" color="primary" startIcon={<SearchIcon fontSize="small" />} onClick={handleSearch} fullWidth>
              Search
            </Button>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 1.2 }}>
            <Button variant="outlined" color="inherit" startIcon={<CloseIcon fontSize="small" />} onClick={handleReset} fullWidth>
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Price List</Typography>
        <PriceListTable rows={filteredRows} onEditRow={handleEditRow} onDeleteRow={handleDeleteRow} />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Showing {filteredRows.length ? 1 : 0} to {filteredRows.length} of {isFiltered ? filteredRows.length : PRICE_LISTS.length} records
          </Typography>
          <Pagination count={1} page={page} onChange={(_e, value) => setPage(value)} color="primary" shape="rounded" />
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={DescriptionOutlinedIcon} iconColor="#2563EB" iconShape="circle" label="Total Price Lists" value={formatNumber(STATS.totalPriceLists)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={FactCheckOutlinedIcon} iconColor="success" iconShape="circle" label="Active Price Lists" value={formatNumber(STATS.activePriceLists)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={CloseIcon} iconColor="error" iconShape="circle" label="Inactive Price Lists" value={formatNumber(STATS.inactivePriceLists)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={ReceiptLongOutlinedIcon} iconColor="warning" iconShape="circle" label="Total Items in Price Lists" value={formatNumber(STATS.totalItemsInPriceLists)} />
        </Grid>
      </Grid>
    </Stack>
  );
}
