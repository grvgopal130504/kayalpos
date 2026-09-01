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
import AddCustomerDialog from '../../components/common/AddCustomerDialog';

import ItemsPanel from './components/ItemsPanel';
import CartPanel from './components/CartPanel';
import BillSummaryRow from './components/BillSummaryRow';
import CustomerDetailsCard from './components/CustomerDetailsCard';
import PaymentMethodsCard from './components/PaymentMethodsCard';
import PaymentActionsCard from './components/PaymentActionsCard';
import {
  ITEM_CATALOG, INITIAL_CART, PAYMENT_METHODS, TAX_RATE, generateBillNo,
} from './lineSaleMockData';

const ITEM_BY_CODE = Object.fromEntries(ITEM_CATALOG.map((item) => [item.code, item]));
const QUICK_AMOUNTS = [3800, 4000, 4500, 5000];

function buildInitialCart() {
  return INITIAL_CART.map(({ code, qty }) => ({
    code,
    qty,
    name: ITEM_BY_CODE[code].name,
    uom: ITEM_BY_CODE[code].uom,
    price: ITEM_BY_CODE[code].price,
    taxRate: TAX_RATE,
  }));
}

const WALK_IN_CUSTOMER = { name: 'Walk-in Customer', phone: '-', loyaltyPoints: 0 };

/**
 * POS billing screen — scan/search items on the left, build the current
 * sale on the right, settle it at the bottom. All state is local (cart,
 * discount, payment) since the Sale module has no backend yet; totals are
 * derived live from `cart` + `discount` on every render.
 */
export default function LineSalePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);

  const [cart, setCart] = useState(buildInitialCart);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('amount');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [receivedAmount, setReceivedAmount] = useState(4000);
  const [printSettingsEnabled, setPrintSettingsEnabled] = useState(false);
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [customer, setCustomer] = useState(WALK_IN_CUSTOMER);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);

  const billNo = useMemo(() => generateBillNo(), []);
  const dateTime = useMemo(
    () => new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date()),
    [],
  );

  const totals = useMemo(() => {
    const subTotal = cart.reduce((sum, line) => sum + line.qty * line.price, 0);
    const discountAmount = discountType === 'percent' ? (subTotal * discount) / 100 : Math.min(discount, subTotal);
    const taxable = Math.max(subTotal - discountAmount, 0);
    const tax = cart.reduce((sum, line) => {
      const lineTaxable = subTotal > 0 ? ((line.qty * line.price) / subTotal) * taxable : 0;
      return sum + lineTaxable * line.taxRate;
    }, 0);
    const grandTotal = taxable + tax;
    return { subTotal, discountAmount, tax, grandTotal };
  }, [cart, discount, discountType]);

  const changeAmount = receivedAmount - totals.grandTotal;

  const handleAddItem = (code) => {
    setCart((prev) => {
      const existing = prev.find((line) => line.code === code);
      if (existing) {
        return prev.map((line) => (line.code === code ? { ...line, qty: line.qty + 1 } : line));
      }
      const item = ITEM_BY_CODE[code];
      return [...prev, { code, qty: 1, name: item.name, uom: item.uom, price: item.price, taxRate: TAX_RATE }];
    });
  };

  const handleQtyChange = (code, qty) => {
    setCart((prev) => prev.map((line) => (line.code === code ? { ...line, qty } : line)));
  };

  const handleRemove = (code) => {
    setCart((prev) => prev.filter((line) => line.code !== code));
  };

  const handleHoldBill = () => dispatch(showToast('Bill held. Resume it later from Sales Order.', 'info'));
  const handleClear = () => {
    setCart([]);
    setDiscount(0);
    dispatch(showToast('Cart cleared', 'info'));
  };
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };
  const handleAddCustomer = () => setAddCustomerOpen(true);
  const handleCustomerCreated = (newCustomer) => {
    setCustomer(newCustomer);
    setAddCustomerOpen(false);
    dispatch(showToast('Customer saved successfully', 'success'));
  };
  const handlePayAndPrint = () => {
    if (cart.length === 0) {
      dispatch(showToast('Add at least one item before taking payment', 'warning'));
      return;
    }
    dispatch(showToast('Payment captured — printing invoice…', 'success'));
  };
  const handlePrintInvoice = () => dispatch(showToast('Print Invoice is coming soon', 'info'));
  const handleEmailOrWhatsapp = () => dispatch(showToast('Email / WhatsApp is coming soon', 'info'));

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Line Sale</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Line Sale</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="warning" onClick={handleHoldBill}>Hold Bill</Button>
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
            <MenuItem onClick={() => handleMoreAction('Apply Promotion')}>Apply Promotion</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Redeem Voucher')}>Redeem Voucher</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Void Sale')}>Void Sale</MenuItem>
          </Menu>
        </Stack>
      </Stack>

      <BillSummaryRow
        customerName={customer.name}
        billNo={billNo}
        cashierName={user?.name || 'Admin'}
        dateTime={dateTime}
        onAddCustomer={handleAddCustomer}
      />

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box sx={{ height: { lg: 560 } }}>
            <ItemsPanel onAddItem={handleAddItem} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box sx={{ height: { lg: 560 } }}>
            <CartPanel
              lines={cart}
              onQtyChange={handleQtyChange}
              onRemove={handleRemove}
              discount={discount}
              discountType={discountType}
              onDiscountChange={setDiscount}
              onDiscountTypeChange={setDiscountType}
              totals={totals}
            />
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <CustomerDetailsCard customer={customer} onAddCustomer={handleAddCustomer} />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <PaymentMethodsCard
            methods={PAYMENT_METHODS}
            selectedMethod={paymentMethod}
            onSelectMethod={setPaymentMethod}
            receivedAmount={receivedAmount}
            onReceivedAmountChange={setReceivedAmount}
            quickAmounts={QUICK_AMOUNTS}
            changeAmount={changeAmount}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <PaymentActionsCard
            onPayAndPrint={handlePayAndPrint}
            onPrintInvoice={handlePrintInvoice}
            onEmailOrWhatsapp={handleEmailOrWhatsapp}
            printSettingsEnabled={printSettingsEnabled}
            onTogglePrintSettings={setPrintSettingsEnabled}
            disabled={cart.length === 0}
          />
        </Grid>
      </Grid>

      <AddCustomerDialog
        open={addCustomerOpen}
        onClose={() => setAddCustomerOpen(false)}
        onCustomerCreated={handleCustomerCreated}
      />
    </Stack>
  );
}
