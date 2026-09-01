import { useMemo, useRef, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Button,
  TextField, MenuItem, InputAdornment, IconButton, RadioGroup, FormControlLabel,
  Radio, Switch, Pagination,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddIcon from '@mui/icons-material/Add';
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';

import { useAppDispatch } from '../../../app/hooks';
import { logout } from '../../../features/auth/authSlice';
import { showToast } from '../../../features/ui/uiSlice';
import { formatCurrency } from '../../../utils/format';

import SellingPriceListTable from './components/SellingPriceListTable';
import MarginQuickCalculatorTable from './components/MarginQuickCalculatorTable';
import SellingPriceViewDialog from './components/SellingPriceViewDialog';
import { CASHIER } from '../mastersMockData';
import {
  ITEM_OPTIONS, PRICE_LIST_OPTIONS, TAX_CODE_OPTIONS, OUTLET_OPTIONS, ROUNDING_OPTIONS,
  MARGIN_QUICK_STEPS, SELLING_PRICES,
} from './sellingPriceMockData';

function toNumber(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Converts a native <input type="date"> value ("YYYY-MM-DD") into this
// page's "DD-Mon-YYYY" display format (e.g. "01-Sep-2026").
function formatDdMonYyyy(isoValue) {
  if (!isoValue) return '';
  const [y, m, d] = isoValue.split('-');
  const monthIndex = Number(m) - 1;
  if (monthIndex < 0 || monthIndex > 11) return '';
  return `${d}-${MONTH_ABBR[monthIndex]}-${y}`;
}

/**
 * Selling Price — the Selling Price master's calculator + list screen,
 * reached from the Masters page's "Selling Price" card. Unlike the other
 * masters, this page is a live pricing calculator: picking an item
 * auto-fills its MRP/cost/tax, the Pricing Method radio group switches
 * between a manually-typed Selling Price, "Margin % From MRP" (MRP minus
 * a margin), and "Margin % From Cost" (purchase cost plus a margin), and
 * every downstream figure (Margin Amount, Selling Price Excl./Incl. Tax)
 * recomputes on every keystroke. The Margin Quick Calculator table offers
 * five preset margin percentages against the current MRP — clicking one
 * applies it to the calculator. Saving appends/updates the Selling Price
 * List below; there's no Selling Price backend module yet, so everything
 * (including Import/Export and the item search button) is mocked.
 */
export default function SellingPricePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [rows, setRows] = useState(SELLING_PRICES);
  const [page, setPage] = useState(1);

  const [selectedItemValue, setSelectedItemValue] = useState(ITEM_OPTIONS[0].value);
  const item = ITEM_OPTIONS.find((i) => i.value === selectedItemValue) || ITEM_OPTIONS[0];

  const [priceList, setPriceList] = useState('Main Outlet Price List');
  const [taxCode, setTaxCode] = useState(item.taxCode);
  const [mrp, setMrp] = useState(item.mrp);
  const [purchaseCost, setPurchaseCost] = useState(item.purchaseCost);

  const [pricingMethod, setPricingMethod] = useState('marginFromMrp');
  const [marginPercent, setMarginPercent] = useState('10.00');
  const [fixedSellingPrice, setFixedSellingPrice] = useState('270.00');
  const [rounding, setRounding] = useState('Round to 2 Decimal');
  const [priceUpdateReason, setPriceUpdateReason] = useState('Seasonal offer - 10% margin from MRP');

  const [effectiveFrom, setEffectiveFrom] = useState('01-Sep-2026');
  const [effectiveTo, setEffectiveTo] = useState('31-Dec-2026');
  const effectiveFromNativeRef = useRef(null);
  const effectiveToNativeRef = useRef(null);
  const [outletBranch, setOutletBranch] = useState('Main Outlet');
  const [status, setStatus] = useState('Active');
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [viewRow, setViewRow] = useState(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleItemChange = (value) => {
    setSelectedItemValue(value);
    const nextItem = ITEM_OPTIONS.find((i) => i.value === value);
    if (nextItem) {
      setMrp(nextItem.mrp);
      setPurchaseCost(nextItem.purchaseCost);
      setTaxCode(nextItem.taxCode);
    }
  };

  const taxRate = TAX_CODE_OPTIONS.find((t) => t.value === taxCode)?.rate ?? 0;
  const mrpNum = toNumber(mrp);
  const purchaseCostNum = toNumber(purchaseCost);
  const marginPercentNum = toNumber(marginPercent);

  let marginAmount = 0;
  let sellingExclTax = 0;
  if (pricingMethod === 'fixed') {
    sellingExclTax = toNumber(fixedSellingPrice);
    marginAmount = mrpNum - sellingExclTax;
  } else if (pricingMethod === 'marginFromCost') {
    marginAmount = (purchaseCostNum * marginPercentNum) / 100;
    sellingExclTax = purchaseCostNum + marginAmount;
  } else {
    marginAmount = (mrpNum * marginPercentNum) / 100;
    sellingExclTax = mrpNum - marginAmount;
  }
  const sellingInclTax = sellingExclTax * (1 + taxRate / 100);
  const taxAmount = sellingInclTax - sellingExclTax;

  const handleApplyMargin = (step) => {
    setPricingMethod('marginFromMrp');
    setMarginPercent(step.toFixed(2));
  };

  const pricingMethodLabel = pricingMethod === 'fixed'
    ? 'Fixed Selling Price'
    : pricingMethod === 'marginFromCost' ? 'Margin % From Cost' : 'Margin % From MRP';

  const handleSearchItem = () => dispatch(showToast('Item search is coming soon', 'info'));
  // "New Selling Price" resets the calculator (below) back to add-mode
  // defaults for the mocked item — there's only one item in the picker's
  // mock data, so the calculator itself doubles as this master's add
  // form rather than a separate dialog duplicating it.
  const handleNewSellingPrice = () => {
    handleItemChange(ITEM_OPTIONS[0].value);
    setPriceList('Main Outlet Price List');
    setPricingMethod('marginFromMrp');
    setMarginPercent('10.00');
    setFixedSellingPrice('270.00');
    setPriceUpdateReason('');
    setStatus('Active');
    dispatch(showToast('Ready to add a new selling price', 'info'));
  };
  const handleImport = () => dispatch(showToast('Import Selling Prices is coming soon', 'info'));
  const handleExport = () => dispatch(showToast('Export Selling Prices is coming soon', 'info'));
  const handleFilters = () => dispatch(showToast('Filters are coming soon', 'info'));
  const handleViewRow = (row) => setViewRow(row);
  // Loads the row's values back into the Pricing Calculator above the
  // list so editing reuses that same live-recalculating form instead of
  // a second, disconnected dialog.
  const handleEditRow = (row) => {
    setViewRow(null);
    setPriceList(row.priceList);
    setMrp(row.mrp.toFixed(2));
    setEffectiveFrom(row.effectiveFrom);
    setStatus(row.status);
    if (row.pricingMethod === 'Fixed Selling Price') {
      setPricingMethod('fixed');
      setFixedSellingPrice(row.sellingPriceExclTax.toFixed(2));
    } else if (row.pricingMethod === 'Margin % From Cost') {
      setPricingMethod('marginFromCost');
      setMarginPercent(row.marginPercent.toFixed(2));
    } else {
      setPricingMethod('marginFromMrp');
      setMarginPercent(row.marginPercent.toFixed(2));
    }
    dispatch(showToast(`Editing ${row.itemName} — update values below and Save`, 'info'));
  };
  const handleDeleteRow = (row) => setRows((prev) => prev.filter((r) => r.itemCode !== row.itemCode));

  const buildRecord = () => ({
    itemCode: item.itemCode,
    itemName: item.label,
    priceList,
    mrp: mrpNum,
    pricingMethod: pricingMethodLabel,
    marginPercent: pricingMethod === 'fixed' ? 0 : marginPercentNum,
    sellingPriceExclTax: sellingExclTax,
    sellingPriceInclTax: sellingInclTax,
    effectiveFrom,
    status,
  });

  const handleSave = () => {
    const record = buildRecord();
    setRows((prev) => {
      const exists = prev.some((r) => r.itemCode === record.itemCode);
      return exists ? prev.map((r) => (r.itemCode === record.itemCode ? record : r)) : [...prev, record];
    });
    dispatch(showToast(`Selling price for ${item.label} saved`, 'success'));
  };
  const handleSaveAndNew = () => {
    handleSave();
    setMarginPercent('10.00');
    setPriceUpdateReason('');
  };
  const handleCancel = () => dispatch(showToast('Changes discarded', 'info'));

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Selling Price</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/masters" underline="hover" color="text.secondary">Masters</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Selling Price</Typography>
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
          <Typography variant="body2">
            Define and manage selling price for items. Choose pricing method and set margin to calculate selling price automatically.
          </Typography>
        </Paper>

        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
          <Button variant="contained" color="primary" startIcon={<AddIcon fontSize="small" />} onClick={handleNewSellingPrice}>
            New Selling Price
          </Button>
          <Button variant="outlined" color="primary" startIcon={<MoveToInboxOutlinedIcon fontSize="small" />} onClick={handleImport}>
            Import
          </Button>
          <Button variant="outlined" color="primary" startIcon={<FileUploadOutlinedIcon fontSize="small" />} onClick={handleExport}>
            Export
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>Item &amp; Price Information</Typography>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                  <TextField
                    select
                    label="Item *"
                    value={selectedItemValue}
                    onChange={(e) => handleItemChange(e.target.value)}
                    fullWidth
                  >
                    {ITEM_OPTIONS.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                  </TextField>
                  <IconButton onClick={handleSearchItem} sx={{ mt: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }} aria-label="Search item">
                    <SearchIcon fontSize="small" />
                  </IconButton>
                </Stack>

                <TextField label="Item Code / Barcode" value={item.itemCode} disabled fullWidth slotProps={{ input: { readOnly: true } }} />
                <TextField label="Item Group / Category" value={item.itemGroup} disabled fullWidth select slotProps={{ input: { readOnly: true } }}>
                  <MenuItem value={item.itemGroup}>{item.itemGroup}</MenuItem>
                </TextField>
                <TextField label="Brand" value={item.brand} disabled fullWidth select slotProps={{ input: { readOnly: true } }}>
                  <MenuItem value={item.brand}>{item.brand}</MenuItem>
                </TextField>

                <Stack direction="row" spacing={1.5}>
                  <TextField label="UOM" value={item.uom} disabled fullWidth select slotProps={{ input: { readOnly: true } }}>
                    <MenuItem value={item.uom}>{item.uom}</MenuItem>
                  </TextField>
                  <TextField label="UOM Group" value={item.uomGroup} disabled fullWidth slotProps={{ input: { readOnly: true } }} />
                </Stack>

                <TextField select label="Price List *" value={priceList} onChange={(e) => setPriceList(e.target.value)} fullWidth>
                  {PRICE_LIST_OPTIONS.map((opt) => <MenuItem key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</MenuItem>)}
                </TextField>

                <Stack direction="row" spacing={1.5}>
                  <TextField select label="Tax Code" value={taxCode} onChange={(e) => setTaxCode(e.target.value)} fullWidth>
                    {TAX_CODE_OPTIONS.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                  </TextField>
                  <TextField label="HSN/SAC" value={item.hsnSac} disabled fullWidth slotProps={{ input: { readOnly: true } }} />
                </Stack>
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>Price Effective Period &amp; Applicability</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Effective From *"
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
                              aria-label="Open Effective From date picker"
                              onClick={() => (effectiveFromNativeRef.current?.showPicker?.() ?? effectiveFromNativeRef.current?.click())}
                            >
                              <CalendarTodayOutlinedIcon fontSize="small" />
                            </IconButton>
                            <input
                              ref={effectiveFromNativeRef}
                              type="date"
                              onChange={(e) => setEffectiveFrom(formatDdMonYyyy(e.target.value))}
                              style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
                            />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Effective To"
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
                              aria-label="Open Effective To date picker"
                              onClick={() => (effectiveToNativeRef.current?.showPicker?.() ?? effectiveToNativeRef.current?.click())}
                            >
                              <CalendarTodayOutlinedIcon fontSize="small" />
                            </IconButton>
                            <input
                              ref={effectiveToNativeRef}
                              type="date"
                              onChange={(e) => setEffectiveTo(formatDdMonYyyy(e.target.value))}
                              style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
                            />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField select label="Outlet / Branch *" value={outletBranch} onChange={(e) => setOutletBranch(e.target.value)} fullWidth>
                    {OUTLET_OPTIONS.map((opt) => <MenuItem key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</MenuItem>)}
                  </TextField>
                </Grid>
              </Grid>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mt: 2 }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Status</Typography>
                  <RadioGroup row value={status} onChange={(e) => setStatus(e.target.value)}>
                    <FormControlLabel value="Active" control={<Radio size="small" />} label="Active" />
                    <FormControlLabel value="Inactive" control={<Radio size="small" />} label="Inactive" />
                  </RadioGroup>
                </Stack>
                <FormControlLabel
                  control={<Switch checked={approvalRequired} onChange={(e) => setApprovalRequired(e.target.checked)} />}
                  label="Approval Required"
                  labelPlacement="start"
                />
              </Stack>

              <Stack direction="row" spacing={1.5} sx={{ mt: 2.5, flexWrap: 'wrap' }} useFlexGap>
                <Button variant="contained" color="primary" startIcon={<SaveOutlinedIcon fontSize="small" />} onClick={handleSave}>
                  Save
                </Button>
                <Button variant="outlined" color="primary" startIcon={<SaveOutlinedIcon fontSize="small" />} onClick={handleSaveAndNew}>
                  Save &amp; New
                </Button>
                <Button variant="outlined" color="inherit" startIcon={<CloseIcon fontSize="small" />} onClick={handleCancel}>
                  Cancel
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>Pricing Calculation</Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="MRP (Inclusive of Tax)"
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                    fullWidth
                    slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Purchase Cost (Last)"
                    value={purchaseCost}
                    onChange={(e) => setPurchaseCost(e.target.value)}
                    fullWidth
                    slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Pricing Method *</Typography>
                <RadioGroup row value={pricingMethod} onChange={(e) => setPricingMethod(e.target.value)}>
                  <FormControlLabel value="fixed" control={<Radio size="small" />} label="Fixed Selling Price" />
                  <FormControlLabel value="marginFromMrp" control={<Radio size="small" />} label="Margin % From MRP" />
                  <FormControlLabel value="marginFromCost" control={<Radio size="small" />} label="Margin % From Cost" />
                </RadioGroup>
              </Box>

              <Grid container spacing={2} sx={{ mt: 0.5, alignItems: 'center' }}>
                <Grid size={{ xs: 5, sm: 5 }}>
                  <TextField
                    label="Margin %"
                    value={pricingMethod === 'fixed' ? '' : marginPercent}
                    onChange={(e) => setMarginPercent(e.target.value)}
                    disabled={pricingMethod === 'fixed'}
                    fullWidth
                    slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
                  />
                </Grid>
                <Grid size={{ xs: 2, sm: 2 }} sx={{ textAlign: 'center', pt: 2 }}>
                  <Typography variant="h6" sx={{ color: 'text.secondary' }}>→</Typography>
                </Grid>
                <Grid size={{ xs: 5, sm: 5 }}>
                  <TextField
                    label="Margin Amount"
                    value={marginAmount.toFixed(2)}
                    disabled
                    fullWidth
                    slotProps={{ input: { readOnly: true, startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Selling Price (Excl. Tax)"
                    value={sellingExclTax.toFixed(2)}
                    onChange={pricingMethod === 'fixed' ? (e) => setFixedSellingPrice(e.target.value) : undefined}
                    disabled={pricingMethod !== 'fixed'}
                    fullWidth
                    slotProps={{ input: { readOnly: pricingMethod !== 'fixed', startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Selling Price (Incl. Tax)"
                    value={sellingInclTax.toFixed(2)}
                    disabled
                    fullWidth
                    slotProps={{ input: { readOnly: true, startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                  />
                  <Typography variant="caption" sx={{ color: 'primary.main', display: 'block', mt: 0.5 }}>
                    (Tax {taxRate}% = {formatCurrency(taxAmount, { decimals: true })})
                  </Typography>
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField select label="Rounding" value={rounding} onChange={(e) => setRounding(e.target.value)} fullWidth>
                    {ROUNDING_OPTIONS.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Price Update Reason"
                    value={priceUpdateReason}
                    onChange={(e) => setPriceUpdateReason(e.target.value)}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>Margin From MRP Quick Calculator</Typography>
              <MarginQuickCalculatorTable
                mrp={mrpNum}
                taxRate={taxRate}
                steps={MARGIN_QUICK_STEPS}
                selectedMargin={pricingMethod === 'marginFromMrp' ? marginPercentNum : null}
                onApplyMargin={handleApplyMargin}
              />
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Selling Price List</Typography>
          <Stack direction="row" spacing={1}>
            <TextField size="small" placeholder="Search..." slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }} />
            <Button variant="outlined" color="inherit" startIcon={<FilterListIcon fontSize="small" />} onClick={handleFilters}>
              Filters
            </Button>
          </Stack>
        </Stack>

        <SellingPriceListTable rows={rows} onViewRow={handleViewRow} onEditRow={handleEditRow} onDeleteRow={handleDeleteRow} />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Showing {rows.length ? 1 : 0} to {rows.length} of {rows.length} records
          </Typography>
          <Pagination count={1} page={page} onChange={(_e, value) => setPage(value)} color="primary" shape="rounded" />
        </Stack>
      </Paper>

      <SellingPriceViewDialog
        open={Boolean(viewRow)}
        row={viewRow}
        onClose={() => setViewRow(null)}
        onEdit={() => handleEditRow(viewRow)}
      />
    </Stack>
  );
}
