import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Button, TextField, MenuItem, Alert, Skeleton,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, TablePagination, Chip, Tooltip,
  Dialog, DialogTitle, DialogContent, IconButton, useMediaQuery, useTheme,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

import { useAppDispatch } from '../../../app/hooks';
import { showToast } from '../../../features/ui/uiSlice';
import StatCard from '../../../components/common/StatCard';
import { DatePickerField, formatPickerDate, parsePickerDate } from '../../../components/form/FormDatePicker';
import { formatCurrency } from '../../../utils/format';
import { downloadCsv } from '../../../utils/exportCsv';
import {
  useShiftVarianceReportQuery, useShiftVarianceFiltersQuery, useShiftVarianceTransactionsQuery, shiftVarianceEndpoints,
} from '../../../api/shiftVarianceApi';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'shortage', label: 'Shortage' },
  { value: 'excess', label: 'Excess' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'pending', label: 'Pending / Open' },
  { value: 'missing', label: 'Missing cash count' },
  { value: 'unresolved', label: 'Unresolved variance' },
];

const CLOSING_LABEL = {
  OPEN: ['Open', 'default'], MISSING_COUNT: ['No count', 'warning'], SHORT: ['Shortage', 'error'],
  EXCESS: ['Excess', 'warning'], BALANCED: ['Balanced', 'success'],
};
const HANDOVER_LABEL = {
  NOT_CLOSED: ['Shift open', 'default'], MISSING_COUNT: ['No count', 'warning'], PENDING: ['Pending', 'warning'],
  MATCHED: ['Matched', 'success'], SHORT: ['Received less', 'error'], EXCESS: ['Received more', 'warning'],
};

const money = (v) => (v === null || v === undefined ? '—' : formatCurrency(v, { decimals: true }));
const signed = (v) => {
  if (v === null || v === undefined) return '—';
  return `${v > 0 ? '+' : ''}${formatCurrency(v, { decimals: true })}`;
};
const varianceColor = (v) => {
  if (v === null || v === undefined || v === 0) return 'text.primary';
  return v < 0 ? 'error.main' : 'warning.dark';
};
const dateTime = (iso) => (iso ? new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');
const dateOnly = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return formatPickerDate(new Date(y, m - 1, d));
};

function toKey(pickerValue) {
  const date = parsePickerDate(pickerValue);
  if (!date) return undefined;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function StatusChip({ map, status }) {
  const [label, color] = map[status] || [status, 'default'];
  return <Chip size="small" label={label} color={color} variant={color === 'default' ? 'outlined' : 'filled'} sx={{ fontWeight: 600 }} />;
}

function defaultFilters() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 6);
  return {
    from: formatPickerDate(from), to: formatPickerDate(to), outletId: '', cashierId: '', status: 'all',
  };
}

