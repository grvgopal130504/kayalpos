import { useMemo, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Button, Menu, MenuItem,
  TextField, InputAdornment, Pagination,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddIcon from '@mui/icons-material/Add';
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';

import { useAppDispatch } from '../../../app/hooks';
import { logout } from '../../../features/auth/authSlice';
import { showToast } from '../../../features/ui/uiSlice';
import StatCard from '../../../components/common/StatCard';
import { formatCurrency, formatNumber } from '../../../utils/format';

import ProductTable from './components/ProductTable';
import { CASHIER } from '../mastersMockData';
import {
  STATS, PRODUCTS, PRODUCT_GROUP_OPTIONS, PRODUCT_TYPE_OPTIONS, BRAND_OPTIONS, UOM_OPTIONS,
  totalRecords, totalPages,
} from './productMockData';

const PAGE_SIZE = 10;

/**
 * Product — the Product master's list screen, reached from the Masters
 * page's "Product" card. Unlike Company/Outlet/Warehouse (single-record
 * detail forms), this is a searchable/filterable table over the product
 * catalog, matching the reference: a filter bar, the product grid, a
 * "Showing X to Y of Z records" + page-number footer, and a bottom row of
 * catalog-health stat tiles. Filters are entirely local (`PRODUCTS` only
 * mocks the first page of a 245-row catalog), so Search/Reset only
 * operate on this mocked page; paging past page 1 surfaces a toast since
 * there's no Product backend module yet to fetch further pages from.
 */
export default function ProductPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [moreAnchor, setMoreAnchor] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [productGroup, setProductGroup] = useState('All');
  const [productType, setProductType] = useState('All');
  const [brand, setBrand] = useState('All');
  const [uom, setUom] = useState('All');
  const [status, setStatus] = useState('All');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleNewProduct = () => dispatch(showToast('New Product form is coming soon', 'info'));
  const handleImport = () => dispatch(showToast('Import Products is coming soon', 'info'));
  const handleExport = () => dispatch(showToast('Export Products is coming soon', 'info'));
  const handleMoreAction = (label) => {
    setMoreAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };
  const handleSearch = () => setAppliedSearch(searchInput.trim().toLowerCase());
  const handleReset = () => {
    setSearchInput('');
    setProductGroup('All');
    setProductType('All');
    setBrand('All');
    setUom('All');
    setStatus('All');
    setAppliedSearch('');
  };
  const handleOpenProduct = (row) => dispatch(showToast(`Product details for ${row.code} are coming soon`, 'info'));
  const handleEditRow = (row) => dispatch(showToast(`Edit ${row.code} is coming soon`, 'info'));
  const handleDeleteRow = (row) => dispatch(showToast(`Delete ${row.code} is coming soon`, 'info'));
  const handlePageChange = (value) => {
    setPage(value);
    if (value !== 1) dispatch(showToast('Loading further pages is coming soon', 'info'));
  };

  const filteredRows = useMemo(() => PRODUCTS.filter((row) => {
    if (appliedSearch) {
      const haystack = `${row.code} ${row.name}`.toLowerCase();
      if (!haystack.includes(appliedSearch)) return false;
    }
    if (productGroup !== 'All' && row.group !== productGroup) return false;
    if (brand !== 'All' && row.brand !== brand) return false;
    if (uom !== 'All' && row.uom !== uom) return false;
    if (status !== 'All' && row.status !== status) return false;
    return true;
  }), [appliedSearch, productGroup, brand, uom, status]);

  const rangeStart = filteredRows.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd = Math.min(rangeStart + PAGE_SIZE - 1, filteredRows.length ? rangeStart - 1 + filteredRows.length : 0);
  const isFiltered = Boolean(appliedSearch) || productGroup !== 'All' || brand !== 'All' || uom !== 'All' || status !== 'All';

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Product</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/masters" underline="hover" color="text.secondary">Masters</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Product</Typography>
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
            <Typography variant="body2" sx={{ fontWeight: 700 }}>Create and manage your inventory products.</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Maintain product details, pricing, stock information and more.
            </Typography>
          </Box>
        </Paper>

        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
          <Button variant="contained" color="primary" startIcon={<AddIcon fontSize="small" />} onClick={handleNewProduct}>
            New Product
          </Button>
          <Button variant="outlined" color="primary" startIcon={<MoveToInboxOutlinedIcon fontSize="small" />} onClick={handleImport}>
            Import
          </Button>
          <Button variant="outlined" color="primary" startIcon={<FileUploadOutlinedIcon fontSize="small" />} onClick={handleExport}>
            Export
          </Button>
          <Button variant="outlined" color="primary" endIcon={<ExpandMoreIcon fontSize="small" />} onClick={(e) => setMoreAnchor(e.currentTarget)}>
            More
          </Button>
          <Menu anchorEl={moreAnchor} open={Boolean(moreAnchor)} onClose={() => setMoreAnchor(null)}>
            <MenuItem onClick={() => handleMoreAction('Bulk Update Prices')}>Bulk Update Prices</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Print Product List')}>Print Product List</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Deactivate Selected')}>Deactivate Selected</MenuItem>
          </Menu>
        </Stack>
      </Stack>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Grid container spacing={1.5} sx={{ alignItems: 'flex-end' }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Search Product"
              placeholder="Search by product code, name or barcode..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              fullWidth
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.8 }}>
            <TextField select label="Product Group" value={productGroup} onChange={(e) => setProductGroup(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              {PRODUCT_GROUP_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.8 }}>
            <TextField select label="Product Type" value={productType} onChange={(e) => setProductType(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              {PRODUCT_TYPE_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.8 }}>
            <TextField select label="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              {BRAND_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.4 }}>
            <TextField select label="UOM" value={uom} onChange={(e) => setUom(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              {UOM_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.4 }}>
            <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 1.4 }}>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" color="primary" startIcon={<SearchIcon fontSize="small" />} onClick={handleSearch} fullWidth>
                Search
              </Button>
            </Stack>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 1.4 }}>
            <Button variant="outlined" color="inherit" startIcon={<CloseIcon fontSize="small" />} onClick={handleReset} fullWidth>
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Product List</Typography>
        <ProductTable rows={filteredRows} onOpenProduct={handleOpenProduct} onEditRow={handleEditRow} onDeleteRow={handleDeleteRow} />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {isFiltered
              ? `Showing ${filteredRows.length} of ${totalRecords} records`
              : `Showing ${rangeStart} to ${rangeEnd} of ${formatNumber(totalRecords)} records`}
          </Typography>
          {!isFiltered && (
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_e, value) => handlePageChange(value)}
              color="primary"
              shape="rounded"
            />
          )}
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <StatCard icon={Inventory2OutlinedIcon} iconColor="#2563EB" iconShape="circle" label="Total Products" value={formatNumber(STATS.totalProducts)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <StatCard icon={FactCheckOutlinedIcon} iconColor="success" iconShape="circle" label="Active Products" value={formatNumber(STATS.activeProducts)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <StatCard icon={CloseIcon} iconColor="error" iconShape="circle" label="Inactive Products" value={formatNumber(STATS.inactiveProducts)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <StatCard icon={WarningAmberOutlinedIcon} iconColor="warning" iconShape="circle" label="Low Stock Products" value={formatNumber(STATS.lowStockProducts)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <StatCard icon={Inventory2OutlinedIcon} iconColor="#8B5CF6" iconShape="circle" label="Out of Stock Products" value={formatNumber(STATS.outOfStockProducts)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <StatCard icon={CurrencyRupeeOutlinedIcon} iconColor="#0EA5A4" iconShape="circle" label="Total Inventory Value" value={formatCurrency(STATS.totalInventoryValue, { decimals: true })} />
        </Grid>
      </Grid>
    </Stack>
  );
}
