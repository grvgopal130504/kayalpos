import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Alert, Skeleton,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';
import StatCard from '../../components/common/StatCard';
import DonutChart from '../../components/common/DonutChart';
import { DatePickerField, formatPickerDate, parsePickerDate } from '../../components/form/FormDatePicker';
import { formatCurrency } from '../../utils/format';
import { useCashDrawerOpeningReportQuery } from '../../api/cashDrawerOpeningApi';

import CashDrawerOpeningTransactionsTable from './components/CashDrawerOpeningTransactionsTable';

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

/**
 * Cash Drawer Opening — the cashier's drawer-opening report reached from
 * the Cashier Panel's "Cash Drawer Opening" quick action. Unlike Cash
 * Withdrawal/Deposit/Transfer, there is no "New ___" button here: a
 * drawer opening IS a ShiftSession row, and the only screen that creates
 * one is Shift Opening (reached from its own quick action) — this page
 * only reports on that same real data via GET /cash-drawer-openings/
 * summary (see cashDrawerOpening.service.js's getCashDrawerOpeningReport),
 * the same read-only relationship the Cash/Card/UPI Sales and Other
 * Payments reports have with Sale rows created at checkout.
 *
 * The by-time donut and per-row "Opening Type" both come from real
 * ShiftSession.openedAt timestamps — the first opening of each calendar
 * day is labeled "Shift Start - <time of day>" and every opening after
 * that on the same day is "Additional Opening". summary.variance is
 * always ₹0.00 here on purpose: a drawer opening has nothing to
 * reconcile against until the (not yet built) Shift Closing screen
 * compares actual counted cash to what was expected.
 */
export default function CashDrawerOpeningPage() {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(() => formatPickerDate(new Date()));

  const dateKey = toDateKey(selectedDate);
  const {
    data: report, isLoading, isFetching, isError, refetch,
  } = useCashDrawerOpeningReportQuery({ date: dateKey, page, pageSize: PAGE_SIZE });


  const handleViewAll = () => dispatch(showToast('Full cash drawer opening list is coming soon', 'info'));
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
          Couldn&apos;t load the Cash Drawer Opening report from the server. Check your connection and try reloading.
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Cash Drawer Opening</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/cashier-panel" underline="hover" color="text.secondary">Cashier Panel</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Cash Drawer Opening</Typography>
          </Breadcrumbs>
        </Box>
      </Stack>

      <Alert severity="info" variant="outlined">
        This is a report of past drawer openings. To open the drawer for a new shift, use the Shift Opening screen.
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
              label="Total Drawer Openings"
              value={formatCurrency(report.stats.totalDrawerOpenings.value, { decimals: true })}
              caption={`Transactions : ${report.stats.totalDrawerOpenings.transactions}`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={DescriptionOutlinedIcon}
              iconColor="#2563EB"
              iconShape="circle"
              label="Total Openings"
              value={String(report.stats.totalOpenings.value)}
              caption="Total Quantity : -"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={CurrencyRupeeOutlinedIcon}
              iconColor="warning"
              iconShape="circle"
              label="Average Opening Value"
              value={formatCurrency(report.stats.avgOpeningValue.value, { decimals: true })}
              caption="Per Transaction"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={CalendarTodayOutlinedIcon}
              iconColor="#8B5CF6"
              iconShape="circle"
              label="Today's Drawer Opening"
              value={formatCurrency(report.stats.todaysDrawerOpening.value, { decimals: true })}
              caption={`${report.stats.todaysDrawerOpening.transactions} Transactions`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={CalendarTodayOutlinedIcon}
              iconColor="#0EA5A4"
              iconShape="circle"
              label="Selected Date Opening"
              value={formatCurrency(report.stats.selectedDateOpening.value, { decimals: true })}
              caption={report.stats.selectedDateOpening.date}
            />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Opening Summary</Typography>
              <DatePickerField
                value={selectedDate}
                onChange={handleDateChange}
                sx={{ width: { xs: '100%', sm: 200 } }}
              />
            </Stack>

            {!report ? (
              <Skeleton variant="rounded" height={160} />
            ) : (
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <SummaryTile label="Total Drawer Opening" value={formatCurrency(report.summary.totalDrawerOpening, { decimals: true })} valueColor="#2563EB" />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <SummaryTile label="Total Transactions" value={String(report.summary.totalTransactions)} valueColor="#2563EB" />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <SummaryTile label="Total Opened By" value={report.summary.totalOpenedBy} valueColor="#2563EB" />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <SummaryTile label="Cash Given" value={formatCurrency(report.summary.cashGiven, { decimals: true })} valueColor="#2563EB" />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <SummaryTile label="Closing Cash (Actual)" value={formatCurrency(report.summary.closingCashActual, { decimals: true })} valueColor="success.main" />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <SummaryTile label="Variance" value={formatCurrency(report.summary.variance, { decimals: true })} valueColor="text.primary" />
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Opening Summary (By Time)</Typography>
            {!report ? (
              <Skeleton variant="rounded" height={220} />
            ) : (
              <>
                {(() => {
                  const totalByTime = report.byTime.reduce((sum, t) => sum + t.value, 0);
                  return (
                    <>
                      <Stack spacing={1.25} sx={{ mb: 2 }}>
                        {report.byTime.map((t) => (
                          <Stack key={t.id} direction="row" sx={{ justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{t.label}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {formatCurrency(t.value, { decimals: true })} ({totalByTime ? Math.round((t.value / totalByTime) * 100 * 100) / 100 : 0}%)
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                      <DonutChart
                        data={report.byTime}
                        centerValue={formatCurrency(totalByTime, { decimals: true })}
                        centerLabel="Total"
                        formatValue={(v) => formatCurrency(v, { decimals: true })}
                      />
                    </>
                  );
                })()}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Recent Cash Drawer Opening Transactions</Typography>
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
          <CashDrawerOpeningTransactionsTable
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
