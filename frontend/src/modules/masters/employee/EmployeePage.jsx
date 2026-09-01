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

import EmployeeTable from './components/EmployeeTable';
import EmployeeFormDialog from './components/EmployeeFormDialog';
import EmployeeViewDialog from './components/EmployeeViewDialog';
import { CASHIER } from '../mastersMockData';
import {
  EMPLOYEES, EMPLOYEE_TYPE_OPTIONS, LOCATION_OPTIONS,
  employeeTotalRecords, employeeTotalPages, STATS,
} from './employeeMockData';

/**
 * Employee — the Employee master's list screen, reached from the Masters
 * page's "Employee" card (and, later, any Quick Access shortcut into it).
 * Same searchable/filterable list shape as the other Masters list pages
 * (info banner + action buttons, filter bar, table, records footer, bottom
 * stat row). Filters run client-side over the mocked EMPLOYEES list; every
 * row action and the New Employee/Import/Export/More buttons are mocked —
 * there's no Employee backend module yet.
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
  const handleSearch = () => setAppliedSearch(searchInput.trim().toLowerCase());
  const handleReset = () => {
    setSearchInput('');
    setEmployeeType('All');
    setLocation('All');
    setStatus('All');
    setAppliedSearch('');
  };
  const handleOpenEmployee = (row) => setViewRow(row);
  const handleEditRow = (row) => setFormDialog({ open: true, mode: 'edit', row });
  const handleDeleteRow = (row) => dispatch(showToast(`Delete ${row.name} is coming soon`, 'info'));
  const closeFormDialog = () => setFormDialog((prev) => ({ ...prev, open: false }));

  const filteredRows = useMemo(() => EMPLOYEES.filter((row) => {
    if (appliedSearch) {
      const haystack = `${row.code} ${row.name} ${row.phone}`.toLowerCase();
      if (!haystack.includes(appliedSearch)) return false;
    }
    if (employeeType !== 'All' && row.type !== employeeType) return false;
    if (location !== 'All' && row.location !== location) return false;
    if (status !== 'All' && row.status !== status) return false;
    return true;
  }), [appliedSearch, employeeType, location, status]);

  const isFiltered = Boolean(appliedSearch) || employeeType !== 'All' || location !== 'All' || status !== 'All';

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
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>Create and manage employees.</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              These users can access POS and perform transactions.
            </Typography>
          </Box>
        </Paper>

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
              {LOCATION_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
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
        <EmployeeTable rows={filteredRows} onOpenEmployee={handleOpenEmployee} onEditRow={handleEditRow} onDeleteRow={handleDeleteRow} />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Showing {filteredRows.length ? 1 : 0} to {filteredRows.length} of {isFiltered ? filteredRows.length : employeeTotalRecords} records
          </Typography>
          <Pagination
            count={isFiltered ? 1 : employeeTotalPages}
            page={page}
            onChange={(_e, value) => setPage(value)}
            color="primary"
            shape="rounded"
          />
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard icon={PeopleAltOutlinedIcon} iconColor="#2563EB" iconShape="circle" label="Total Employees" value={formatNumber(STATS.totalEmployees)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard icon={FactCheckOutlinedIcon} iconColor="success" iconShape="circle" label="Active Employees" value={formatNumber(STATS.activeEmployees)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard icon={CloseIcon} iconColor="error" iconShape="circle" label="Inactive Employees" value={formatNumber(STATS.inactiveEmployees)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard icon={PlaceOutlinedIcon} iconColor="#7C3AED" iconShape="circle" label="Cashiers" value={formatNumber(STATS.cashiers)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <StatCard icon={StorefrontIcon} iconColor="#F26B21" iconShape="circle" label="Sales Employees" value={formatNumber(STATS.salesEmployees)} />
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
