import { useState } from 'react';
import {
  Box, Paper, Stack, Tabs, Tab, TextField, InputAdornment, IconButton, Typography, Button, Avatar,
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import QrCodeScannerOutlinedIcon from '@mui/icons-material/QrCodeScannerOutlined';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import DataTable from '../../../components/common/DataTable';
import { formatCurrency } from '../../../utils/format';

const TABS = [
  { key: 'scan', label: 'Scan / Search Item' },
  { key: 'recent', label: 'Recent Items' },
  { key: 'original', label: 'Original Invoice Items' },
];

const PAGE_SIZE = 6;

// Purely decorative avatar coloring (no business data attached to it) —
// cycles a fixed palette by row position so items are visually distinct
// without inventing anything about the item itself.
const AVATAR_COLORS = ['#F26B21', '#22A06B', '#F5A623', '#2563EB', '#D97706', '#E5484D', '#8B5CF6'];

/**
 * Left-hand panel: items eligible for return from the original invoice
 * that's currently loaded (see SalesReturnPage's `originalInvoice.items`,
 * fetched from GET /api/sales-returns/lookup/:billNo). Only items with
 * `returnableQty > 0` can still be added — everything else has already
 * been fully returned across prior returns against this same invoice.
 * Rows are keyed by `saleLineId` (the real original SaleLine), not item
 * code, since that's what the backend actually tracks returns against.
 */
export default function ReturnItemsPanel({ items, onAddItem }) {
  const [tab, setTab] = useState('scan');
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = items.filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q);
  });
  const visibleItems = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Explicit widths (summing to 100%) so the table always fits the panel —
  // see DataTable's `fitContainer` doc comment.
  const columns = [
    { key: 'index', label: '#', width: '5%', render: (_row, i) => i + 1 },
    {
      key: 'item',
      label: 'Item Details',
      width: '35%',
      wrap: true,
      render: (row, i) => (
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start', minWidth: 0 }}>
          <Avatar variant="rounded" sx={{ bgcolor: AVATAR_COLORS[i % AVATAR_COLORS.length], width: 34, height: 34, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
            {row.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.25 }}>{row.name}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{row.code}</Typography>
          </Box>
        </Stack>
      ),
    },
    {
      key: 'qty',
      label: 'Sold / Returnable',
      width: '30%',
      wrap: true,
      render: (row) => (
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            Sold: {row.saleQty} {row.uom}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: row.returnableQty > 0 ? 'success.main' : 'text.disabled' }}>
            Returnable: {row.returnableQty} {row.uom}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'mrp',
      label: 'MRP',
      width: '18%',
      wrap: true,
      render: (row) => <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(row.mrp, { decimals: true })}</Typography>,
    },
    {
      key: 'add',
      label: '',
      align: 'right',
      width: '12%',
      render: (row) => (
        <IconButton
          size="small"
          disabled={row.returnableQty <= 0}
          onClick={() => onAddItem(row.saleLineId)}
          sx={{
            bgcolor: 'rgba(242,107,33,0.1)',
            color: 'primary.main',
            '&:hover': { bgcolor: 'rgba(242,107,33,0.2)' },
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Tabs
        value={tab}
        onChange={(_e, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          px: 2, pt: 1.5,
          minHeight: 40,
          borderBottom: '1px solid',
          borderColor: 'divider',
          '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontWeight: 600, fontSize: 13.5, whiteSpace: 'nowrap' },
        }}
      >
        {TABS.map((t) => (
          <Tab key={t.key} value={t.key} label={t.label} />
        ))}
      </Tabs>

      <Box sx={{ p: 2, pb: 1 }}>
        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search item by name or code…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setVisibleCount(PAGE_SIZE); }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small">
                      <QrCodeScannerOutlinedIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <IconButton size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
            <FilterListOutlinedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <Box sx={{ px: 2, pb: 2, flex: 1, minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
          <DataTable
            columns={columns}
            rows={visibleItems}
            getRowKey={(r) => r.saleLineId}
            emptyMessage={items.length === 0 ? 'Find an original invoice to see its items' : 'No items match your search'}
            fitContainer
          />
        </Box>

        {hasMore && (
          <Box sx={{ textAlign: 'center', pt: 1.5 }}>
            <Button
              variant="text"
              endIcon={<ExpandMoreIcon />}
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              sx={{ fontWeight: 700 }}
            >
              Load More Items
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
