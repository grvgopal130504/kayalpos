import { useMemo, useState } from 'react';
import {
  Box, Paper, Stack, Tabs, Tab, TextField, InputAdornment, IconButton, Typography, Button, Avatar, CircularProgress,
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import QrCodeScannerOutlinedIcon from '@mui/icons-material/QrCodeScannerOutlined';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import DataTable from '../../../components/common/DataTable';
import { formatCurrency } from '../../../utils/format';
import { useGetProductsQuery } from '../../../api/productApi';
import { stockColor } from '../lineSaleMockData';

const TABS = [
  { key: 'scan', label: 'Scan Barcode' },
  { key: 'search', label: 'Search Items' },
  { key: 'recent', label: 'Recent Items' },
];

const PAGE_SIZE = 7;

// Small fixed palette so each product's avatar gets a stable color derived
// from its own code, without needing a "color" column on the Product table.
const AVATAR_COLORS = ['#F26B21', '#22A06B', '#8B5CF6', '#F5A623', '#2563EB', '#D97706', '#E5484D'];
function colorForCode(code) {
  let hash = 0;
  for (let i = 0; i < code.length; i += 1) hash = (hash * 31 + code.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[hash];
}

/**
 * Left-hand item catalog — now backed by the real Product master
 * (useGetProductsQuery) instead of the static ITEM_CATALOG mock. Only
 * ACTIVE products are offered; "Add" is disabled once a product's live
 * availableQty runs out, so the cart can never be built past what's
 * actually on hand (the backend re-checks this again at Pay & Print time
 * regardless — this is just an earlier, friendlier warning).
 */
export default function ItemsPanel({ onAddItem }) {
  const { data: products = [], isLoading, isError } = useGetProductsQuery({ status: 'ACTIVE' });

  const [tab, setTab] = useState('scan');
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const items = useMemo(() => products.map((product) => ({
    id: product.id,
    code: product.code,
    name: product.name,
    batch: '-',
    uom: product.uom,
    stock: product.availableQty,
    mrp: Number(product.mrp),
    price: Number(product.salePrice),
    initial: (product.name?.[0] || '?').toUpperCase(),
    color: colorForCode(product.code),
  })), [products]);

  const filtered = items.filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q);
  });
  const visibleItems = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Explicit widths (summing to 100%) so the table always fits the panel —
  // see DataTable's `fitContainer` doc comment. Fewer, wider columns than a
  // typical desktop grid (Batch/UOM/Stock folded into one cell, MRP/Price
  // into another) so every value can show in full — the item name wraps
  // onto a second line instead of ellipsizing or forcing the table wider
  // than the panel, which is what caused the earlier horizontal scrollbar.
  const columns = [
    { key: 'index', label: '#', width: '5%', render: (_row, i) => i + 1 },
    {
      key: 'item',
      label: 'Item Details',
      width: '36%',
      wrap: true,
      render: (row) => (
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start', minWidth: 0 }}>
          <Avatar variant="rounded" sx={{ bgcolor: row.color, width: 34, height: 34, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
            {row.initial}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.25 }}>
              {row.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {row.code}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      key: 'stock',
      label: 'Batch / Stock',
      width: '28%',
      wrap: true,
      render: (row) => (
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            {row.batch === '-' ? 'No batch' : row.batch}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: stockColor(row.stock) }}>
            {row.stock} {row.uom}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'pricing',
      label: 'MRP / Price',
      width: '20%',
      wrap: true,
      render: (row) => (
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', textDecoration: 'line-through', display: 'block' }}>
            {formatCurrency(row.mrp, { decimals: true })}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {formatCurrency(row.price, { decimals: true })}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'add',
      label: '',
      align: 'right',
      width: '10%',
      render: (row) => (
        <IconButton
          size="small"
          disabled={row.stock <= 0}
          onClick={() => onAddItem(row.code)}
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
        sx={{
          px: 2, pt: 1.5,
          minHeight: 40,
          borderBottom: '1px solid',
          borderColor: 'divider',
          '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontWeight: 600, fontSize: 13.5 },
        }}
      >
        {TABS.map((t) => (
          <Tab key={t.key} value={t.key} label={t.label} />
        ))}
      </Tabs>

      <Box sx={{ p: 2, pb: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Scan barcode or enter item code…"
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
      </Box>

      <Box sx={{ px: 2, pb: 2, flex: 1, minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {isLoading ? (
          <Stack sx={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress size={28} />
          </Stack>
        ) : isError ? (
          <Stack sx={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" sx={{ color: 'error.main' }}>Couldn&apos;t load products. Check your connection.</Typography>
          </Stack>
        ) : (
          <>
            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
              <DataTable
                columns={columns}
                rows={visibleItems}
                getRowKey={(r) => r.code}
                emptyMessage="No items match your search"
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
          </>
        )}
      </Box>
    </Paper>
  );
}
