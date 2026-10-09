import { useMemo, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Button, Menu, MenuItem,
  TextField, InputAdornment, Pagination,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AddIcon from '@mui/icons-material/Add';
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import StorefrontIcon from '@mui/icons-material/Storefront';

import { useAppDispatch } from '../../../app/hooks';
import { logout } from '../../../features/auth/authSlice';
import { showToast } from '../../../features/ui/uiSlice';
import StatCard from '../../../components/common/StatCard';
import { formatNumber } from '../../../utils/format';
import { formatPickerDate } from '../../../components/form/FormDatePicker';

import EmployeeTable from './components/EmployeeTable';
import EmployeeFormDialog from './components/EmployeeFormDialog';
import EmployeeViewDialog from './components/EmployeeViewDialog';
import { CASHIER } from '../mastersMockData';
import { EMPLOYEE_TYPE_OPTIONS } from './employeeMockData';
import { useGetOutletsQuery } from '../../../api/outletApi';
import { useGetEmployeesQuery, useDeleteEmployeeMutation } from '../../../api/employeeApi';

// Maps an Employee row as returned by the API (outlet joined in, status
// 'ACTIVE'/'INACTIVE', joiningDate an ISO date string or null) to the shape
// the existing table/dialog components expect (location: string,
// status: 'Active'/'Inactive', joiningDate: "DD Mon YYYY"), same toViewRow
// pattern SupplierPage uses.
function toViewRow(row) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    type: row.type || '',
    location: row.outlet?.name || '',
    outletId: row.outletId || row.outlet?.id || '',
    phone: row.phone || '',
    email: row.email || '',
    loginUser: row.loginUsername || '',
    joiningDate: row.joiningDate ? formatPickerDate(new Date(row.joiningDate)) : '',
    status: row.status === 'ACTIVE' ? 'Active' : 'Inactive',
  };
}

/**
 * Employee — the Employee master's list screen, reached from the Masters
 * page's "Employee" card. Wired to the real Employee API (see
 * api/employeeApi.js): list/search/status run server-side (via
 * utils/crudFactory.js — see employee.routes.js); Type/Location filters and
 * the stat tiles are computed client-side over whatever rows the current
 * search/status filter returned, same "no backend aggregation endpoint"
 * convention as SupplierPage's Group/City/State filters. Import/Export/More
 * remain mocked — no bulk endpoint exists for Employee yet.
 */
