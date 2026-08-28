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
import { RETURNABLE_ITEMS } from '../salesReturnMockData';

const TABS = [
  { key: 'scan', label: 'Scan / Search Item' },
  { key: 'recent', label: 'Recent Items' },
  { key: 'original', label: 'Original Invoice Items' },
];

const PAGE_SIZE = 6;

/**
 * Left-hand panel: items eligible for return from the original invoice.
 * Only items with `returnableQty > 0` can still be added — everything else
 * has already been fully returned. `onAddItem` bumps that item's return
 * cart line (capped at its remaining returnable qty).
 */
export default function ReturnItemsPanel({ onAddItem }) {
  const [tab, setTab] = useState('scan');
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = RETURNABLE_ITEMS.filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q);
  });
  const visibleItems = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const columns = [
    { key: 'index', label: '#', render: (_row, i) => i + 1 },
    {
      key: 'item',
      label: 'Item Details',
      render: (row) => (
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          <Avatar variant="rounded" sx={{ bgcolor: row.color, width: 34, height: 34, fontSize: 14, fontWeight: 700 }}>
            {row.initial}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{row.name}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{row.code}</Typography>
          </Box>
        </Stack>
      ),
    },
    { key: 'batch', label: 'Batch / Serial', render: (row) => row.batch },
    { key: 'uom', label: 'UOM', render: (row) => row.uom },
    { key: 'saleQty', label: 'Sale Qty', render: (row) => `${row.saleQty} ${row.uom}` },
    {
      key: 'returnableQty',
      label: 'Returnable Qty',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: row.returnableQty > 0 ? 'success.main' : 'text.disabled' }}>
          {row.returnableQty} {row.uom}
        </Typography>
      ),
    },
    {
      key: 'mrp',
      label: 'MRP',
      render: (row) => formatCurrency(row.mrp, { decimals: true }),
    },
    {
      key: 'add',
      label: '',
      align: 'right',
      render: (row) => (
        <IconButton
          size="small"
          disabled={row.returnableQty <= 0}
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
            placeholder="Scan barcode or search item…"
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
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <DataTable
            columns={columns}
            rows={visibleItems}
            getRowKey={(r) => r.code}
            emptyMessage="No items match your search"
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
