import { useEffect, useMemo, useState } from 'react';
import {
  Paper, Box, Autocomplete, TextField, Button, InputAdornment, IconButton, Typography, CircularProgress,
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import QrCodeScannerOutlinedIcon from '@mui/icons-material/QrCodeScannerOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';

import { useGetCustomersPageQuery } from '../../../api/customerApi';
import { useAppSelector } from '../../../app/hooks';
import { selectCurrentUser } from '../../../features/auth/authSlice';
import { WALK_IN_CUSTOMER } from '../lineSaleMockData';
import { getRecentCustomers, addRecentCustomer } from '../recentCustomers';
import useDebouncedValue from '../../../hooks/useDebouncedValue';
import { formatCurrency } from '../../../utils/format';

// Reserved code for the tenant's dedicated Walk-in Customer row (see
// backend/src/modules/customer/customer.service.js) — it's a real Customer
// record now (so sales can reference it), but it should never show up as a
// *search result* here; Walk-in is always offered separately, pinned at the
// top of the list.
const WALKIN_CODE = 'WALKIN';
const MIN_SEARCH_CHARS = 2;

function toOption(row) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    phone: row.mobile ?? row.phone,
    loyaltyPoints: row.loyaltyPoints || 0,
  };
}

/**
 * Single bar above the Current Sale / Bill Summary panels: a live item
 * search (shows matching products as you type — by code or name — and adds
 * the picked one straight to the cart; Enter still adds on an exact/unique
 * match for fast barcode scanning without waiting on the dropdown), the
 * customer search (same Autocomplete logic BillSummaryRow used to render in
 * its own card), a read-only mobile-number display for whichever customer
 * is selected, and "Add Customer".
 */
