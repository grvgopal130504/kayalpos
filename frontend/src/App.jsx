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
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <GlobalToast />
    </>
  );
}