export default function EmployeePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [moreAnchor, setMoreAnchor] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [employeeType, setEmployeeType] = useState('All');
  const [location, setLocation] = useState('All');
  const [status, setStatus] = useState('All');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [formDialog, setFormDialog] = useState({ open: false, mode: 'add', row: null });
  const [viewRow, setViewRow] = useState(null);

  const { data: outlets = [] } = useGetOutletsQuery({ isActive: true });

  const queryParams = {
    search: appliedSearch || undefined,
    status: status !== 'All' ? status.toUpperCase() : undefined,
  };
  const { data: employeeRows = [], isLoading, isError } = useGetEmployeesQuery(queryParams);
  const [deleteEmployee] = useDeleteEmployeeMutation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleNewEmployee = () => setFormDialog({ open: true, mode: 'add', row: null });
  const handleImport = () => dispatch(showToast('Import Employees is coming soon', 'info'));
  const handleExport = () => dispatch(showToast('Export Employees is coming soon', 'info'));
  const handleMoreAction = (label) => {
    setMoreAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };
  const handleSearch = () => setAppliedSearch(searchInput.trim());
  const handleReset = () => {
    setSearchInput('');
    setEmployeeType('All');
    setLocation('All');
    setStatus('All');
    setAppliedSearch('');
  };
  const handleOpenEmployee = (row) => setViewRow(row);
  const handleEditRow = (row) => setFormDialog({ open: true, mode: 'edit', row });
  const handleDeleteRow = async (row) => {
    if (!window.confirm(`Delete employee "${row.name}"? This cannot be undone.`)) return;
    try {
      await deleteEmployee(row.id).unwrap();
      dispatch(showToast(`${row.name} deleted`, 'success'));
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to delete employee', 'error'));
    }
  };
  const closeFormDialog = () => setFormDialog((prev) => ({ ...prev, open: false }));

  const viewRows = useMemo(() => employeeRows.map(toViewRow), [employeeRows]);

  // Type/Location are filtered client-side (the backend doesn't index on
  // them yet); search and status are already applied server-side above.
  const filteredRows = useMemo(() => viewRows.filter((row) => {
    if (employeeType !== 'All' && row.type !== employeeType) return false;
    if (location !== 'All' && row.location !== location) return false;
    return true;
  }), [viewRows, employeeType, location]);

  const isFiltered = Boolean(appliedSearch) || employeeType !== 'All' || location !== 'All' || status !== 'All';

  const stats = useMemo(() => ({
    totalEmployees: viewRows.length,
    activeEmployees: viewRows.filter((r) => r.status === 'Active').length,
    inactiveEmployees: viewRows.filter((r) => r.status === 'Inactive').length,
    cashiers: viewRows.filter((r) => r.type === 'Cashier').length,
    salesEmployees: viewRows.filter((r) => r.type === 'Sales Employee').length,
  }), [viewRows]);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Employee</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/masters" underline="hover" color="text.secondary">Masters</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Employee</Typography>
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

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'stretch', lg: 'center' }, justifyContent: 'flex-end' }}>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
          <Button variant="contained" color="primary" startIcon={<AddIcon fontSize="small" />} onClick={handleNewEmployee}>
            New Employee
          </Button>
          <Button variant="outlined" color="primary" startIcon={<MoveToInboxOutlinedIcon fontSize="small" />} onClick={handleImport}>
            Import
          </Button>
          <Button variant="outlined" color="primary" startIcon={<FileUploadOutlinedIcon fontSize="small" />} onClick={handleExport}>
            Export
          </Button>
          <Button variant="outlined" color="inherit" startIcon={<MoreVertOutlinedIcon fontSize="small" />} onClick={(e) => setMoreAnchor(e.currentTarget)}>
            More
          </Button>
          <Menu anchorEl={moreAnchor} open={Boolean(moreAnchor)} onClose={() => setMoreAnchor(null)}>
            <MenuItem onClick={() => handleMoreAction('Print Employee List')}>Print Employee List</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Reset Login Passwords')}>Reset Login Passwords</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Deactivate Selected')}>Deactivate Selected</MenuItem>
          </Menu>
        </Stack>
      </Stack>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Grid container spacing={1.5} sx={{ alignItems: 'flex-end' }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Search Employee"
              placeholder="Search by name, code or phone..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              fullWidth
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2.25 }}>
            <TextField select label="Employee Type" value={employeeType} onChange={(e) => setEmployeeType(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              {EMPLOYEE_TYPE_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2.25 }}>
            <TextField select label="Location" value={location} onChange={(e) => setLocation(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              {outlets.map((o) => <MenuItem key={o.id} value={o.name}>{o.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1.5 }}>
            <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} fullWidth>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 1.5 }}>
            <Button variant="contained" color="primary" startIcon={<SearchIcon fontSize="small" />} onClick={handleSearch} fullWidth>
              Search
            </Button>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 1.5 }}>
            <Button variant="outlined" color="inherit" startIcon={<CloseIcon fontSize="small" />} onClick={handleReset} fullWidth>
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Employee List</Typography>
        {isError ? (
          <Typography variant="body2" sx={{ color: 'error.main', textAlign: 'center', py: 3 }}>
            Failed to load employees. Please try again.
          </Typography>
        ) : (
          <Box sx={{ opacity: isLoading ? 0.6 : 1, transition: 'opacity 0.15s ease' }}>
            <EmployeeTable rows={filteredRows} onOpenEmployee={handleOpenEmployee} onEditRow={handleEditRow} onDeleteRow={handleDeleteRow} />
          </Box>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Showing {filteredRows.length ? 1 : 0} to {filteredRows.length} of {formatNumber(filteredRows.length)} records
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
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard icon={PeopleAltOutlinedIcon} iconColor="#2563EB" iconShape="circle" label="Total Employees" value={formatNumber(stats.totalEmployees)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard icon={FactCheckOutlinedIcon} iconColor="success" iconShape="circle" label="Active Employees" value={formatNumber(stats.activeEmployees)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard icon={CloseIcon} iconColor="error" iconShape="circle" label="Inactive Employees" value={formatNumber(stats.inactiveEmployees)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard icon={PlaceOutlinedIcon} iconColor="#7C3AED" iconShape="circle" label="Cashiers" value={formatNumber(stats.cashiers)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard icon={StorefrontIcon} iconColor="#F26B21" iconShape="circle" label="Sales Employees" value={formatNumber(stats.salesEmployees)} />
        </Grid>
      </Grid>

      <EmployeeFormDialog open={formDialog.open} mode={formDialog.mode} initialValues={formDialog.row} onClose={closeFormDialog} />
      <EmployeeViewDialog
        open={Boolean(viewRow)}
        row={viewRow}
        onClose={() => setViewRow(null)}
        onEdit={() => {
          const row = viewRow;
          setViewRow(null);
          setFormDialog({ open: true, mode: 'edit', row });
        }}
      />
    </Stack>
  );
}