export default function CustomerSearchBar({
  customer, onSelectCustomer, onAddCustomer, products = [], onAddItemByQuery,
}) {
  const [query, setQuery] = useState('');

  // Products matching the current text, by code or name — capped so the
  // dropdown stays short while the cashier is still typing.
  const productOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q))
      .slice(0, 25);
  }, [products, query]);

  // ---- Customer search (server-side) --------------------------------
  const user = useAppSelector(selectCurrentUser);
  const [customerInput, setCustomerInput] = useState('');
  const debouncedCustomerQuery = useDebouncedValue(customerInput.trim(), 300);
  const searchActive = debouncedCustomerQuery.length >= MIN_SEARCH_CHARS;

  const {
    data: customerPage, isFetching: isSearchingCustomers, isError: customerSearchFailed,
  } = useGetCustomersPageQuery(
    { search: debouncedCustomerQuery, page: 1, pageSize: 15, status: 'ACTIVE' },
    { skip: !searchActive },
  );

  const recentCustomers = useMemo(() => getRecentCustomers(user?.id), [user?.id]);

  // Below the 2-character threshold: Walk-in + the last few customers
  // actually picked (no network call at all). At/above it: Walk-in + the
  // server's own search results (name / mobile / code — see
  // customer.routes.js's searchFields), capped at 15 by the query above and
  // with the reserved Walk-in row itself filtered out so it never appears
  // twice.
  const options = useMemo(() => {
    if (searchActive) {
      const rows = (customerPage?.rows || [])
        .filter((row) => row.code !== WALKIN_CODE)
        .map(toOption);
      return [WALK_IN_CUSTOMER, ...rows];
    }
    return [WALK_IN_CUSTOMER, ...recentCustomers];
  }, [searchActive, customerPage, recentCustomers]);

  // The field is always controlled directly by the parent's "customer" prop
  // (not looked up from "options") — the currently selected customer may
  // well not be present in whatever the last search/recent list happened to
  // contain, and still needs to display correctly.
  const mobileValue = customer?.phone && customer.phone !== '-' ? customer.phone : '';

  // Remember every registered customer actually selected (picked from
  // search, resumed from a held bill, or just created via Add Customer) as
  // a recent — Walk-in itself is excluded inside addRecentCustomer.
  useEffect(() => {
    if (customer?.id && customer.id !== WALK_IN_CUSTOMER.id) {
      addRecentCustomer(user?.id, customer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer?.id]);

  let customerNoOptionsText = 'No matching customers';
  if (!searchActive) customerNoOptionsText = `Type at least ${MIN_SEARCH_CHARS} characters to search`;
  else if (customerSearchFailed) customerNoOptionsText = 'Couldn’t search customers — try again';

  const handleSubmitQuery = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    onAddItemByQuery(trimmed);
    setQuery('');
  };

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, px: 2, py: 1.5 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
          gap: 1.5,
        }}
      >
        <Autocomplete
          size="small"
          fullWidth
          freeSolo
          clearOnBlur={false}
          options={productOptions}
          inputValue={query}
          onInputChange={(_e, value, reason) => {
            // Ignore the 'reset' notification Autocomplete fires right after
            // a selection clears the field below — that would otherwise
            // overwrite the empty string we just set with the old text.
            if (reason === 'reset') return;
            setQuery(value);
          }}
          getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
          isOptionEqualToValue={(option, value) => Boolean(value) && option.code === value.code}
          filterOptions={(opts) => opts}
          value={null}
          onChange={(_e, value) => {
            if (value && typeof value !== 'string') {
              onAddItemByQuery(value.code);
              setQuery('');
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && productOptions.length === 0) {
              e.stopPropagation();
              handleSubmitQuery();
            }
          }}
          noOptionsText="No matching items"
          renderOption={(props, option) => {
            const { key, ...optionProps } = props;
            return (
              <li key={key} {...optionProps}>
                <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <Typography variant="body2" noWrap>{option.name}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {option.code} · {formatCurrency(Number(option.salePrice))} · {option.availableQty} {option.uom} in stock
                  </Typography>
                </Box>
              </li>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              placeholder="Scan Barcode or Search Item name / code"
              slotProps={{
                ...params.slotProps,
                input: {
                  ...params.slotProps?.input,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <>
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={handleSubmitQuery}>
                          <QrCodeScannerOutlinedIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                      {params.slotProps?.input?.endAdornment}
                    </>
                  ),
                },
              }}
            />
          )}
          sx={{ minWidth: 0 }}
        />

        <Autocomplete
          size="small"
          fullWidth
          options={options}
          value={customer || WALK_IN_CUSTOMER}
          loading={searchActive && isSearchingCustomers}
          loadingText="Searching customers…"
          noOptionsText={customerNoOptionsText}
          onChange={(_e, value) => {
            const next = value || WALK_IN_CUSTOMER;
            onSelectCustomer(next);
            // Show the picked name in the box afterward (like an
            // uncontrolled Autocomplete would) instead of leaving whatever
            // search text was last typed.
            setCustomerInput(next.id === WALK_IN_CUSTOMER.id ? '' : next.name);
          }}
          inputValue={customerInput}
          onInputChange={(_e, value, reason) => {
            if (reason === 'reset') return;
            setCustomerInput(value);
          }}
          getOptionLabel={(option) => option?.name || ''}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          // Server already did the filtering (search param) / this is
          // already a short, pre-picked local list (recent customers) — no
          // further client-side filtering on top of either.
          filterOptions={(opts) => opts}
          groupBy={(option) => {
            if (option.id === WALK_IN_CUSTOMER.id) return '';
            return searchActive ? 'Search results' : 'Recent';
          }}
          renderOption={(props, option) => {
            // MUI's Autocomplete puts a `key` field inside `props` itself
            // (separate from React's own key mechanism) — it must be pulled
            // out and passed explicitly rather than left inside the spread,
            // or option clicks can misbehave.
            const { key, ...optionProps } = props;
            return (
              <li key={key} {...optionProps}>
                <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <Typography variant="body2" noWrap>{option.name}</Typography>
                  {option.id !== WALK_IN_CUSTOMER.id && (
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {[option.code, option.phone && option.phone !== '-' ? option.phone : null]
                        .filter(Boolean)
                        .join(' · ')}
                    </Typography>
                  )}
                </Box>
              </li>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              placeholder="Search by name, mobile or code"
              slotProps={{
                ...params.slotProps,
                input: {
                  ...params.slotProps?.input,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <PersonOutlineOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                      {params.slotProps?.input?.startAdornment}
                    </>
                  ),
                  endAdornment: (
                    <>
                      {searchActive && isSearchingCustomers ? (
                        <CircularProgress color="inherit" size={16} sx={{ mr: 1 }} />
                      ) : null}
                      {params.slotProps?.input?.endAdornment}
                    </>
                  ),
                },
              }}
            />
          )}
          sx={{ minWidth: 0 }}
        />

        <TextField
          size="small"
          fullWidth
          placeholder="Mobile Number"
          value={mobileValue}
          slotProps={{
            input: {
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <LocalPhoneOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  +91
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: 0 }}
        />

        <Button
          variant="contained"
          onClick={onAddCustomer}
          sx={{ minWidth: 0 }}
        >
          Add Customer
        </Button>
      </Box>
    </Paper>
  );
}
