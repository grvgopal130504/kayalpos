import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Button, ButtonBase,
  TextField, MenuItem, InputAdornment,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

import { useAppDispatch } from '../../../app/hooks';
import { logout } from '../../../features/auth/authSlice';
import { showToast } from '../../../features/ui/uiSlice';

import {
  CASHIER, SUPPLIER_OPTIONS, WAREHOUSE_OPTIONS, DEFAULT_DATE_RANGE, PURCHASE_REPORT_ITEMS,
} from './purchaseReportsMockData';

function formatDisplayDate(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function ReportTypeCard({ item, onOpen }) {
  const Icon = item.icon;
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
      <ButtonBase
        onClick={() => onOpen(item)}
        sx={{
          width: '100%',
          height: '100%',
          p: 2.25,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.75,
          textAlign: 'left',
          borderRadius: 3,
          transition: 'transform 0.15s, box-shadow 0.15s',
          '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 },
        }}
      >
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
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: item.color }}>
              {item.label}
            </Typography>
            <NavigateNextIcon fontSize="small" sx={{ color: 'text.secondary', flexShrink: 0 }} />
          </Stack>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {item.description}
          </Typography>
        </Stack>
      </ButtonBase>
    </Paper>
  );
}

/**
 * Purchase Reports — the Purchase Report category's landing screen, reached
 * from the Reports page's "Purchase Report" card. A shared date range /
 * supplier / warehouse filter bar sits above a grid of individual purchase
 * report types (Purchase Summary, Supplier-wise Purchase, GRN Report,
 * Pending GRN, Purchase Return, Purchase Price Variance, Stock Indent,
 * Stock Transfer, Stock Receipt, Stock Return, Stock Count). There's no
 * Reports backend module yet, so the filters are local state and every
 * report tile surfaces a "coming soon" toast instead of navigating.
 */
export default function PurchaseReportsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [dateFrom, setDateFrom] = useState(DEFAULT_DATE_RANGE.from);
  const [dateTo, setDateTo] = useState(DEFAULT_DATE_RANGE.to);
  const [supplier, setSupplier] = useState('All Suppliers');
  const [warehouse, setWarehouse] = useState('All Warehouses');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleDatePick = () => dispatch(showToast('Date range picker is coming soon', 'info'));
  const handleSearch = () => dispatch(showToast('Purchase report filters are coming soon', 'info'));
  const handleReset = () => {
    setDateFrom(DEFAULT_DATE_RANGE.from);
    setDateTo(DEFAULT_DATE_RANGE.to);
    setSupplier('All Suppliers');
    setWarehouse('All Warehouses');
  };
  const handleOpenReport = (item) => dispatch(showToast(`${item.label} report is coming soon`, 'info'));

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Purchase Reports</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/reports" underline="hover" color="text.secondary">Reports</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Purchase Reports</Typography>
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

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Grid container spacing={1.5} sx={{ alignItems: 'flex-end' }}>
          <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
              Date Range
            </Typography>
            <TextField
              size="medium"
              value={`${formatDisplayDate(dateFrom)} - ${formatDisplayDate(dateTo)}`}
              onClick={handleDatePick}
              fullWidth
              slotProps={{
                input: {
                  readOnly: true,
                  endAdornment: <InputAdornment position="end"><CalendarTodayOutlinedIcon fontSize="small" /></InputAdornment>,
                },
              }}
              sx={{ cursor: 'pointer' }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
              Supplier
            </Typography>
            <TextField select value={supplier} onChange={(e) => setSupplier(e.target.value)} fullWidth>
              <MenuItem value="All Suppliers">All Suppliers</MenuItem>
              {SUPPLIER_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
              Warehouse
            </Typography>
            <TextField select value={warehouse} onChange={(e) => setWarehouse(e.target.value)} fullWidth>
              <MenuItem value="All Warehouses">All Warehouses</MenuItem>
              {WAREHOUSE_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 1.75 }}>
            <Button variant="contained" color="primary" startIcon={<SearchIcon fontSize="small" />} onClick={handleSearch} fullWidth>
              Search
            </Button>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 1.75 }}>
            <Button variant="outlined" color="inherit" startIcon={<CloseIcon fontSize="small" />} onClick={handleReset} fullWidth>
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2}>
        {PURCHASE_REPORT_ITEMS.map((item) => (
          <Grid key={item.key} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <ReportTypeCard item={item} onOpen={handleOpenReport} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
