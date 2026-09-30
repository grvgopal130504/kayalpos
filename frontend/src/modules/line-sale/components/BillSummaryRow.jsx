import { useMemo } from 'react';
import {
  Paper, Stack, Box, Typography, IconButton, Grid, Autocomplete, TextField,
} from '@mui/material';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import AddIcon from '@mui/icons-material/Add';

import { useGetCustomersQuery } from '../../../api/customerApi';

export const WALK_IN_CUSTOMER = { id: 'walk-in', name: 'Walk-in Customer', phone: '-', loyaltyPoints: 0 };

/**
 * Top info strip above the item/cart panels: current customer — now a
 * type-to-search Autocomplete over the real Customer list (filtered by name,
 * mobile or code) instead of a static name, with "Walk-in Customer" always
 * offered as the default option — plus a shortcut to add a brand new
 * customer, on the left; bill metadata (bill no / cashier / date-time) on
 * the right. Split into two Paper cards so it visually matches the
 * reference instead of one continuous bar.
 */
export default function BillSummaryRow({
  customer, billNo, cashierName, dateTime, onAddCustomer, onSelectCustomer,
}) {
  const { data: customerRows = [] } = useGetCustomersQuery({});

  // Normalize the real API rows (code/name/mobile/loyaltyPoints) onto the
  // same {name, phone, loyaltyPoints} shape the rest of Line Sale's customer
  // state already uses, so selecting from the list or falling back to
  // Walk-in Customer both hand the parent the same kind of object.
  const options = useMemo(
    () => [
      WALK_IN_CUSTOMER,
      ...customerRows.map((row) => ({
        id: row.id,
        code: row.code,
        name: row.name,
        phone: row.mobile,
        loyaltyPoints: row.loyaltyPoints || 0,
      })),
    ],
    [customerRows],
  );

  // Match by id (falling back to name only for a customer that was just
  // created locally and doesn't have an id yet) — matching by name alone is
  // fragile once two customers can share a display name.
  const selectedOption = useMemo(
    () => options.find((opt) => (customer?.id ? opt.id === customer.id : opt.name === customer?.name))
      || WALK_IN_CUSTOMER,
    [options, customer],
  );

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 5, md: 4 }}>
        <Paper variant="outlined" sx={{ borderRadius: 3, p: 2, height: '100%' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Customer</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.5 }}>
            <Box
              sx={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: 'rgba(31,42,60,0.08)', color: 'text.secondary',
              }}
            >
              <PersonOutlineOutlinedIcon fontSize="small" />
            </Box>
            <Autocomplete
              size="small"
              fullWidth
              options={options}
              value={selectedOption}
              onChange={(_e, value) => onSelectCustomer(value || WALK_IN_CUSTOMER)}
              getOptionLabel={(option) => option?.name || ''}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              filterOptions={(opts, state) => {
                const q = state.inputValue.trim().toLowerCase();
                if (!q) return opts;
                return opts.filter((opt) => [opt.name, opt.phone, opt.code]
                  .filter(Boolean)
                  .some((field) => field.toLowerCase().includes(q)));
              }}
              renderOption={(props, option) => {
                // MUI's Autocomplete puts a `key` field inside `props` itself
                // (separate from React's own key mechanism) — it must be
                // pulled out and passed explicitly rather than left inside
                // the spread, or option clicks can misbehave.
                const { key, ...optionProps } = props;
                return (
                  <li key={key} {...optionProps}>
                    <Stack sx={{ minWidth: 0, py: 0.25 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{option.name}</Typography>
                      {option.phone && option.phone !== '-' && (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{option.phone}</Typography>
                      )}
                    </Stack>
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  placeholder="Search customer by name or mobile…"
                  sx={{ '& .MuiInputBase-root': { fontWeight: 700 } }}
                />
              )}
              sx={{ flex: 1, minWidth: 0 }}
            />
            <IconButton
              size="small"
              onClick={onAddCustomer}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, flexShrink: 0 }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, sm: 7, md: 8 }}>
        <Paper variant="outlined" sx={{ borderRadius: 3, p: 2, height: '100%' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 4 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Bill No.</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }} noWrap>{billNo}</Typography>
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Cashier</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }} noWrap>{cashierName}</Typography>
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Date &amp; Time</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }} noWrap>{dateTime}</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
}
