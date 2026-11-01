import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Alert, Skeleton,
} from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';
import StatCard from '../../components/common/StatCard';
import { DatePickerField, formatPickerDate, parsePickerDate } from '../../components/form/FormDatePicker';
import { formatCurrency } from '../../utils/format';
import { useCashReconciliationReportQuery } from '../../api/cashReconciliationApi';

import CashReconciliationTransactionsTable from './components/CashReconciliationTransactionsTable';

const PAGE_SIZE = 10;

function SummaryTile({ label, value, valueColor }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2.5, p: 1.75, height: '100%' }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{label}</Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: valueColor || 'text.primary', mt: 0.25 }}>
        {value}
      </Typography>
    </Paper>
  );
}

function toDateKey(pickerValue) {
  const date = parsePickerDate(pickerValue) || new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function signedCurrency(value) {
  const formatted = formatCurrency(Math.abs(value), { decimals: true });
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

function varianceColor(value) {
  if (value > 0) return 'success.main';
  if (value < 0) return 'error.main';
  return 'text.primary';
}

// "₹45.00 Short" / "₹30.00 Over" / "Balanced" — derived client-side from
// the real summary.totalVariance the report already computed, same as
// varianceColor/signedCurrency above; the backend only ever sends the raw
// number, never a pre-worded string.
function cashShortOverLabel(totalVariance) {
  if (totalVariance < 0) return `${formatCurrency(Math.abs(totalVariance), { decimals: true })} Short`;
  if (totalVariance > 0) return `${formatCurrency(totalVariance, { decimals: true })} Over`;
  return 'Balanced';
}

/**
 * Variance-by-type donut for the reconciliation summary — built directly
 * on PieChart (rather than the shared DonutChart) because each legend row
 * here needs its own two-line "count Reconciliations (pct%)" / signed
 * value layout, which the shared component's single-line legend doesn't
 * support. The pie itself uses each type's reconciliation count (always
 * positive) so an "Exact Match" slice with ₹0 variance still renders.
 */
function VarianceDonut({ data, centerLabel, centerValue, size = 160 }) {
  const totalCount = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
      <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <PieChart
          series={[
            {
              data: data.map((d) => ({ id: d.id, label: d.label, value: d.count, color: d.color })),
              innerRadius: size * 0.32,
              outerRadius: size * 0.5,
              paddingAngle: 1,
              cornerRadius: 1,
            },
          ]}
          width={size}
          height={size}
          hideLegend
          margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
          slotProps={{ tooltip: { trigger: 'item' } }}
          sx={{ '& .MuiPieArc-root': { stroke: 'none' } }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            textAlign: 'center',
            px: 2,
          }}
        >
          {centerValue && (
            <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: 14, lineHeight: 1.2, color: varianceColor(centerValue.raw) }}>
              {centerValue.text}
            </Typography>
          )}
          {centerLabel && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10.5 }}>
              {centerLabel}
            </Typography>
          )}
        </Box>
      </Box>

      <Stack spacing={1.25} sx={{ width: '100%', minWidth: 0 }}>
        {data.map((slice) => (
          <Stack key={slice.id} direction="row" spacing={1} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Stack spacing={0.1} sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: slice.color, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{slice.label}</Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary', pl: 2 }}>
                {slice.count} Reconciliation{slice.count === 1 ? '' : 's'} ({totalCount ? Math.round((slice.count / totalCount) * 100 * 100) / 100 : 0}%)
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ fontWeight: 700, flexShrink: 0, color: varianceColor(slice.value) }}>
              {signedCurrency(slice.value)}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}

/**
 * Cash Reconciliation — the cashier's system-vs-counted cash report
 * reached from the Cashier Panel's "Cash Reconciliation" quick action.
 * There is no separate create-flow or table behind this page at all: a
 * "cash reconciliation" IS the reconciliation view of a CLOSED
 * ShiftSession row — System Cash is that shift's real
 * expectedClosingCash, Counted Cash is its real closingCash, and Variance
 * is its real closingVariance, all computed once and stored by
 * closeShift() (see backend/src/modules/shift-session/shiftSession.
 * service.js) — this page only reads and reshapes that same real data via
 * GET /cash-reconciliations/summary (see cashReconciliation.service.js's
 * getCashReconciliationReport), the same read-only relationship Cash
 * Drawer Opening has with ShiftSession rows.
 *
 * The Variance Summary (By Type) donut buckets the selected date's
 * reconciled shifts into Cash Short / Cash Over / Exact Match by the sign
 * of their real variance; Cash Short/Over and Status are derived
 * client-side from the real totalVariance rather than sent as pre-worded
 * strings from the server.
 */
