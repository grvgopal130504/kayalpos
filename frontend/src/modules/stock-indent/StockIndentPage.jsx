import { useState } from 'react';
import StockIndentOverviewPage from './StockIndentOverviewPage';
import StockIndentStatusPage from './StockIndentStatusPage';
import CreateStockIndentPage from './CreateStockIndentPage';

/**
 * Zero-chrome state container for the Stock Indent module — tracks which
 * sub-page is active and renders that sub-page's full self-contained
 * component (own header/breadcrumb/action buttons), so everything stays
 * on one route without page-chrome duplication. Mirrors SalesInvoicePage/
 * BarcodeLabelPage.
 */
export default function StockIndentPage() {
  const [tab, setTab] = useState('all');

  if (tab === 'create') {
    return <CreateStockIndentPage onBack={() => setTab('all')} />;
  }
  if (tab === 'all') {
    return <StockIndentOverviewPage tab={tab} onTabChange={setTab} onCreate={() => setTab('create')} />;
  }
  return (
    <StockIndentStatusPage
      status={tab}
      tab={tab}
      onTabChange={setTab}
      onCreate={() => setTab('create')}
    />
  );
}
