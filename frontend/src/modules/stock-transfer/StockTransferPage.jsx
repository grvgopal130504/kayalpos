import { useState } from 'react';
import StockTransferOverviewPage from './StockTransferOverviewPage';
import StockTransferStatusPage from './StockTransferStatusPage';
import CreateStockTransferPage from './CreateStockTransferPage';

/**
 * Zero-chrome state container for the Stock Transfer module — tracks
 * which sub-page is active and renders that sub-page's full self-contained
 * component (own header/breadcrumb/action buttons), so everything stays
 * on one route without page-chrome duplication. Mirrors StockIndentPage.
 */
export default function StockTransferPage() {
  const [tab, setTab] = useState('all');

  if (tab === 'create') {
    return <CreateStockTransferPage onBack={() => setTab('all')} />;
  }
  if (tab === 'all') {
    return <StockTransferOverviewPage tab={tab} onTabChange={setTab} onCreate={() => setTab('create')} />;
  }
  return (
    <StockTransferStatusPage
      status={tab}
      tab={tab}
      onTabChange={setTab}
      onCreate={() => setTab('create')}
    />
  );
}
