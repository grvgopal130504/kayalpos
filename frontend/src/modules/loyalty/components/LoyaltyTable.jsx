import { useState } from 'react';
import {
  Box, Paper, Stack, Tabs, Tab, TextField, InputAdornment, Button, IconButton, Menu, MenuItem, Typography, Pagination, Select,
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';

import DataTable from '../../../components/common/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import { formatNumber } from '../../../utils/format';

const TABS = [
  { key: 'all', label: 'All Programs' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50];

function RowActions({ onAction }) {
  const [anchor, setAnchor] = useState(null);
  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}>
        <MoreVertOutlinedIcon fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {['View', 'Edit', 'Deactivate', 'Delete'].map((label) => (
          <MenuItem key={label} onClick={() => { setAnchor(null); onAction(label); }}>
            {label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

/**
 * Loyalty Program list: tab filter (All/Active/Inactive), search, page-size
 * selector, Filters button, the paginated table, and a row-click that loads
 * that program into LoyaltyDetailsCard on the right.
 */
export default function LoyaltyTable({
  programs, totalCount, selectedId, onSelectProgram, onRowAction, onFilters,
}) {
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const filtered = programs.filter((p) => {
    if (tab !== 'all' && p.status.toLowerCase() !== tab) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
  });

  const isFiltering = tab !== 'all' || query.trim().length > 0;
  const effectiveTotal = isFiltering ? filtered.length : (totalCount ?? filtered.length);

  const pageCount = Math.max(1, Math.ceil(effectiveTotal / pageSize));
  const safePage = Math.min(page, pageCount);
  const rangeStart = effectiveTotal === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, effectiveTotal);
  const visibleRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleTabChange = (v) => { setTab(v); setPage(1); };
  const handleQueryChange = (v) => { setQuery(v); setPage(1); };
  const handlePageSizeChange = (v) => { setPageSize(v); setPage(1); };

  const columns = [
    { key: 'index', label: '#', render: (_row, i) => (safePage - 1) * pageSize + i + 1 },
    {
      key: 'name',
      label: 'Program Name',
      render: (row) => (
        <Box sx={{ minWidth: 140, cursor: 'pointer' }} onClick={() => onSelectProgram(row)}>
          <Typography
            variant="body2"
            noWrap
            sx={{ fontWeight: 600, color: row.id === selectedId ? 'primary.main' : 'text.primary' }}
          >
            {row.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{row.code}</Typography>
        </Box>
      ),
    },
    { key: 'earnRule', label: 'Earn Rule' },
    { key: 'redemptionRule', label: 'Redemption Rule' },
    { key: 'membershipValidity', label: 'Membership Validity' },
    { key: 'members', label: 'Members', render: (row) => formatNumber(row.members) },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} label={row.status} /> },
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

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', px: 2, pt: 1.5 }}>
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

      <Box sx={{ p: 2, pb: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search programs by name or code…"
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

      <Box sx={{ px: 2, flex: 1, minWidth: 0, overflow: 'auto' }}>
        <DataTable
          columns={columns}
          rows={visibleRows}
          getRowKey={(r) => r.id}
          emptyMessage="No programs match your search"
        />
      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ px: 2, py: 1.5, alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {effectiveTotal === 0
            ? 'No entries'
            : `Showing ${rangeStart} to ${rangeEnd} of ${formatNumber(effectiveTotal)} entries`}
        </Typography>
        {pageCount > 1 && (
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
        )}
      </Stack>
    </Paper>
  );
}
