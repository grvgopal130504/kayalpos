import { useState } from 'react';
import {
  Box, Paper, Stack, Tabs, Tab, TextField, InputAdornment, Button, IconButton, Menu, MenuItem, Typography, Pagination, Select,
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';

import DataTable from '../../../components/common/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import { formatCurrency } from '../../../utils/format';

const TABS = [
  { key: 'all', label: 'All Orders' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'delivered', label: 'Delivered' },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const STATUS_LABEL = {
  pending: 'Pending', confirmed: 'Confirmed', delivered: 'Delivered',
};

function RowActions({ onAction }) {
  const [anchor, setAnchor] = useState(null);
  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}>
        <MoreVertOutlinedIcon fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {['View', 'Edit', 'Duplicate', 'Delete'].map((label) => (
          <MenuItem key={label} onClick={() => { setAnchor(null); onAction(label); }}>
            {label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

/**
 * Order list: tab filter (All/Pending/Confirmed/Delivered), search, a
 * page-size selector, a Filters button, the paginated table itself, and a
 * row-click to load that order into the details panel on the right. Rows
 * are keyed/selected by real `id` (not `code`) — same convention every
 * other module's table adopted once it was wired to a real backend (Gift
 * Voucher, Loyalty, Customer, Sales Quotation).
 */
export default function SalesOrderTable({
  orders, selectedId, onSelectOrder, onRowAction, onFilters,
  defaultTab = 'all', statusColumn = true, createdByColumn = false,
  deliveryDateColumn = true,
  tab: controlledTab, onTabChange,
}) {
  const [internalTab, setInternalTab] = useState(defaultTab);
  const isControlled = controlledTab !== undefined && onTabChange;
  const tab = isControlled ? controlledTab : internalTab;
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const filtered = orders.filter((o) => {
    if (tab !== 'all' && o.status !== tab) return false;
    const query_ = query.trim().toLowerCase();
    if (!query_) return true;
    return (
      o.customer.toLowerCase().includes(query_)
      || o.code.toLowerCase().includes(query_)
    );
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, filtered.length);
  const visibleRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleTabChange = (v) => {
    if (isControlled) onTabChange(v); else setInternalTab(v);
    setPage(1);
  };
  const handleQueryChange = (v) => { setQuery(v); setPage(1); };
  const handlePageSizeChange = (v) => { setPageSize(v); setPage(1); };

  const columns = [
    { key: 'index', label: '#', render: (_row, i) => (safePage - 1) * pageSize + i + 1 },
    {
      key: 'code',
      label: 'Order No.',
      render: (row) => (
        <Typography
          variant="body2"
          noWrap
          sx={{ fontWeight: 600, color: row.id === selectedId ? 'primary.main' : 'text.primary', cursor: 'pointer' }}
          onClick={() => onSelectOrder(row)}
        >
          {row.code}
        </Typography>
      ),
    },
    { key: 'date', label: 'Date' },
    { key: 'customer', label: 'Customer Name' },
    { key: 'amount', label: 'Total Amount (₹)', align: 'right', render: (row) => formatCurrency(row.amount, { decimals: true }) },
    ...(deliveryDateColumn ? [{ key: 'deliveryDate', label: 'Delivery Date' }] : []),
    ...(createdByColumn ? [{ key: 'createdBy', label: 'Created By' }] : []),
    ...(statusColumn ? [{ key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} label={STATUS_LABEL[row.status]} /> }] : []),
    { key: 'action', label: 'Action', align: 'right', render: (row) => <RowActions onAction={(label) => onRowAction(label, row)} /> },
  ];

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Tabs
        value={tab}
        onChange={(_e, v) => handleTabChange(v)}
        variant="scrollable"
        scrollButtons="auto"
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
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by order no., customer name, mobile…"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
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
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<FilterListOutlinedIcon fontSize="small" />}
            onClick={onFilters}
            sx={{ flexShrink: 0 }}
          >
            Filters
          </Button>
        </Stack>
      </Box>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', px: 2, pb: 1.5 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Show</Typography>
        <Select
          size="small"
          value={pageSize}
          onChange={(e) => handlePageSizeChange(e.target.value)}
          sx={{ fontSize: 13, '& .MuiSelect-select': { py: 0.5 } }}
        >
          {PAGE_SIZE_OPTIONS.map((n) => (
            <MenuItem key={n} value={n} sx={{ fontSize: 13 }}>{n}</MenuItem>
          ))}
        </Select>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>entries</Typography>
      </Stack>

      <Box sx={{ px: 2, flex: 1, minWidth: 0, overflow: 'auto' }}>
        <DataTable
          columns={columns}
          rows={visibleRows}
          getRowKey={(r) => r.id}
          emptyMessage="No orders match your search"
        />
      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ px: 2, py: 1.5, alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {filtered.length === 0
            ? 'No entries'
            : `Showing ${rangeStart} to ${rangeEnd} of ${filtered.length} entries`}
        </Typography>
        <Pagination
          count={pageCount}
          page={safePage}
          onChange={(_e, v) => setPage(v)}
          color="primary"
          size="small"
          shape="rounded"
          siblingCount={0}
          boundaryCount={1}
        />
      </Stack>
    </Paper>
  );
}