export default function CashReconciliationPage() {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(() => formatPickerDate(new Date()));

  const dateKey = toDateKey(selectedDate);
  const {
    data: report, isLoading, isFetching, isError, refetch,
  } = useCashReconciliationReportQuery({ date: dateKey, page, pageSize: PAGE_SIZE });


  const handleViewAll = () => dispatch(showToast('Full cash reconciliation list is coming soon', 'info'));
  const handleDateChange = (value) => {
    setSelectedDate(value || formatPickerDate(new Date()));
    setPage(1);
  };

  if (isError) {
    return (
      <Stack spacing={2}>
        <Alert
          severity="error"
          action={(
            <MuiLink component="button" type="button" variant="body2" underline="hover" onClick={refetch}>
              Retry
            </MuiLink>
          )}
        >
          Couldn&apos;t load the Cash Reconciliation report from the server. Check your connection and try reloading.
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Cash Reconciliation</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/cashier-panel" underline="hover" color="text.secondary">Cashier Panel</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Cash Reconciliation</Typography>
          </Breadcrumbs>
        </Box>
      </Stack>

      <Alert severity="info" variant="outlined">
        This is a report of past shift reconciliations. To close a shift and record its cash count, use the Shift Closing screen.
      </Alert>

      {isLoading || !report ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5].map((key) => (
            <Grid key={key} size={{ xs: 12, sm: 6, lg: 2.4 }}>
              <Skeleton variant="rounded" height={92} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={PointOfSaleOutlinedIcon}
              iconColor="success"
              iconShape="circle"
              label="Total Reconciliations"
              value={formatCurrency(report.stats.totalReconciliations.value, { decimals: true })}
              caption={`Transactions : ${report.stats.totalReconciliations.transactions}`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={DescriptionOutlinedIcon}
              iconColor="#2563EB"
              iconShape="circle"
              label="Total Reconciled"
              value={String(report.stats.totalReconciled.value)}
              caption="Total Quantity : -"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={CurrencyRupeeOutlinedIcon}
              iconColor="warning"
              iconShape="circle"
              label="Average Variance"
              value={signedCurrency(report.stats.avgVariance.value)}
              caption="Per Reconciliation"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={CalendarTodayOutlinedIcon}
              iconColor="#8B5CF6"
              iconShape="circle"
              label="Today's Reconciliation"
              value={formatCurrency(report.stats.todaysReconciliation.value, { decimals: true })}
              caption={`${report.stats.todaysReconciliation.transactions} Transaction${report.stats.todaysReconciliation.transactions === 1 ? '' : 's'}`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={CalendarTodayOutlinedIcon}
              iconColor="#0EA5A4"
              iconShape="circle"
              label="Selected Date Reconciliation"
              value={formatCurrency(report.stats.selectedDateReconciliation.value, { decimals: true })}
              caption={report.stats.selectedDateReconciliation.date}
            />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Reconciliation Summary</Typography>
              <DatePickerField
                value={selectedDate}
                onChange={handleDateChange}
                sx={{ width: { xs: '100%', sm: 200 } }}
              />
            </Stack>

            {!report ? (
              <Skeleton variant="rounded" height={220} />
            ) : (
              <>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <SummaryTile label="Total Reconciliation" value={formatCurrency(report.summary.totalReconciliation, { decimals: true })} valueColor="#2563EB" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <SummaryTile label="Total Transactions" value={String(report.summary.totalTransactions)} valueColor="#2563EB" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <SummaryTile label="Reconciled By" value={report.summary.reconciledBy} valueColor="#2563EB" />
                  </Grid>
                </Grid>

                <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <SummaryTile label="Total System Cash" value={formatCurrency(report.summary.totalSystemCash, { decimals: true })} valueColor="#2563EB" />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <SummaryTile label="Total Counted Cash" value={formatCurrency(report.summary.totalCountedCash, { decimals: true })} valueColor="success.main" />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <SummaryTile label="Total Variance" value={signedCurrency(report.summary.totalVariance)} valueColor={varianceColor(report.summary.totalVariance)} />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <SummaryTile label="Variance ( % )" value={`${report.summary.variancePercent > 0 ? '+' : ''}${report.summary.variancePercent.toFixed(2)}%`} valueColor={varianceColor(report.summary.variancePercent)} />
                  </Grid>
                </Grid>

                <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                  <Grid size={{ xs: 6 }}>
                    <SummaryTile label="Cash Short / Over" value={cashShortOverLabel(report.summary.totalVariance)} valueColor={varianceColor(report.summary.totalVariance)} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <SummaryTile label="Status" value={report.summary.totalTransactions > 0 ? 'Reconciled' : 'No Shifts Closed'} valueColor="success.main" />
                  </Grid>
                </Grid>
              </>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Variance Summary (By Type)</Typography>
            {!report ? (
              <Skeleton variant="rounded" height={220} />
            ) : (
              <VarianceDonut
                data={report.byType}
                centerValue={{ text: signedCurrency(report.summary.totalVariance), raw: report.summary.totalVariance }}
                centerLabel="Total Variance"
              />
            )}
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Recent Cash Reconciliation Transactions</Typography>
          <MuiLink
            component="button"
            type="button"
            variant="body2"
            underline="hover"
            onClick={handleViewAll}
            sx={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}
          >
            View All <NavigateNextIcon fontSize="small" />
          </MuiLink>
        </Stack>
        {!report ? (
          <Skeleton variant="rounded" height={240} />
        ) : (
          <CashReconciliationTransactionsTable
            rows={report.transactions}
            totalPages={report.totalPages}
            page={report.page}
            onPageChange={setPage}
            loading={isFetching}
          />
        )}
      </Paper>
    </Stack>
  );
}
