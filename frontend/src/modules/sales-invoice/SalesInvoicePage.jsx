import { useState } from 'react';
import SalesInvoiceOverviewPage from './SalesInvoiceOverviewPage';
import SalesInvoiceStatusPage from './SalesInvoiceStatusPage';
import CreateSalesInvoicePage from './CreateSalesInvoicePage';

/**
 * Zero-chrome state container for the Sales Invoice module — tracks which
 * sub-page is active and renders that sub-page's full self-contained
 * component (own header/breadcrumb/action buttons), so everything stays on
 * one route without page-chrome duplication. Mirrors SalesOrderPage/
 * SalesQuotationPage.
 */
export default function SalesInvoicePage() {
  const [tab, setTab] = useState('all');

  if (tab === 'create') {
    return <CreateSalesInvoicePage onBack={() => setTab('all')} />;
  }
  if (tab === 'all') {
    return <SalesInvoiceOverviewPage tab={tab} onTabChange={setTab} onCreate={() => setTab('create')} />;
  }
  return (
    <SalesInvoiceStatusPage
      status={tab}
      tab={tab}
      onTabChange={setTab}
      onCreate={() => setTab('create')}
    />
  );
}
