import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './modules/auth/LoginPage';
import HomePage from './modules/dashboard/HomePage';
import ManagementDashboardPage from './modules/dashboard/ManagementDashboardPage';
import LineSalePage from './modules/line-sale/LineSalePage';
import SalesReturnPage from './modules/sales-return/SalesReturnPage';
import PromotionPage from './modules/promotion/PromotionPage';
import PromotionOverviewPage from './modules/promotion/PromotionOverviewPage';
import PromotionStatusPage from './modules/promotion/PromotionStatusPage';
import CreatePromotionPage from './modules/promotion/CreatePromotionPage';
import CreateGiftVoucherPage from './modules/gift-voucher/CreateGiftVoucherPage';
import CreateLoyaltyProgramPage from './modules/loyalty/CreateLoyaltyProgramPage';
import CustomerPage from './modules/customer/CustomerPage';
import SalesQuotationPage from './modules/sales-quotation/SalesQuotationPage';
import SalesQuotationOverviewPage from './modules/sales-quotation/SalesQuotationOverviewPage';
import SalesQuotationStatusPage from './modules/sales-quotation/SalesQuotationStatusPage';
import CreateSalesQuotationPage from './modules/sales-quotation/CreateSalesQuotationPage';
import SalesOrderPage from './modules/sales-order/SalesOrderPage';
import SalesOrderOverviewPage from './modules/sales-order/SalesOrderOverviewPage';
import SalesOrderStatusPage from './modules/sales-order/SalesOrderStatusPage';
import CreateSalesOrderPage from './modules/sales-order/CreateSalesOrderPage';
import SalesInvoicePage from './modules/sales-invoice/SalesInvoicePage';
import SalesInvoiceOverviewPage from './modules/sales-invoice/SalesInvoiceOverviewPage';
import SalesInvoiceStatusPage from './modules/sales-invoice/SalesInvoiceStatusPage';
import CreateSalesInvoicePage from './modules/sales-invoice/CreateSalesInvoicePage';
import BarcodeLabelPage from './modules/barcode-label/BarcodeLabelPage';
import BarcodeLabelOverviewPage from './modules/barcode-label/BarcodeLabelOverviewPage';
import BarcodeLabelStatusPage from './modules/barcode-label/BarcodeLabelStatusPage';
import CreateBarcodeLabelPage from './modules/barcode-label/CreateBarcodeLabelPage';
import StockIndentPage from './modules/stock-indent/StockIndentPage';
import StockIndentOverviewPage from './modules/stock-indent/StockIndentOverviewPage';
import StockIndentStatusPage from './modules/stock-indent/StockIndentStatusPage';
import CreateStockIndentPage from './modules/stock-indent/CreateStockIndentPage';
import StockTransferPage from './modules/stock-transfer/StockTransferPage';
import StockTransferOverviewPage from './modules/stock-transfer/StockTransferOverviewPage';
import StockTransferStatusPage from './modules/stock-transfer/StockTransferStatusPage';
import CreateStockTransferPage from './modules/stock-transfer/CreateStockTransferPage';
import AddNewCustomerPage from './modules/customer/AddNewCustomerPage';
import ProtectedRoute from './routes/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import GlobalToast from './components/common/GlobalToast';

