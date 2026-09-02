import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './modules/auth/LoginPage';
import HomePage from './modules/dashboard/HomePage';
import ManagementDashboardPage from './modules/dashboard/ManagementDashboardPage';
import LineSalePage from './modules/line-sale/LineSalePage';
import SalesReturnPage from './modules/sales-return/SalesReturnPage';
import PromotionPage from './modules/promotion/PromotionPage';
import CreatePromotionPage from './modules/promotion/CreatePromotionPage';
import PromotionViewPage from './modules/promotion/PromotionViewPage';
import GiftVoucherPage from './modules/gift-voucher/GiftVoucherPage';
import CreateGiftVoucherPage from './modules/gift-voucher/CreateGiftVoucherPage';
import GiftVoucherViewPage from './modules/gift-voucher/GiftVoucherViewPage';
import LoyaltyPage from './modules/loyalty/LoyaltyPage';
import CreateLoyaltyProgramPage from './modules/loyalty/CreateLoyaltyProgramPage';
import LoyaltyViewPage from './modules/loyalty/LoyaltyViewPage';
import CustomerPage from './modules/customer/CustomerPage';
import SalesQuotationPage from './modules/sales-quotation/SalesQuotationPage';
import SalesQuotationOverviewPage from './modules/sales-quotation/SalesQuotationOverviewPage';
import SalesQuotationStatusPage from './modules/sales-quotation/SalesQuotationStatusPage';
import CreateSalesQuotationPage from './modules/sales-quotation/CreateSalesQuotationPage';
import QuotationViewPage from './modules/sales-quotation/QuotationViewPage';
import SalesOrderPage from './modules/sales-order/SalesOrderPage';
import SalesOrderOverviewPage from './modules/sales-order/SalesOrderOverviewPage';
import SalesOrderStatusPage from './modules/sales-order/SalesOrderStatusPage';
import CreateSalesOrderPage from './modules/sales-order/CreateSalesOrderPage';
import OrderViewPage from './modules/sales-order/OrderViewPage';
import SalesInvoicePage from './modules/sales-invoice/SalesInvoicePage';
import SalesInvoiceOverviewPage from './modules/sales-invoice/SalesInvoiceOverviewPage';
import SalesInvoiceStatusPage from './modules/sales-invoice/SalesInvoiceStatusPage';
import CreateSalesInvoicePage from './modules/sales-invoice/CreateSalesInvoicePage';
import InvoiceViewPage from './modules/sales-invoice/InvoiceViewPage';
import BarcodeLabelPage from './modules/barcode-label/BarcodeLabelPage';
import BarcodeLabelOverviewPage from './modules/barcode-label/BarcodeLabelOverviewPage';
import BarcodeLabelStatusPage from './modules/barcode-label/BarcodeLabelStatusPage';
import CreateBarcodeLabelPage from './modules/barcode-label/CreateBarcodeLabelPage';
import BarcodeLabelViewPage from './modules/barcode-label/BarcodeLabelViewPage';
import StockIndentPage from './modules/stock-indent/StockIndentPage';
import StockIndentOverviewPage from './modules/stock-indent/StockIndentOverviewPage';
import StockIndentStatusPage from './modules/stock-indent/StockIndentStatusPage';
import CreateStockIndentPage from './modules/stock-indent/CreateStockIndentPage';
import IndentViewPage from './modules/stock-indent/IndentViewPage';
import StockTransferPage from './modules/stock-transfer/StockTransferPage';
import StockTransferOverviewPage from './modules/stock-transfer/StockTransferOverviewPage';
import StockTransferStatusPage from './modules/stock-transfer/StockTransferStatusPage';
import CreateStockTransferPage from './modules/stock-transfer/CreateStockTransferPage';
import TransferViewPage from './modules/stock-transfer/TransferViewPage';
import StockReceiptPage from './modules/stock-receipt/StockReceiptPage';
import CreateStockReceiptPage from './modules/stock-receipt/CreateStockReceiptPage';
import ReceiptViewPage from './modules/stock-receipt/ReceiptViewPage';
import StockReturnPage from './modules/stock-return/StockReturnPage';
import CreateStockReturnPage from './modules/stock-return/CreateStockReturnPage';
import ReturnViewPage from './modules/stock-return/ReturnViewPage';
import StockWastagePage from './modules/stock-wastage/StockWastagePage';
import CreateStockWastagePage from './modules/stock-wastage/CreateStockWastagePage';
import WastageViewPage from './modules/stock-wastage/WastageViewPage';
import StockCountPage from './modules/stock-count/StockCountPage';
import CreateStockCountPage from './modules/stock-count/CreateStockCountPage';
import CountViewPage from './modules/stock-count/CountViewPage';
import CashierPanelPage from './modules/cashier-panel/CashierPanelPage';
import CashierLoginPage from './modules/cashier-panel/CashierLoginPage';
import ShiftOpeningPage from './modules/cashier-panel/ShiftOpeningPage';
import CashSalesPage from './modules/cashier-panel/CashSalesPage';
import CardSalesPage from './modules/cashier-panel/CardSalesPage';
import UpiSalesPage from './modules/cashier-panel/UpiSalesPage';
import OtherPaymentsPage from './modules/cashier-panel/OtherPaymentsPage';
import CashWithdrawalPage from './modules/cashier-panel/CashWithdrawalPage';
import CashDepositPage from './modules/cashier-panel/CashDepositPage';
import CashTransferPage from './modules/cashier-panel/CashTransferPage';
import CashDrawerOpeningPage from './modules/cashier-panel/CashDrawerOpeningPage';
import ShiftClosingPage from './modules/cashier-panel/ShiftClosingPage';
import CashReconciliationPage from './modules/cashier-panel/CashReconciliationPage';
import ShortageExcessPage from './modules/cashier-panel/ShortageExcessPage';
import CashierWiseSalesPage from './modules/cashier-panel/CashierWiseSalesPage';
import ExpensesBookPage from './modules/expenses-book/ExpensesBookPage';
import AddExpensePage from './modules/expenses-book/AddExpensePage';
import ReportsPage from './modules/reports/ReportsPage';
import SalesReportsPage from './modules/reports/sales/SalesReportsPage';
import InventoryReportsPage from './modules/reports/inventory/InventoryReportsPage';
import PurchaseReportsPage from './modules/reports/purchase/PurchaseReportsPage';
import CashierReportsPage from './modules/reports/cashier/CashierReportsPage';
import FinancialReportsPage from './modules/reports/financial/FinancialReportsPage';
import SapReportsPage from './modules/reports/sap/SapReportsPage';
import MasterSyncPage from './modules/master-sync/MasterSyncPage';
import StockSyncPage from './modules/stock-sync/StockSyncPage';
import MastersPage from './modules/masters/MastersPage';
import CompanyPage from './modules/masters/company/CompanyPage';
import OutletPage from './modules/masters/outlet/OutletPage';
import WarehousePage from './modules/masters/warehouse/WarehousePage';
import ProductPage from './modules/masters/product/ProductPage';
import BrandPage from './modules/masters/brand/BrandPage';
import UomPage from './modules/masters/uom/UomPage';
import TaxCodePage from './modules/masters/tax-code/TaxCodePage';
import HsnSacPage from './modules/masters/hsn-sac/HsnSacPage';
import SellingPricePage from './modules/masters/selling-price/SellingPricePage';
import PriceListPage from './modules/masters/price-list/PriceListPage';
import BatchSerialPage from './modules/masters/batch-serial/BatchSerialPage';
import SupplierPage from './modules/masters/supplier/SupplierPage';
import EmployeePage from './modules/masters/employee/EmployeePage';
import AddNewCustomerPage from './modules/customer/AddNewCustomerPage';
import CustomerViewPage from './modules/customer/CustomerViewPage';
import SettingsPage from './modules/settings/SettingsPage';
import ProfilePage from './modules/settings/ProfilePage';
import ProtectedRoute from './routes/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import GlobalToast from './components/common/GlobalToast';
import { useAuthSync } from './hooks/useAuthSync';
import { useInactivityTimeout } from './hooks/useInactivityTimeout';

