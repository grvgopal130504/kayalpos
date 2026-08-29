import { useState } from 'react';
import BarcodeLabelOverviewPage from './BarcodeLabelOverviewPage';
import BarcodeLabelStatusPage from './BarcodeLabelStatusPage';
import CreateBarcodeLabelPage from './CreateBarcodeLabelPage';

/**
 * Zero-chrome state container for the Barcode & Label module — tracks
 * which sub-page is active and renders that sub-page's full self-contained
 * component (own header/breadcrumb/action buttons), so everything stays
 * on one route without page-chrome duplication. Mirrors SalesInvoicePage/
 * SalesOrderPage/SalesQuotationPage.
 */
export default function BarcodeLabelPage() {
  const [tab, setTab] = useState('all');

  if (tab === 'create') {
    return <CreateBarcodeLabelPage onBack={() => setTab('all')} />;
  }
  if (tab === 'all') {
    return <BarcodeLabelOverviewPage tab={tab} onTabChange={setTab} onCreate={() => setTab('create')} />;
  }
  return (
    <BarcodeLabelStatusPage
      status={tab}
      tab={tab}
      onTabChange={setTab}
      onCreate={() => setTab('create')}
    />
  );
}
