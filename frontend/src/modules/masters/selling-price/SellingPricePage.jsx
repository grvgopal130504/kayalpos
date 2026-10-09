import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Button,
  TextField, MenuItem, InputAdornment, IconButton, RadioGroup, FormControlLabel,
  Radio, Pagination, CircularProgress,
} from '@mui/material';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AddIcon from '@mui/icons-material/Add';
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';

import { useAppDispatch } from '../../../app/hooks';
import { logout } from '../../../features/auth/authSlice';
import { showToast } from '../../../features/ui/uiSlice';
import { formatCurrency } from '../../../utils/format';
import FormTextField from '../../../components/form/FormTextField';
import FormSelect from '../../../components/form/FormSelect';
import FormDatePicker from '../../../components/form/FormDatePicker';
import FormSwitch from '../../../components/form/FormSwitch';
import ItemCodeAutocomplete from '../../../components/form/ItemCodeAutocomplete';

import { useGetProductsQuery } from '../../../api/productApi';
import { useGetOutletsQuery } from '../../../api/outletApi';
import { useGetTaxCodesQuery } from '../../../api/taxCodeApi';
import { useGetUomsQuery, useGetUomGroupsQuery } from '../../../api/uomApi';
import {
  useGetSellingPricesPageQuery, useCreateSellingPriceMutation, useUpdateSellingPriceMutation, useDeleteSellingPriceMutation,
} from '../../../api/sellingPriceApi';

import SellingPriceListTable from './components/SellingPriceListTable';
import MarginQuickCalculatorTable from './components/MarginQuickCalculatorTable';
import SellingPriceViewDialog from './components/SellingPriceViewDialog';
import { CASHIER } from '../mastersMockData';
import {
  PRICE_LIST_OPTIONS, ROUNDING_OPTIONS, MARGIN_QUICK_STEPS, PRICING_METHOD_OPTIONS, STATUS_OPTIONS,
} from './sellingPriceMockData';
import {
  sellingPriceFormSchema, sellingPriceDefaultValues, computePricingPreview,
  sellingPriceToFormValues, sellingPriceFormValuesToPayload,
} from './sellingPriceSchema';

const OUTLET_PLACEHOLDER_OPTION = { value: '', label: 'Select Outlet / Branch', disabled: true };
const TAX_CODE_PLACEHOLDER_OPTION = { value: '', label: 'Select Tax Code', disabled: true };

/**
 * Selling Price — the Selling Price master, reached from the Masters
 * page's "Selling Price" card. ALL in one page and one route
 * (`/masters/selling-price`): the list, "New Selling Price" and Edit all
 * live here as one component swapping between a `view: 'list' | 'detail'`
 * state — the same single-page pattern Outlet/Warehouse/Company's own
 * pages use — rather than a separate add/edit route or dialog. The Item &
 * Price Information / Price Effective Period & Applicability / Pricing
 * Calculation / Margin From MRP Quick Calculator cards (the pricing
 * calculator) only render in the detail view; the list view is just the
 * search/filter bar and the Selling Price List table.
 *
 * Wired to the real backend module (see backend/src/modules/selling-price
 * and api/sellingPriceApi.js): picking an item (from the real Product
 * master) auto-fills its MRP/purchase cost/tax code, the Pricing Method
 * radio group switches between a manually-typed Selling Price, "Margin %
 * From MRP" and "Margin % From Cost", and every downstream figure (Margin
 * Amount, Selling Price Excl./Incl. Tax) recomputes live via
 * computePricingPreview as the user types — the server independently
 * recomputes the same figures on save (see sellingPrice.service.js's
 * computePricing) rather than trusting this preview. The Margin Quick
 * Calculator table offers five preset margin percentages against the
 * current MRP. Saving creates/updates a row via the real API and returns to
 * the list, which refetches automatically (RTK Query tag invalidation).
 * Import/Export remain mocked — no bulk endpoint exists for this module yet.
 */
