import { useState } from 'react';
import SalesOrderOverviewPage from './SalesOrderOverviewPage';
import SalesOrderStatusPage from './SalesOrderStatusPage';
import CreateSalesOrderPage from './CreateSalesOrderPage';

/**
 * Zero-chrome state container for the Sales Order module — tracks which
 * sub-page is active and renders that sub-page's full self-contained
 * component (own header/breadcrumb/action buttons), so everything stays on
 * one route without page-chrome duplication. Mirrors SalesQuotationPage.
 */
export default function SalesOrderPage() {
  const [tab, setTab] = useState('all');

  if (tab === 'create') {
    return <CreateSalesOrderPage onBack={() => setTab('all')} />;
  }
  if (tab === 'all') {
    return <SalesOrderOverviewPage tab={tab} onTabChange={setTab} onCreate={() => setTab('create')} />;
  }
  return (
    <SalesOrderStatusPage
      status={tab}
      tab={tab}
      onTabChange={setTab}
      onCreate={() => setTab('create')}
    />
  );
}