function DrillDownDialog({ shift, onClose }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { data, isLoading, isError, refetch } = useShiftVarianceTransactionsQuery(shift?.id, { skip: !shift });

  return (
    <Dialog open={Boolean(shift)} onClose={onClose} fullScreen={fullScreen} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Shift {shift?.shiftNo} transactions
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {shift?.outletName} · {shift?.cashierName} · {dateTime(shift?.openedAt)} – {shift?.closedAt ? dateTime(shift.closedAt) : 'open'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} aria-label="Close" sx={{ width: 48, height: 48 }}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading && <Skeleton variant="rounded" height={240} />}
        {isError && (
          <Alert severity="error" action={<Button color="inherit" size="small" onClick={refetch}>Retry</Button>}>
            Could not load this shift&apos;s transactions.
          </Alert>
        )}
        {data && (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell><TableCell>Type</TableCell><TableCell>Reference</TableCell>
                    <TableCell>Tender</TableCell><TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Cash effect</TableCell><TableCell>Note</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.items.map((item) => (
                    <TableRow key={`${item.type}-${item.id}`} hover>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{dateTime(item.at)}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.reference}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{item.tender}</TableCell>
                      <TableCell align="right">{money(item.amount)}</TableCell>
                      <TableCell align="right" sx={{ color: item.cashEffect < 0 ? 'error.main' : 'text.primary', whiteSpace: 'nowrap' }}>{item.cashEffect ? signed(item.cashEffect) : '—'}</TableCell>
                      <TableCell>{item.note}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                Net cash in drawer from these transactions (= expected closing cash): {money(data.cashTotal)}
              </Typography>
            </Stack>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

const Num = ({ children, color, bold }) => (
  <TableCell align="right" sx={{ whiteSpace: 'nowrap', color: color || 'text.primary', fontWeight: bold ? 700 : 400 }}>{children}</TableCell>
);

/**
 * Shift-to-Shift Variance Report (Reports > Cashier Reports). Real data from
 * GET /api/shift-variance. Closing variance (counted − expected) and handover
 * variance (next shift's counted opening − this shift's counted closing) are
 * shown separately. + = excess, − = shortage.
 */
export default function ShiftVarianceReportPage() {
  const dispatch = useAppDispatch();
  const [draft, setDraft] = useState(defaultFilters);
  const [applied, setApplied] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [drill, setDrill] = useState(null);
  const [exporting, setExporting] = useState(false);

  const { data: options } = useShiftVarianceFiltersQuery();
  const params = useMemo(() => ({
    from: toKey(applied.from),
    to: toKey(applied.to),
    outletId: applied.outletId || undefined,
    cashierId: applied.cashierId || undefined,
    status: applied.status,
    page,
    pageSize: PAGE_SIZE,
  }), [applied, page]);
  const {
    data, isLoading, isFetching, isError, error, refetch,
  } = useShiftVarianceReportQuery(params);

  const handleSearch = () => { setPage(1); setApplied(draft); };
  const handleReset = () => { const d = defaultFilters(); setDraft(d); setApplied(d); setPage(1); };

  const handleExport = async () => {
    setExporting(true);
    try {
      const rows = [];
      for (let p = 1; ; p += 1) {
        // eslint-disable-next-line no-await-in-loop
        const res = await dispatchFetch({ ...params, page: p, pageSize: 100 });
        rows.push(...res.rows);
        if (p >= res.totalPages) break;
      }
      downloadCsv(
        `shift-variance_${params.from}_${params.to}.csv`,
        ['Business date', 'Shift', 'Outlet', 'Cashier', 'Previous shift', 'Next shift', 'Opening cash', 'Cash sales', 'Cash refunds',
          'Cash paid in', 'Cash paid out', 'Expected closing', 'Actual closing', 'Closing variance (+excess/-short)', 'Closing status',
          'Declared handover', 'Acknowledged by next shift', 'Handover variance', 'Handover status', 'Card net', 'UPI net',
          'Card/UPI reconciliation', 'Variance approval'],
        rows.map((r) => [r.businessDate, r.shiftNo, r.outletName, r.cashierName, r.previousShift?.shiftNo || '', r.nextShift?.shiftNo || '',
          r.openingCash, r.cashSales, r.cashRefunds, r.cashPaidIn, r.cashPaidOut, r.expectedClosingCash, r.actualClosingCash ?? '',
          r.closingVariance ?? '', r.closingStatus, r.handover.declared ?? '', r.handover.acknowledged ?? '', r.handover.variance ?? '',
          r.handover.status, r.card.net, r.upi.net, 'Not tracked', 'Not tracked']),
      );
    } catch {
      dispatch(showToast('Could not export the report. Please try again.', 'error'));
    } finally {
      setExporting(false);
    }
  };
  // Fetch pages for export through the same RTK endpoint (cached, authenticated).
  const dispatchFetch = (p) => dispatch(shiftVarianceEndpoints.ShiftVarianceReport.initiate(p, { forceRefetch: true })).unwrap();

  const summary = data?.summary;
  const errorMessage = error?.data?.message || 'Could not load the report.';

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Shift-to-Shift Variance</Typography>
        <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
          <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
          <MuiLink component={RouterLink} to="/reports" underline="hover" color="text.secondary">Reports</MuiLink>
          <MuiLink component={RouterLink} to="/reports/cashier" underline="hover" color="text.secondary">Cashier Reports</MuiLink>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Shift-to-Shift Variance</Typography>
        </Breadcrumbs>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Grid container spacing={1.5} sx={{ alignItems: 'flex-end' }}>
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>From</Typography>
            <DatePickerField value={draft.from} onChange={(v) => setDraft((d) => ({ ...d, from: v }))} />
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>To</Typography>
            <DatePickerField value={draft.to} onChange={(v) => setDraft((d) => ({ ...d, to: v }))} />
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>Outlet</Typography>
            <TextField select fullWidth slotProps={{ select: { displayEmpty: true, SelectDisplayProps: { 'aria-label': 'Outlet filter' } } }} value={draft.outletId} onChange={(e) => setDraft((d) => ({ ...d, outletId: e.target.value }))} disabled={options && !options.canChooseOutlet}>
              <MenuItem value="">My outlet</MenuItem>
              {options?.canChooseOutlet && <MenuItem value="all">All outlets</MenuItem>}
              {options?.outlets.map((o) => <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>Cashier</Typography>
            <TextField select fullWidth slotProps={{ select: { displayEmpty: true, SelectDisplayProps: { 'aria-label': 'Cashier filter' } } }} value={draft.cashierId} onChange={(e) => setDraft((d) => ({ ...d, cashierId: e.target.value }))}>
              <MenuItem value="">All cashiers</MenuItem>
              {options?.cashiers.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>Variance status</Typography>
            <TextField select fullWidth slotProps={{ select: { SelectDisplayProps: { 'aria-label': 'Variance status filter' } } }} value={draft.status} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}>
              {STATUS_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" startIcon={<SearchIcon fontSize="small" />} onClick={handleSearch} fullWidth sx={{ minHeight: 48 }}>Search</Button>
              <Button variant="outlined" color="inherit" onClick={handleReset} sx={{ minHeight: 48 }} aria-label="Reset filters"><CloseIcon fontSize="small" /></Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {isError && (
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={refetch}>Retry</Button>}>{errorMessage}</Alert>
      )}

      <Grid container spacing={2}>
        {[
          { icon: TrendingDownOutlinedIcon, iconColor: '#E5484D', label: 'Total shortages', value: summary && money(summary.totalShortage), caption: summary && `${summary.shortageCount} shift(s)` },
          { icon: TrendingUpOutlinedIcon, iconColor: '#F26B21', label: 'Total excesses', value: summary && money(summary.totalExcess), caption: summary && `${summary.excessCount} shift(s)` },
          { icon: HourglassEmptyOutlinedIcon, iconColor: '#2563EB', label: 'Pending handovers', value: summary && String(summary.pendingHandovers), caption: summary && `${money(summary.pendingHandoverAmount)} awaiting next shift` },
          { icon: ReportProblemOutlinedIcon, iconColor: '#7C3AED', label: 'Unresolved variances', value: summary && String(summary.unresolvedVariances), caption: summary && `${summary.missingCounts} missing cash count(s)` },
        ].map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            {isLoading ? <Skeleton variant="rounded" height={92} /> : <StatCard icon={card.icon} iconColor={card.iconColor} label={card.label} value={card.value ?? '—'} caption={card.caption} />}
          </Grid>
        ))}
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Stack direction="row" sx={{ p: 2, alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Shift comparison</Typography>
          <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} onClick={handleExport} disabled={exporting || !data?.total} sx={{ minHeight: 44 }}>
            {exporting ? 'Exporting…' : 'Export CSV'}
          </Button>
        </Stack>
        <TableContainer sx={{ maxHeight: 640, opacity: isFetching && !isLoading ? 0.6 : 1 }}>
          <Table size="small" stickyHeader sx={{ minWidth: 1900, '& td, & th': { py: 1.25 } }}>
            <TableHead>
              <TableRow>
                <TableCell>Business date</TableCell><TableCell>Shift</TableCell><TableCell>Outlet / Register</TableCell><TableCell>Cashier</TableCell>
                <TableCell>Previous → Next</TableCell>
                <TableCell align="right">Opening</TableCell><TableCell align="right">Cash sales</TableCell><TableCell align="right">Cash refunds</TableCell>
                <TableCell align="right">Paid in</TableCell><TableCell align="right">Paid out</TableCell>
                <TableCell align="right">Expected closing</TableCell><TableCell align="right">Actual closing</TableCell><TableCell align="right">Closing variance</TableCell>
                <TableCell align="right">Declared handover</TableCell><TableCell align="right">Received by next</TableCell><TableCell align="right">Handover variance</TableCell>
                <TableCell align="right">Card</TableCell><TableCell align="right">UPI</TableCell>
                <TableCell>Closing status</TableCell><TableCell>Handover</TableCell><TableCell>Approval</TableCell><TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={22}><Skeleton height={32} /></TableCell></TableRow>
              ))}
              {!isLoading && data?.rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={22} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No shifts match these filters. Try widening the date range or clearing the status filter.
                  </TableCell>
                </TableRow>
              )}
              {data?.rows.map((r) => (
                <TableRow key={r.id} hover sx={{ cursor: 'pointer' }} onClick={() => setDrill(r)}>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {dateOnly(r.businessDate)}
                    {r.crossesMidnight && <Tooltip title="Closed after midnight; counted under the day it opened"><Chip size="small" label="Overnight" sx={{ ml: 0.75 }} /></Tooltip>}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 700 }}>{r.shiftNo}{r.shiftName ? ` · ${r.shiftName}` : ''}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {r.outletName}
                    <Tooltip title="No register/till concept exists — one cash drawer per outlet"><Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 0.75 }}>/ —</Typography></Tooltip>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{r.cashierName}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{r.previousShift ? r.previousShift.shiftNo : '—'} → {r.nextShift ? r.nextShift.shiftNo : '—'}</TableCell>
                  <Num>{money(r.openingCash)}</Num>
                  <Num>{money(r.cashSales)}</Num>
                  <Num>{money(r.cashRefunds)}</Num>
                  <Num><Tooltip title="No cash paid-in transaction type exists yet">{money(r.cashPaidIn)}</Tooltip></Num>
                  <Num>
                    <Tooltip title={`Withdrawals ${money(r.cashWithdrawals)} · Deposits ${money(r.cashDeposits)} · Transfers ${money(r.cashTransfers)}`}>
                      <span>{money(r.cashPaidOut)}</span>
                    </Tooltip>
                  </Num>
                  <Num bold>
                    {money(r.expectedClosingCash)}
                    {r.recordedAtClose.differsFromRecomputed && (
                      <Tooltip title={`Recorded when the shift closed: ${money(r.recordedAtClose.expectedClosingCash)} (variance ${signed(r.recordedAtClose.closingVariance)}). The close screen counted tendered cash (not net of change) and ignored cash refunds.`}>
                        <ReportProblemOutlinedIcon fontSize="inherit" color="warning" sx={{ ml: 0.5, verticalAlign: 'middle' }} />
                      </Tooltip>
                    )}
                  </Num>
                  <Num>{money(r.actualClosingCash)}</Num>
                  <Num bold color={varianceColor(r.closingVariance)}>{signed(r.closingVariance)}</Num>
                  <Num>{money(r.handover.declared)}</Num>
                  <Num>{money(r.handover.acknowledged)}</Num>
                  <Num bold color={varianceColor(r.handover.variance)}>{signed(r.handover.variance)}</Num>
                  <Num>{money(r.card.net)}</Num>
                  <Num>{money(r.upi.net)}</Num>
                  <TableCell><StatusChip map={CLOSING_LABEL} status={r.closingStatus} /></TableCell>
                  <TableCell><StatusChip map={HANDOVER_LABEL} status={r.handover.status} /></TableCell>
                  <TableCell>
                    <Tooltip title="No variance approval workflow exists yet. Card/UPI settlement reconciliation is not tracked either.">
                      <Chip size="small" variant="outlined" label="Not tracked" />
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" aria-label="View transactions" onClick={(e) => { e.stopPropagation(); setDrill(r); }} sx={{ width: 44, height: 44 }}>
                      <ReceiptLongOutlinedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={data?.total || 0}
          page={(data?.page || 1) - 1}
          rowsPerPage={PAGE_SIZE}
          rowsPerPageOptions={[PAGE_SIZE]}
          onPageChange={(_, p) => setPage(p + 1)}
        />
      </Paper>

      {data?.notes && (
        <Alert severity="info" variant="outlined">
          Closing variance = counted − expected (+ excess, − shortage). Handover variance = next shift&apos;s counted opening − this shift&apos;s counted closing; it is kept
          separate and never merged into the next shift&apos;s opening balance. {data.notes.register} {data.notes.approval} {data.notes.cardUpi}
        </Alert>
      )}

      <DrillDownDialog shift={drill} onClose={() => setDrill(null)} />
    </Stack>
  );
}