export default function SellingPricePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [view, setView] = useState('list');
  const [activeId, setActiveId] = useState(null); // null = add mode, otherwise editing this row's id
  const isNew = view === 'detail' && !activeId;

  // ---- Pricing Calculator form ------------------------------------------
  const methods = useForm({
    resolver: zodResolver(sellingPriceFormSchema),
    defaultValues: sellingPriceDefaultValues,
    mode: 'onTouched',
  });
  const {
    control, handleSubmit, reset, setValue, formState: { isSubmitting },
  } = methods;

  const [selectedProduct, setSelectedProduct] = useState(null); // full Product row, for the read-only Item Group/Brand/UOM/HSN fields
  const [viewRow, setViewRow] = useState(null);

  const { data: products = [] } = useGetProductsQuery({ status: 'ACTIVE' }, { skip: view !== 'detail' });
  const { data: outlets = [] } = useGetOutletsQuery({ isActive: 'true' }, { skip: view !== 'detail' });
  const { data: taxCodes = [] } = useGetTaxCodesQuery({ status: 'ACTIVE' }, { skip: view !== 'detail' });
  const { data: uoms = [] } = useGetUomsQuery({ status: 'ACTIVE' }, { skip: view !== 'detail' });

  const { data: uomGroups = [] } = useGetUomGroupsQuery({ status: 'ACTIVE' }, { skip: view !== 'detail' });

  // UOM / UOM Group dropdowns — both fed by the UOM master. Picking a
  // product pre-selects its UOM (and that UOM's group); the UOM list is
  // narrowed to the chosen group. Not part of the saved SellingPrice payload
  // (the price is per item, whose UOM is owned by the Product master).
  const [uomGroupId, setUomGroupId] = useState('');
  const [uomCode, setUomCode] = useState('');
  useEffect(() => {
    const code = selectedProduct?.uom || '';
    setUomCode(code);
    setUomGroupId(uoms.find((u) => u.code === code)?.groupId || '');
  }, [selectedProduct, uoms]);

  const uomGroupOptions = useMemo(() => [
    { value: '', label: 'Select UOM Group', disabled: true },
    ...uomGroups.map((g) => ({ value: g.id, label: g.name })),
  ], [uomGroups]);
  const uomOptions = useMemo(() => [
    { value: '', label: 'Select UOM', disabled: true },
    ...uoms
      .filter((u) => !uomGroupId || u.groupId === uomGroupId)
      .map((u) => ({ value: u.code, label: u.code })),
  ], [uoms, uomGroupId]);

  const handleUomGroupChange = (groupId) => {
    setUomGroupId(groupId);
    const current = uoms.find((u) => u.code === uomCode);
    if (current && current.groupId !== groupId) setUomCode('');
  };
  const handleUomChange = (code) => {
    setUomCode(code);
    const matched = uoms.find((u) => u.code === code);
    if (matched?.groupId) setUomGroupId(matched.groupId);
  };

  const outletOptions = useMemo(() => [
    OUTLET_PLACEHOLDER_OPTION,
    ...outlets.map((o) => ({ value: o.id, label: o.name })),
  ], [outlets]);
  const taxCodeOptions = useMemo(() => [
    TAX_CODE_PLACEHOLDER_OPTION,
    ...taxCodes.map((t) => ({ value: t.name, label: `${t.name} (${Number(t.rate)}%)` })),
  ], [taxCodes]);

  const [createSellingPrice] = useCreateSellingPriceMutation();
  const [updateSellingPrice] = useUpdateSellingPriceMutation();
  const [deleteSellingPrice] = useDeleteSellingPriceMutation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setValue('productId', product.id, { shouldValidate: true, shouldDirty: true });
    setValue('mrp', product.mrp != null ? String(product.mrp) : '', { shouldValidate: true });
    setValue('purchaseCost', product.salePrice != null ? String(product.salePrice) : '', { shouldValidate: true });
    const matchedTaxCode = taxCodes.find((t) => t.name === product.taxCode);
    setValue('taxCode', matchedTaxCode ? matchedTaxCode.name : '');
    setValue('taxRate', matchedTaxCode ? String(matchedTaxCode.rate) : '0');
  };

  const handleTaxCodeChange = (value) => {
    setValue('taxCode', value);
    const matched = taxCodes.find((t) => t.name === value);
    setValue('taxRate', matched ? String(matched.rate) : '0');
  };

  // Live snapshot of every form value, so the read-only Margin Amount /
  // Selling Price fields (not RHF-managed themselves) recompute on every
  // keystroke via computePricingPreview.
  const liveValues = useWatch({ control });
  const preview = computePricingPreview(liveValues);
  const mrpNum = Number(liveValues.mrp) || 0;
  const taxRateNum = Number(liveValues.taxRate) || 0;

  // ---- Navigation between the list and the calculator (detail) view -----
  const goToList = () => {
    setView('list');
    setActiveId(null);
  };
  const openNewSellingPrice = () => {
    reset(sellingPriceDefaultValues);
    setSelectedProduct(null);
    setActiveId(null);
    setView('detail');
  };
  const openSellingPrice = (row) => {
    setActiveId(row.id);
    setSelectedProduct(row.product || null);
    reset(sellingPriceToFormValues(row));
    setView('detail');
  };

  const handleApplyMargin = (step) => {
    setValue('pricingMethod', 'MARGIN_FROM_MRP', { shouldValidate: true });
    setValue('marginPercent', step.toFixed(2), { shouldValidate: true });
  };

  const handleSearchItem = () => dispatch(showToast('Use the Item field below to search by code or name', 'info'));
  const handleImport = () => dispatch(showToast('Import Selling Prices is coming soon', 'info'));
  const handleExport = () => dispatch(showToast('Export Selling Prices is coming soon', 'info'));

  const saveSellingPrice = async (values) => {
    const payload = sellingPriceFormValuesToPayload(values);
    if (activeId) {
      await updateSellingPrice({ id: activeId, ...payload }).unwrap();
      dispatch(showToast('Selling price updated successfully', 'success'));
    } else {
      await createSellingPrice(payload).unwrap();
      dispatch(showToast('Selling price saved successfully', 'success'));
    }
  };

  // Save — persists then returns to the list, same as every other master's
  // Save action here (Product's dialog, Outlet/Warehouse's detail view).
  const onSubmit = handleSubmit(async (values) => {
    try {
      await saveSellingPrice(values);
      goToList();
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to save selling price', 'error'));
    }
  });

  // Save & New — persists, then stays in the detail view with a blank
  // calculator for rapid back-to-back entry instead of returning to the list.
  const handleSaveAndNew = handleSubmit(async (values) => {
    try {
      await saveSellingPrice(values);
      openNewSellingPrice();
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to save selling price', 'error'));
    }
  });

  const handleCancel = () => {
    goToList();
    dispatch(showToast('Changes discarded', 'info'));
  };

  // ---- Selling Price List -------------------------------------------------
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [listStatus, setListStatus] = useState('All');
  const [page, setPage] = useState(1);

  const listQueryParams = {
    search: appliedSearch || undefined,
    status: listStatus !== 'All' ? listStatus.toUpperCase() : undefined,
    page,
    pageSize: 10,
  };
  const {
    data: listData, isFetching: isListFetching, isError: isListError,
  } = useGetSellingPricesPageQuery(listQueryParams);
  const rows = listData?.rows || [];
  const meta = listData?.meta || { total: 0, totalPages: 1 };

  const handleSearch = () => { setAppliedSearch(searchInput.trim()); setPage(1); };
  const handleFilters = () => {
    setListStatus((prev) => (prev === 'All' ? 'Active' : (prev === 'Active' ? 'Inactive' : 'All')));
    setPage(1);
    dispatch(showToast('Cycled the Status filter (All → Active → Inactive)', 'info'));
  };

  const handleViewRow = (row) => setViewRow(row);
  const handleEditRow = (row) => { setViewRow(null); openSellingPrice(row); };
  const handleDeleteRow = async (row) => {
    if (!window.confirm(`Delete the selling price for "${row.product?.name}"? This cannot be undone.`)) return;
    try {
      await deleteSellingPrice(row.id).unwrap();
      dispatch(showToast(`Selling price for ${row.product?.name} deleted`, 'success'));
    } catch (err) {
      dispatch(showToast(err?.data?.message || 'Failed to delete selling price', 'error'));
    }
  };

  useEffect(() => {
    if (page > meta.totalPages) setPage(Math.max(1, meta.totalPages));
  }, [meta.totalPages, page]);

  const HeaderBar = ({ crumb }) => (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Selling Price</Typography>
        <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
          <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
          <MuiLink component={RouterLink} to="/masters" underline="hover" color="text.secondary">Masters</MuiLink>
          {view === 'list' ? (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Selling Price</Typography>
          ) : (
            <MuiLink component="button" type="button" underline="hover" color="text.secondary" onClick={goToList}>
              Selling Price
            </MuiLink>
          )}
          {crumb && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{crumb}</Typography>}
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
  );

  // Selling Price List card — shared by the list view and, per the design,
  // shown beneath the pricing calculator in the detail view too.
  const listPanel = (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Selling Price List</Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            placeholder="Search item or price list..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
          />
          <Button variant="outlined" color="inherit" startIcon={<FilterListIcon fontSize="small" />} onClick={handleFilters}>
            {listStatus === 'All' ? 'Filters' : `Status: ${listStatus}`}
          </Button>
        </Stack>
      </Stack>

      {isListError ? (
        <Typography variant="body2" sx={{ color: 'error.main', textAlign: 'center', py: 3 }}>
          Failed to load selling prices. Please try again.
        </Typography>
      ) : (
        <SellingPriceListTable
          rows={rows}
          loading={isListFetching && rows.length === 0}
          onViewRow={handleViewRow}
          onEditRow={handleEditRow}
          onDeleteRow={handleDeleteRow}
        />
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Showing {rows.length ? (page - 1) * 10 + 1 : 0} to {(page - 1) * 10 + rows.length} of {meta.total} records
        </Typography>
        <Pagination
          count={meta.totalPages}
          page={page}
          onChange={(_e, value) => setPage(value)}
          color="primary"
          shape="rounded"
        />
      </Stack>
    </Paper>
  );

  // ---- List view -----------------------------------------------------------
  if (view === 'list') {
    return (
      <Stack spacing={2}>
        <HeaderBar />

        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'stretch', lg: 'center' }, justifyContent: 'flex-end' }}>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
            <Button variant="contained" color="primary" startIcon={<AddIcon fontSize="small" />} onClick={openNewSellingPrice}>
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

        {listPanel}

        <SellingPriceViewDialog
          open={Boolean(viewRow)}
          row={viewRow}
          onClose={() => setViewRow(null)}
          onEdit={() => handleEditRow(viewRow)}
        />
      </Stack>
    );
  }

  // ---- Detail view: the pricing calculator (New / Edit) --------------------
  return (
    <Stack spacing={2}>
      <HeaderBar crumb={isNew ? 'New Selling Price' : 'Edit Selling Price'} />

      <FormProvider {...methods}>
        <form onSubmit={onSubmit} noValidate>
          <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Grid size={{ xs: 12, lg: 5 }}>
              <Stack spacing={2}>
                <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>Item &amp; Price Information</Typography>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <ItemCodeAutocomplete
                          control={control}
                          name="productCode"
                          products={products}
                          onSelectProduct={handleSelectProduct}
                          placeholder="Search Item Code / Name *"
                        />
                      </Box>
                      <IconButton onClick={handleSearchItem} sx={{ mt: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }} aria-label="Search item">
                        <SearchIcon fontSize="small" />
                      </IconButton>
                    </Stack>

                    <TextField label="Item Code / Barcode" value={selectedProduct?.code || ''} disabled fullWidth slotProps={{ input: { readOnly: true } }} />
                    <TextField label="Item Group / Category" value={selectedProduct?.group || ''} disabled fullWidth slotProps={{ input: { readOnly: true } }} />
                    <TextField label="Brand" value={selectedProduct?.brand || ''} disabled fullWidth slotProps={{ input: { readOnly: true } }} />

                    <Stack direction="row" spacing={1.5}>
                      <TextField select label="UOM" value={uomCode} onChange={(e) => handleUomChange(e.target.value)} fullWidth>
                        {uomOptions.map((opt) => <MenuItem key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</MenuItem>)}
                      </TextField>
                      <TextField select label="UOM Group" value={uomGroupId} onChange={(e) => handleUomGroupChange(e.target.value)} fullWidth>
                        {uomGroupOptions.map((opt) => <MenuItem key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</MenuItem>)}
                      </TextField>
                    </Stack>

                    <FormSelect name="priceList" label="Price List *" options={PRICE_LIST_OPTIONS} />

                    <Stack direction="row" spacing={1.5}>
                      <Box sx={{ flex: 1 }}>
                        <TextField
                          select
                          label="Tax Code"
                          value={liveValues.taxCode || ''}
                          onChange={(e) => handleTaxCodeChange(e.target.value)}
                          fullWidth
                        >
                          {taxCodeOptions.map((opt) => <MenuItem key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</MenuItem>)}
                        </TextField>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <TextField label="HSN/SAC" value={selectedProduct?.hsnSac || ''} disabled fullWidth slotProps={{ input: { readOnly: true } }} />
                      </Box>
                    </Stack>
                  </Stack>
                </Paper>

                <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, bgcolor: 'rgba(37,99,235,0.05)', borderColor: 'rgba(37,99,235,0.18)' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>Price Effective Period &amp; Applicability</Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormDatePicker name="effectiveFrom" label="Effective From *" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormDatePicker name="effectiveTo" label="Effective To" />
                    </Grid>
                    <Grid size={12}>
                      <FormSelect name="outletId" label="Outlet / Branch *" options={outletOptions} />
                    </Grid>
                  </Grid>

                </Paper>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Status</Typography>
                  <RadioGroup
                    row
                    value={liveValues.status || 'Active'}
                    onChange={(e) => setValue('status', e.target.value, { shouldValidate: true })}
                  >
                    <FormControlLabel value="Active" control={<Radio size="small" />} label="Active" />
                    <FormControlLabel value="Inactive" control={<Radio size="small" />} label="Inactive" />
                  </RadioGroup>
                </Stack>
                <FormSwitch name="approvalRequired" label="Approval Required" labelPlacement="start" />
              </Stack>

              <Stack direction="row" spacing={1.5} sx={{ mt: 2.5, flexWrap: 'wrap' }} useFlexGap>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={isSubmitting ? <CircularProgress size={14} color="inherit" /> : <SaveOutlinedIcon fontSize="small" />}
                  disabled={isSubmitting}
                >
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  color="primary"
                  startIcon={<SaveOutlinedIcon fontSize="small" />}
                  onClick={handleSaveAndNew}
                  disabled={isSubmitting}
                >
                  Save &amp; New
                </Button>
                <Button type="button" variant="outlined" color="inherit" startIcon={<CloseIcon fontSize="small" />} onClick={handleCancel}>
                  Cancel
                </Button>
              </Stack>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 7 }}>
              <Stack spacing={2}>
                <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>Pricing Calculation</Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormTextField
                        name="mrp"
                        label="MRP (Inclusive of Tax) *"
                        slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormTextField
                        name="purchaseCost"
                        label="Purchase Cost (Last) *"
                        slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Pricing Method *</Typography>
                    <RadioGroup
                      row
                      value={liveValues.pricingMethod || 'MARGIN_FROM_MRP'}
                      onChange={(e) => setValue('pricingMethod', e.target.value, { shouldValidate: true })}
                    >
                      {PRICING_METHOD_OPTIONS.map((opt) => (
                        <FormControlLabel key={opt.value} value={opt.value} control={<Radio size="small" />} label={opt.label} />
                      ))}
                    </RadioGroup>
                  </Box>

                  {/* One 5 / 2 / 5 grid for every row below Pricing Method so the right-hand
                      fields (Margin Amount, Selling Price Incl. Tax, Price Update Reason)
                      all start at the same x, with even vertical spacing between rows. */}
                  <Grid container spacing={2.5} sx={{ mt: 1, alignItems: 'flex-start' }}>
                    <Grid size={{ xs: 5 }}>
                      <FormTextField
                        name="marginPercent"
                        label="Margin %"
                        disabled={liveValues.pricingMethod === 'FIXED'}
                        slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 2 }} sx={{ textAlign: 'center', pt: 2 }}>
                      <Typography variant="h6" sx={{ color: 'text.secondary' }}>→</Typography>
                    </Grid>
                    <Grid size={{ xs: 5 }}>
                      <TextField
                        label="Margin Amount"
                        value={preview.marginAmount.toFixed(2)}
                        disabled
                        fullWidth
                        slotProps={{ input: { readOnly: true, startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                      />
                    </Grid>

                    <Grid size={{ xs: 5 }}>
                      {liveValues.pricingMethod === 'FIXED' ? (
                        <FormTextField
                          name="fixedSellingPrice"
                          label="Selling Price (Excl. Tax) *"
                          slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                        />
                      ) : (
                        <TextField
                          label="Selling Price (Excl. Tax)"
                          value={preview.sellingPriceExclTax.toFixed(2)}
                          disabled
                          fullWidth
                          slotProps={{ input: { readOnly: true, startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                        />
                      )}
                    </Grid>
                    <Grid size={{ xs: 2 }} />
                    <Grid size={{ xs: 5 }}>
                      <TextField
                        label="Selling Price (Incl. Tax)"
                        value={preview.sellingPriceInclTax.toFixed(2)}
                        disabled
                        fullWidth
                        slotProps={{ input: { readOnly: true, startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                      />
                      <Typography variant="caption" sx={{ color: 'primary.main', display: 'block', mt: 0.5 }}>
                        (Tax {taxRateNum}% = {formatCurrency(preview.taxAmount, { decimals: true })})
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 5 }}>
                      <FormSelect name="rounding" label="Rounding" options={ROUNDING_OPTIONS} />
                    </Grid>
                    <Grid size={{ xs: 2 }} />
                    <Grid size={{ xs: 5 }}>
                      <FormTextField name="priceUpdateReason" label="Price Update Reason" placeholder="e.g. Seasonal offer" />
                    </Grid>
                  </Grid>
                </Paper>

                <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>Margin From MRP Quick Calculator</Typography>
                  <MarginQuickCalculatorTable
                    mrp={mrpNum}
                    taxRate={taxRateNum}
                    steps={MARGIN_QUICK_STEPS}
                    selectedMargin={liveValues.pricingMethod === 'MARGIN_FROM_MRP' ? (Number(liveValues.marginPercent) || null) : null}
                    onApplyMargin={handleApplyMargin}
                  />
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </FormProvider>

      {listPanel}

      <SellingPriceViewDialog
        open={Boolean(viewRow)}
        row={viewRow}
        onClose={() => setViewRow(null)}
        onEdit={() => handleEditRow(viewRow)}
      />
    </Stack>
  );
}
