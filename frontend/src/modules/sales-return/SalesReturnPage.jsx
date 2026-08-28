import { useMemo, useState } from 'react';
import {
  Stack, Box, Typography, Button, Menu, MenuItem, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { showToast } from '../../features/ui/uiSlice';

import ReturnItemsPanel from './components/ReturnItemsPanel';
import ReturnCartPanel from './components/ReturnCartPanel';
import ReturnInfoRow from './components/ReturnInfoRow';
import ReturnReasonCard from './components/ReturnReasonCard';
import RefundAdjustmentCard from './components/RefundAdjustmentCard';
import ReturnTotalsCard from './components/ReturnTotalsCard';
import OriginalInvoiceSummaryCard from './components/OriginalInvoiceSummaryCard';
import RefundSummaryCard from './components/RefundSummaryCard';
import PaymentMethodSummaryCard from './components/PaymentMethodSummaryCard';
import ReturnActionsCard from './components/ReturnActionsCard';
import {
  ORIGINAL_INVOICE, RETURNABLE_ITEMS, INITIAL_RETURN_CART, RETURN_REASONS,
  REFUND_PAYMENT_METHODS, TAX_RATE, generateReturnNo,
} from './salesReturnMockData';

const ITEM_BY_CODE = Object.fromEntries(RETURNABLE_ITEMS.map((item) => [item.code, item]));
const WALK_IN_CUSTOMER_NAME = 'Walk-in Customer';

function buildInitialCart() {
  return INITIAL_RETURN_CART.map(({ code, qty }) => {
    const item = ITEM_BY_CODE[code];
    return { code, qty, name: item.name, uom: item.uom, batch: item.batch, rate: item.rate, maxQty: item.returnableQty };
  });
}

/**
 * Sales Return (POS refund) screen — find the original invoice, pick which
 * lines are coming back, capture why, and settle the refund. Mirrors Line
 * Sale's structure (items panel / cart panel / bottom summary + actions)
 * with return-specific fields layered in (returnable qty caps, return
 * reason, refund routing, original-invoice + refund summaries).
 * All state is local mock data — the Sales Return backend module doesn't
 * exist yet.
 */
export default function SalesReturnPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);

  const [cart, setCart] = useState(buildInitialCart);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [refundMode, setRefundMode] = useState('refund');
  const [refundTo, setRefundTo] = useState('');
  const [printSettingsEnabled, setPrintSettingsEnabled] = useState(false);
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);

  const returnNo = useMemo(() => generateReturnNo(), []);
  const returnDate = useMemo(
    () => new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()),
    [],
  );

  const totals = useMemo(() => {
    const subTotal = cart.reduce((sum, line) => sum + line.qty * line.rate, 0);
    const discountAmount = 0;
    const taxable = Math.max(subTotal - discountAmount, 0);
    const tax = taxable * TAX_RATE;
    const grandTotal = taxable + tax;
    return { subTotal, discountAmount, tax, grandTotal };
  }, [cart]);

  const handleAddItem = (code) => {
    setCart((prev) => {
      const existing = prev.find((line) => line.code === code);
      const item = ITEM_BY_CODE[code];
      if (existing) {
        return prev.map((line) => (
          line.code === code ? { ...line, qty: Math.min(line.maxQty, line.qty + 1) } : line
        ));
      }
      return [...prev, { code, qty: 1, name: item.name, uom: item.uom, batch: item.batch, rate: item.rate, maxQty: item.returnableQty }];
    });
  };

  const handleQtyChange = (code, qty) => {
    setCart((prev) => prev.map((line) => (line.code === code ? { ...line, qty } : line)));
  };

  const handleRemove = (code) => {
    setCart((prev) => prev.filter((line) => line.code !== code));
  };

  const handleFindOriginalInvoice = () => dispatch(showToast('Find Original Invoice is coming soon', 'info'));
  const handleClear = () => {
    setCart([]);
    setReason('');
    setNote('');
    dispatch(showToast('Return cleared', 'info'));
  };
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };
  const handleAddCustomer = () => dispatch(showToast('Add Customer is coming soon', 'info'));
  const handleProcessReturn = () => {
    if (cart.length === 0) {
      dispatch(showToast('Add at least one item before processing the return', 'warning'));
      return;
    }
    if (!reason) {
      dispatch(showToast('Select a return reason first', 'warning'));
      return;
    }
    dispatch(showToast('Return processed — refund initiated', 'success'));
  };
  const handlePrintReturn = () => dispatch(showToast('Print Return is coming soon', 'info'));
  const handleEmailOrWhatsapp = () => dispatch(showToast('Email / WhatsApp is coming soon', 'info'));

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Sales Return</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Sales Return</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="warning" onClick={handleFindOriginalInvoice}>Find Original Invoice (F3)</Button>
          <Button variant="outlined" color="error" onClick={handleClear}>Clear</Button>
          <Button
            variant="outlined"
            color="inherit"
            endIcon={<ExpandMoreIcon />}
            onClick={(e) => setMoreActionsAnchor(e.currentTarget)}
          >
            More Actions
          </Button>
          <Menu anchorEl={moreActionsAnchor} open={Boolean(moreActionsAnchor)} onClose={() => setMoreActionsAnchor(null)}>
            <MenuItem onClick={() => handleMoreAction('Return All Items')}>Return All Items</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Attach Photo Evidence')}>Attach Photo Evidence</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Cancel Return')}>Cancel Return</MenuItem>
          </Menu>
        </Stack>
      </Stack>

      <ReturnInfoRow
        customerName={WALK_IN_CUSTOMER_NAME}
        returnNo={returnNo}
        returnDate={returnDate}
        originalInvoiceNo={ORIGINAL_INVOICE.invoiceNo}
        invoiceDate={ORIGINAL_INVOICE.invoiceDate}
        cashierName={user?.name || 'Admin'}
        onAddCustomer={handleAddCustomer}
        onFindOriginalInvoice={handleFindOriginalInvoice}
      />

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box sx={{ height: { lg: 520 } }}>
            <ReturnItemsPanel onAddItem={handleAddItem} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Stack spacing={2}>
            <Box sx={{ height: { lg: 340 } }}>
              <ReturnCartPanel lines={cart} onQtyChange={handleQtyChange} onRemove={handleRemove} taxRate={TAX_RATE} />
            </Box>
            <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
              <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <ReturnReasonCard reason={reason} onReasonChange={setReason} note={note} onNoteChange={setNote} reasons={RETURN_REASONS} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <RefundAdjustmentCard
                  refundMode={refundMode}
                  onRefundModeChange={setRefundMode}
                  refundTo={refundTo}
                  onRefundToChange={setRefundTo}
                  paymentMethods={REFUND_PAYMENT_METHODS}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 12, lg: 4 }}>
                <ReturnTotalsCard totals={totals} />
              </Grid>
            </Grid>
          </Stack>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <OriginalInvoiceSummaryCard invoice={ORIGINAL_INVOICE} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RefundSummaryCard
            totalReturnAmount={totals.grandTotal}
            alreadyRefunded={0}
            invoicePaidAmount={ORIGINAL_INVOICE.paidAmount}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <PaymentMethodSummaryCard method={ORIGINAL_INVOICE.paymentMethod} amount={ORIGINAL_INVOICE.paidAmount} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ReturnActionsCard
            onProcessReturn={handleProcessReturn}
            onPrintReturn={handlePrintReturn}
            onEmailOrWhatsapp={handleEmailOrWhatsapp}
            printSettingsEnabled={printSettingsEnabled}
            onTogglePrintSettings={setPrintSettingsEnabled}
            disabled={cart.length === 0}
          />
        </Grid>
      </Grid>

      <Typography variant="caption" align="center" sx={{ color: 'text.secondary', display: 'block', pt: 1 }}>
        © {new Date().getFullYear()} TechconZ Nexora Pvt Ltd. All Rights Reserved.
      </Typography>
    </Stack>
  );
}
