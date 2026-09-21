import { useEffect, useMemo, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, InputAdornment,
  List, ListItemButton, ListItemIcon, ListItemText, Checkbox, Typography, Stack, Box, IconButton,
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useGetProductsQuery } from '../../../api/productApi';

/**
 * Multi-select picker behind the "Applies To" → Specific Items / Category
 * choice on Create/Edit Promotion. One dialog serves both modes:
 * `mode="category"` lists the distinct product groups found in the real
 * Product master, `mode="items"` lists individual real products (both
 * pulled from `useGetProductsQuery`, the same live catalog Line Sale's item
 * picker and the Product master page itself use — no separate mock catalog
 * for Promotion).
 *
 * Selection is held in local state while the dialog is open and only
 * handed back via `onApply` when the person confirms, so closing/cancelling
 * never mutates the form's committed selection.
 */
export default function PromotionItemPickerDialog({ open, mode, initialSelected, onApply, onClose }) {
  const isCategoryMode = mode === 'category';
  const { data: products = [] } = useGetProductsQuery({}, { skip: !open });
  const options = useMemo(
    () => (isCategoryMode
      ? [...new Set(products.map((p) => p.group).filter(Boolean))].sort().map((group) => ({ value: group, label: group }))
      : products.map((p) => ({ value: p.code, label: p.name, secondary: `${p.code} · ${p.group}` }))),
    [isCategoryMode, products],
  );

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(initialSelected || []);

  // Re-seed local selection every time the dialog opens, so it always
  // starts from whatever the form currently has (and a Cancel never leaks
  // an in-progress edit back into the form).
  useEffect(() => {
    if (open) {
      setSelected(initialSelected || []);
      setQuery('');
    }
  }, [open, initialSelected]);

  const filtered = options.filter((opt) => opt.label.toLowerCase().includes(query.trim().toLowerCase()));

  const toggle = (value) => {
    setSelected((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1.5 }}>
        {isCategoryMode ? 'Select Categories' : 'Select Items'}
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ p: 2, pb: 1 }}>
          <TextField
            fullWidth
            size="small"
            autoFocus
            placeholder={isCategoryMode ? 'Search categories…' : 'Search items by name or code…'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {selected.length} selected
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <Button size="small" onClick={() => setSelected(filtered.map((opt) => opt.value))}>Select All</Button>
              <Button size="small" color="inherit" onClick={() => setSelected([])}>Clear</Button>
            </Stack>
          </Stack>
        </Box>

        <List dense sx={{ maxHeight: 340, overflow: 'auto', py: 0 }}>
          {filtered.length === 0 && (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>No matches found</Typography>
            </Box>
          )}
          {filtered.map((opt) => {
            const checked = selected.includes(opt.value);
            return (
              <ListItemButton key={opt.value} onClick={() => toggle(opt.value)} sx={{ px: 2 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Checkbox edge="start" size="small" checked={checked} tabIndex={-1} disableRipple />
                </ListItemIcon>
                <ListItemText
                  primary={opt.label}
                  secondary={opt.secondary}
                  slotProps={{
                    primary: { variant: 'body2', fontWeight: 600 },
                    secondary: { variant: 'caption' },
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 1.5 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => onApply(selected)}>
          Apply{selected.length > 0 ? ` (${selected.length})` : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
