import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Button, Alert, Skeleton,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AddIcon from '@mui/icons-material/Add';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout, selectCurrentUser } from '../../features/auth/authSlice';
import { showToast } from '../../features/ui/uiSlice';
import StatCard from '../../components/common/StatCard';
import DonutChart from '../../components/common/DonutChart';
import { DatePickerField, formatPickerDate, parsePickerDate } from '../../components/form/FormDatePicker';
import FormSelect from '../../components/form/FormSelect';
import FormTextField from '../../components/form/FormTextField';
import { formatCurrency } from '../../utils/format';
import { useShiftSessionStatusQuery } from '../../api/shiftSessionApi';
import { useCashWithdrawalReportQuery, useCreateCashWithdrawalMutation } from '../../api/cashWithdrawalApi';

import CashWithdrawalTransactionsTable from './components/CashWithdrawalTransactionsTable';
import {
  PURPOSE_OPTIONS, cashWithdrawalFormSchema, cashWithdrawalDefaultValues, cashWithdrawalFormValuesToPayload,
} from './cashWithdrawalSchema';

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
 * Cash Withdrawal — the cashier's cash-out report reached from the
 * Cashier Panel's "Cash Withdrawal" quick action. Unlike the payment-method
 * sales reports (which only read Sale rows created elsewhere, at checkout),
 * there is no other screen in this app that creates a withdrawal — so this
 * page also owns the "New Withdrawal" form. Every figure and the create
 * flow are real, via GET/POST /cash-withdrawals (see backend/src/modules/
 * cash-withdrawal): stat tiles, Withdrawal Summary / Withdrawal Summary (By
 * Purpose), the donut, and the paginated Recent Cash Withdrawal
 * Transactions table are all backed by the signed-in cashier's own outlet.
 *
 * A withdrawal can only be recorded while a shift is OPEN for this outlet
 * (the real POS rule: there's no drawer to take cash from otherwise) and
 * can't exceed the drawer's real available cash — both enforced again
 * server-side, never trusted from this form alone. "New Withdrawal" is
 * disabled with an explanatory tooltip when no shift is open.
 */
export default function CashWithdrawalPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const [page, setPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(() => formatPickerDate(new Date()));
  const [dialogOpen, setDialogOpen] = useState(false);

  const dateKey = toDateKey(selectedDate);
  const {
    data: report, isLoading, isFetching, isError, refetch,
  } = useCashWithdrawalReportQuery({ date: dateKey, page, pageSize: PAGE_SIZE });
  const { data: shiftStatus } = useShiftSessionStatusQuery();
  const [createWithdrawal, { isLoading: isSubmitting }] = useCreateCashWithdrawalMutation();

  const isShiftOpen = Boolean(shiftStatus?.currentShift);
  const cashierLabel = user ? `${user.name}${user.username ? ` (${user.username})` : ''}` : '—';

  const methods = useForm({
    resolver: zodResolver(cashWithdrawalFormSchema),
    defaultValues: cashWithdrawalDefaultValues(),
    mode: 'onTouched',
  });
  const { handleSubmit, reset } = methods;

  const handleViewAll = () => dispatch(showToast('Full cash withdrawal list is coming soon', 'info'));
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };
  const handleDateChange = (value) => {
    setSelectedDate(value || formatPickerDate(new Date()));
    setPage(1);
  };
  const handleOpenDialog = () => {
    reset(cashWithdrawalDefaultValues());
    setDialogOpen(true);
  };
  const handleCloseDialog = () => setDialogOpen(false);

  const onSubmit = handleSubmit(
    async (values) => {
      try {
        const payload = cashWithdrawalFormValuesToPayload(values);
        const created = await createWithdrawal(payload).unwrap();
        dispatch(showToast(
          `Withdrawal ${created.referenceNo} recorded for ₹${Number(created.amount).toFixed(2)}`,
          'success',
        ));
        setDialogOpen(false);
      } catch (err) {
        dispatch(showToast(err?.data?.message || 'Failed to record the withdrawal', 'error'));
      }
    },
    (formErrors) => {
      const firstKey = Object.keys(formErrors)[0];
      dispatch(showToast(formErrors[firstKey]?.message || 'Please fix the highlighted fields', 'error'));
    },
  );

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
          Couldn&apos;t load the Cash Withdrawal report from the server. Check your connection and try reloading.
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Cash Withdrawal</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/cashier-panel" underline="hover" color="text.secondary">Cashier Panel</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Cash Withdrawal</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#2563EB' }}>
            Cashier : {cashierLabel}
          </Typography>
          <MuiLink
            component="button"
            type="button"
            variant="body2"
            underline="hover"
            onClick={handleLogout}
            sx={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 0.5, color: '#2563EB' }}
          >
            <LogoutOutlinedIcon fontSize="inherit" /> Logout
          </MuiLink>
        </Stack>
      </Stack>

      <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
        <Tooltip title={isShiftOpen ? '' : 'Open a shift before recording a cash withdrawal'}>
          <span>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              disabled={!isShiftOpen}
            >
              New Withdrawal
            </Button>
          </span>
        </Tooltip>
      </Stack>

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
              icon={ReceiptLongOutlinedIcon}
              iconColor="success"
              iconShape="circle"
              label="Total Cash Withdrawal"
              value={formatCurrency(report.stats.totalCashWithdrawal.value, { decimals: true })}
              caption={`Transactions : ${report.stats.totalCashWithdrawal.transactions}`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={DescriptionOutlinedIcon}
              iconColor="#2563EB"
              iconShape="circle"
              label="Total Withdrawals"
              value={String(report.stats.totalWithdrawals.value)}
              caption="Total Quantity : -"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={ReceiptLongOutlinedIcon}
              iconColor="warning"
              iconShape="circle"
              label="Average Withdrawal Value"
              value={formatCurrency(report.stats.avgWithdrawalValue.value, { decimals: true })}
              caption="Per Transaction"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={CalendarTodayOutlinedIcon}
              iconColor="#8B5CF6"
              iconShape="circle"
              label="Today's Withdrawal"
              value={formatCurrency(report.stats.todaysWithdrawal.value, { decimals: true })}
              caption={`${report.stats.todaysWithdrawal.transactions} Transactions`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              icon={CalendarTodayOutlinedIcon}
              iconColor="#0EA5A4"
              iconShape="circle"
              label="Selected Date Withdrawal"
              value={formatCurrency(report.stats.selectedDateWithdrawal.value, { decimals: true })}
              caption={report.stats.selectedDateWithdrawal.date}
            />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Withdrawal Summary</Typography>
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
                  <SummaryTile label="Total Cash Withdrawal" value={formatCurrency(report.summary.totalCashWithdrawal, { decimals: true })} valueColor="#2563EB" />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <SummaryTile label="Total Transactions" value={String(report.summary.totalTransactions)} valueColor="#2563EB" />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <SummaryTile label="Total Withdrawn By" value={report.summary.totalWithdrawnBy} valueColor="#2563EB" />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <SummaryTile label="Opening Cash" value={formatCurrency(report.summary.openingCash, { decimals: true })} valueColor="#2563EB" />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <SummaryTile label="Total Sales (All Modes)" value={formatCurrency(report.summary.totalSalesAllModes, { decimals: true })} valueColor="#2563EB" />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <SummaryTile label="Closing Cash (Actual)" value={formatCurrency(report.summary.closingCashActual, { decimals: true })} valueColor="success.main" />
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Withdrawal Summary (By Purpose)</Typography>
            {!report ? (
              <Skeleton variant="rounded" height={220} />
            ) : (
              <>
                {(() => {
                  const totalByPurpose = report.byPurpose.reduce((sum, p) => sum + p.value, 0);
                  return (
                    <>
                      <Stack spacing={1.25} sx={{ mb: 2 }}>
                        {report.byPurpose.map((p) => (
                          <Stack key={p.id} direction="row" sx={{ justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{p.label}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {formatCurrency(p.value, { decimals: true })} ({totalByPurpose ? Math.round((p.value / totalByPurpose) * 100 * 100) / 100 : 0}%)
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                      <DonutChart
                        data={report.byPurpose}
                        centerValue={formatCurrency(totalByPurpose, { decimals: true })}
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
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Recent Cash Withdrawal Transactions</Typography>
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
          <CashWithdrawalTransactionsTable
            rows={report.transactions}
            totalPages={report.totalPages}
            page={report.page}
            onPageChange={setPage}
            loading={isFetching}
          />
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <FormProvider {...methods}>
          <form onSubmit={onSubmit}>
            <DialogTitle sx={{ fontWeight: 800 }}>New Cash Withdrawal</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 0.5 }}>
                {!isShiftOpen && (
                  <Alert severity="warning">Open a shift before recording a cash withdrawal.</Alert>
                )}
                <FormSelect name="purpose" label="Purpose" options={PURPOSE_OPTIONS} />
                <FormTextField name="amount" label="Amount (₹)" />
                <FormTextField name="remarks" label="Remarks (optional)" multiline minRows={2} />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={!isShiftOpen || isSubmitting}>
                {isSubmitting ? 'Recording…' : 'Record Withdrawal'}
              </Button>
            </DialogActions>
          </form>
        </FormProvider>
      </Dialog>
    </Stack>
  );
}