export default function App() {
  useAuthSync();
  useInactivityTimeout();
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/dashboard" element={<ManagementDashboardPage />} />
            <Route path="/line-sale" element={<LineSalePage />} />
            <Route path="/sales-return" element={<SalesReturnPage />} />
            <Route path="/promotion" element={<PromotionPage />} />
            <Route path="/promotion/create" element={<CreatePromotionPage />} />
            <Route path="/promotion/edit/:code" element={<CreatePromotionPage />} />
            <Route path="/promotion/view/:code" element={<PromotionViewPage />} />
            <Route path="/gift-voucher" element={<GiftVoucherPage />} />
            <Route path="/gift-voucher/create" element={<CreateGiftVoucherPage />} />
            <Route path="/gift-voucher/edit/:code" element={<CreateGiftVoucherPage />} />
            <Route path="/gift-voucher/view/:code" element={<GiftVoucherViewPage />} />
            <Route path="/loyalty" element={<LoyaltyPage />} />
            <Route path="/loyalty/create" element={<CreateLoyaltyProgramPage />} />
            <Route path="/loyalty/edit/:code" element={<CreateLoyaltyProgramPage />} />
            <Route path="/loyalty/view/:code" element={<LoyaltyViewPage />} />
            <Route path="/customer" element={<CustomerPage />} />
            <Route path="/customer/add" element={<AddNewCustomerPage />} />
            <Route path="/customer/edit/:code" element={<AddNewCustomerPage />} />
            <Route path="/customer/view/:code" element={<CustomerViewPage />} />
            <Route path="/sales-quotation" element={<SalesQuotationPage />} />
            <Route path="/sales-quotation/overview" element={<SalesQuotationOverviewPage />} />
            <Route path="/sales-quotation/draft" element={<SalesQuotationStatusPage status="draft" />} />
            <Route path="/sales-quotation/converted" element={<SalesQuotationStatusPage status="converted" />} />
            <Route path="/sales-quotation/expired" element={<SalesQuotationStatusPage status="expired" />} />
            <Route path="/sales-quotation/create" element={<CreateSalesQuotationPage />} />
            <Route path="/sales-quotation/edit/:code" element={<CreateSalesQuotationPage />} />
            <Route path="/sales-quotation/view/:code" element={<QuotationViewPage />} />
            <Route path="/sales-order" element={<SalesOrderPage />} />
            <Route path="/sales-order/overview" element={<SalesOrderOverviewPage />} />
            <Route path="/sales-order/pending" element={<SalesOrderStatusPage status="pending" />} />
            <Route path="/sales-order/confirmed" element={<SalesOrderStatusPage status="confirmed" />} />
            <Route path="/sales-order/delivered" element={<SalesOrderStatusPage status="delivered" />} />
            <Route path="/sales-order/create" element={<CreateSalesOrderPage />} />
            <Route path="/sales-order/edit/:code" element={<CreateSalesOrderPage />} />
            <Route path="/sales-order/view/:code" element={<OrderViewPage />} />
            <Route path="/sales-invoice" element={<SalesInvoicePage />} />
            <Route path="/sales-invoice/overview" element={<SalesInvoiceOverviewPage />} />
            <Route path="/sales-invoice/draft" element={<SalesInvoiceStatusPage status="draft" />} />
            <Route path="/sales-invoice/sent" element={<SalesInvoiceStatusPage status="sent" />} />
            <Route path="/sales-invoice/paid" element={<SalesInvoiceStatusPage status="paid" />} />
            <Route path="/sales-invoice/overdue" element={<SalesInvoiceStatusPage status="overdue" />} />
            <Route path="/sales-invoice/create" element={<CreateSalesInvoicePage />} />
            <Route path="/sales-invoice/edit/:code" element={<CreateSalesInvoicePage />} />
            <Route path="/sales-invoice/view/:code" element={<InvoiceViewPage />} />
            <Route path="/barcode-label" element={<BarcodeLabelPage />} />
            <Route path="/barcode-label/overview" element={<BarcodeLabelOverviewPage />} />
            <Route path="/barcode-label/draft" element={<BarcodeLabelStatusPage status="draft" />} />
            <Route path="/barcode-label/pending-print" element={<BarcodeLabelStatusPage status="pending-print" />} />
            <Route path="/barcode-label/printed" element={<BarcodeLabelStatusPage status="printed" />} />
            <Route path="/barcode-label/create" element={<CreateBarcodeLabelPage />} />
            <Route path="/barcode-label/edit/:code" element={<CreateBarcodeLabelPage />} />
            <Route path="/barcode-label/view/:code" element={<BarcodeLabelViewPage />} />
            <Route path="/stock-indent" element={<StockIndentPage />} />
            <Route path="/stock-indent/overview" element={<StockIndentOverviewPage />} />
            <Route path="/stock-indent/draft" element={<StockIndentStatusPage status="draft" />} />
            <Route path="/stock-indent/pending-approval" element={<StockIndentStatusPage status="pending-approval" />} />
            <Route path="/stock-indent/approved" element={<StockIndentStatusPage status="approved" />} />
            <Route path="/stock-indent/rejected" element={<StockIndentStatusPage status="rejected" />} />
            <Route path="/stock-indent/create" element={<CreateStockIndentPage />} />
            <Route path="/stock-indent/edit/:code" element={<CreateStockIndentPage />} />
            <Route path="/stock-indent/view/:code" element={<IndentViewPage />} />
            <Route path="/stock-transfer" element={<StockTransferPage />} />
            <Route path="/stock-transfer/overview" element={<StockTransferOverviewPage />} />
            <Route path="/stock-transfer/draft" element={<StockTransferStatusPage status="draft" />} />
            <Route path="/stock-transfer/in-transit" element={<StockTransferStatusPage status="in-transit" />} />
            <Route path="/stock-transfer/received" element={<StockTransferStatusPage status="received" />} />
            <Route path="/stock-transfer/cancelled" element={<StockTransferStatusPage status="cancelled" />} />
            <Route path="/stock-transfer/create" element={<CreateStockTransferPage />} />
            <Route path="/stock-transfer/edit/:code" element={<CreateStockTransferPage />} />
            <Route path="/stock-transfer/view/:code" element={<TransferViewPage />} />
            <Route path="/stock-receipt" element={<StockReceiptPage />} />
            <Route path="/stock-receipt/create" element={<CreateStockReceiptPage />} />
            <Route path="/stock-receipt/edit/:code" element={<CreateStockReceiptPage />} />
            <Route path="/stock-receipt/view/:code" element={<ReceiptViewPage />} />
            <Route path="/stock-return" element={<StockReturnPage />} />
            <Route path="/stock-return/create" element={<CreateStockReturnPage />} />
            <Route path="/stock-return/edit/:code" element={<CreateStockReturnPage />} />
            <Route path="/stock-return/view/:code" element={<ReturnViewPage />} />
            <Route path="/stock-wastage" element={<StockWastagePage />} />
            <Route path="/stock-wastage/create" element={<CreateStockWastagePage />} />
            <Route path="/stock-wastage/edit/:code" element={<CreateStockWastagePage />} />
            <Route path="/stock-wastage/view/:code" element={<WastageViewPage />} />
            <Route path="/stock-count" element={<StockCountPage />} />
            <Route path="/stock-count/create" element={<CreateStockCountPage />} />
            <Route path="/stock-count/edit/:code" element={<CreateStockCountPage />} />
            <Route path="/stock-count/view/:code" element={<CountViewPage />} />
            <Route path="/expenses-book" element={<ExpensesBookPage />} />
            <Route path="/expenses-book/add" element={<AddExpensePage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/sales" element={<SalesReportsPage />} />
            <Route path="/reports/inventory" element={<InventoryReportsPage />} />
            <Route path="/reports/purchase" element={<PurchaseReportsPage />} />
            <Route path="/reports/cashier" element={<CashierReportsPage />} />
            <Route path="/reports/financial" element={<FinancialReportsPage />} />
            <Route path="/reports/sap" element={<SapReportsPage />} />
            <Route path="/master-sync" element={<MasterSyncPage />} />
            <Route path="/stock-sync" element={<StockSyncPage />} />
            <Route path="/masters" element={<MastersPage />} />
            <Route path="/masters/company" element={<CompanyPage />} />
            <Route path="/masters/outlet" element={<OutletPage />} />
            <Route path="/masters/warehouse" element={<WarehousePage />} />
            <Route path="/masters/product" element={<ProductPage />} />
            <Route path="/masters/brand" element={<BrandPage />} />
            <Route path="/masters/uom" element={<UomPage />} />
            <Route path="/masters/tax-code" element={<TaxCodePage />} />
            <Route path="/masters/hsn-sac" element={<HsnSacPage />} />
            <Route path="/masters/selling-price" element={<SellingPricePage />} />
            <Route path="/masters/price-list" element={<PriceListPage />} />
            <Route path="/masters/batch-serial" element={<BatchSerialPage />} />
            <Route path="/masters/supplier" element={<SupplierPage />} />
            <Route path="/masters/employee" element={<EmployeePage />} />
            <Route path="/cashier-panel" element={<CashierPanelPage />} />
            <Route path="/cashier-panel/login" element={<CashierLoginPage />} />
            <Route path="/cashier-panel/shift-opening" element={<ShiftOpeningPage />} />
            <Route path="/cashier-panel/cash-sales" element={<CashSalesPage />} />
            <Route path="/cashier-panel/card-sales" element={<CardSalesPage />} />
            <Route path="/cashier-panel/upi-sales" element={<UpiSalesPage />} />
            <Route path="/cashier-panel/other-payments" element={<OtherPaymentsPage />} />
            <Route path="/cashier-panel/cash-withdrawal" element={<CashWithdrawalPage />} />
            <Route path="/cashier-panel/cash-deposit" element={<CashDepositPage />} />
            <Route path="/cashier-panel/cash-transfer" element={<CashTransferPage />} />
            <Route path="/cashier-panel/cash-drawer-opening" element={<CashDrawerOpeningPage />} />
            <Route path="/cashier-panel/shift-closing" element={<ShiftClosingPage />} />
            <Route path="/cashier-panel/cash-reconciliation" element={<CashReconciliationPage />} />
            <Route path="/cashier-panel/shortage-excess" element={<ShortageExcessPage />} />
            <Route path="/cashier-panel/cashier-wise-sales" element={<CashierWiseSalesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/profile" element={<ProfilePage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <GlobalToast />
    </>
  );
}