export default function App() {
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
            <Route path="/promotion/overview" element={<PromotionOverviewPage />} />
            <Route path="/promotion/active" element={<PromotionStatusPage status="active" />} />
            <Route path="/promotion/upcoming" element={<PromotionStatusPage status="upcoming" />} />
            <Route path="/promotion/expired" element={<PromotionStatusPage status="expired" />} />
            <Route path="/promotion/create" element={<CreatePromotionPage />} />
            <Route path="/gift-voucher" element={<CreateGiftVoucherPage />} />
            <Route path="/gift-voucher/create" element={<CreateGiftVoucherPage />} />
            <Route path="/loyalty" element={<CreateLoyaltyProgramPage />} />
            <Route path="/loyalty/create" element={<CreateLoyaltyProgramPage />} />
            <Route path="/customer" element={<CustomerPage />} />
            <Route path="/customer/add" element={<AddNewCustomerPage />} />
            <Route path="/sales-quotation" element={<SalesQuotationPage />} />
            <Route path="/sales-quotation/overview" element={<SalesQuotationOverviewPage />} />
            <Route path="/sales-quotation/draft" element={<SalesQuotationStatusPage status="draft" />} />
            <Route path="/sales-quotation/converted" element={<SalesQuotationStatusPage status="converted" />} />
            <Route path="/sales-quotation/expired" element={<SalesQuotationStatusPage status="expired" />} />
            <Route path="/sales-quotation/create" element={<CreateSalesQuotationPage />} />
            <Route path="/sales-order" element={<SalesOrderPage />} />
            <Route path="/sales-order/overview" element={<SalesOrderOverviewPage />} />
            <Route path="/sales-order/pending" element={<SalesOrderStatusPage status="pending" />} />
            <Route path="/sales-order/confirmed" element={<SalesOrderStatusPage status="confirmed" />} />
            <Route path="/sales-order/delivered" element={<SalesOrderStatusPage status="delivered" />} />
            <Route path="/sales-order/create" element={<CreateSalesOrderPage />} />
            <Route path="/sales-invoice" element={<SalesInvoicePage />} />
            <Route path="/sales-invoice/overview" element={<SalesInvoiceOverviewPage />} />
            <Route path="/sales-invoice/draft" element={<SalesInvoiceStatusPage status="draft" />} />
            <Route path="/sales-invoice/sent" element={<SalesInvoiceStatusPage status="sent" />} />
            <Route path="/sales-invoice/paid" element={<SalesInvoiceStatusPage status="paid" />} />
            <Route path="/sales-invoice/overdue" element={<SalesInvoiceStatusPage status="overdue" />} />
            <Route path="/sales-invoice/create" element={<CreateSalesInvoicePage />} />
            <Route path="/barcode-label" element={<BarcodeLabelPage />} />
            <Route path="/barcode-label/overview" element={<BarcodeLabelOverviewPage />} />
            <Route path="/barcode-label/draft" element={<BarcodeLabelStatusPage status="draft" />} />
            <Route path="/barcode-label/pending-print" element={<BarcodeLabelStatusPage status="pending-print" />} />
            <Route path="/barcode-label/printed" element={<BarcodeLabelStatusPage status="printed" />} />
            <Route path="/barcode-label/create" element={<CreateBarcodeLabelPage />} />
            <Route path="/stock-indent" element={<StockIndentPage />} />
            <Route path="/stock-indent/overview" element={<StockIndentOverviewPage />} />
            <Route path="/stock-indent/draft" element={<StockIndentStatusPage status="draft" />} />
            <Route path="/stock-indent/pending-approval" element={<StockIndentStatusPage status="pending-approval" />} />
            <Route path="/stock-indent/approved" element={<StockIndentStatusPage status="approved" />} />
            <Route path="/stock-indent/rejected" element={<StockIndentStatusPage status="rejected" />} />
            <Route path="/stock-indent/create" element={<CreateStockIndentPage />} />
            <Route path="/stock-transfer" element={<StockTransferPage />} />
            <Route path="/stock-transfer/overview" element={<StockTransferOverviewPage />} />
            <Route path="/stock-transfer/draft" element={<StockTransferStatusPage status="draft" />} />
            <Route path="/stock-transfer/in-transit" element={<StockTransferStatusPage status="in-transit" />} />
            <Route path="/stock-transfer/received" element={<StockTransferStatusPage status="received" />} />
            <Route path="/stock-transfer/cancelled" element={<StockTransferStatusPage status="cancelled" />} />
            <Route path="/stock-transfer/create" element={<CreateStockTransferPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <GlobalToast />
    </>
  );
}
