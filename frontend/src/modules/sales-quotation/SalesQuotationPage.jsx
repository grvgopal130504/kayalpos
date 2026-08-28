import { useState } from 'react';

import SalesQuotationOverviewPage from './SalesQuotationOverviewPage';
import SalesQuotationStatusPage from './SalesQuotationStatusPage';
import CreateSalesQuotationPage from './CreateSalesQuotationPage';

/**
 * Landing page for the sidebar's Sales Quotation item. Previously this was
 * a card grid linking out to separate Sales Quotation/Draft/Converted/
 * Expired/New Quotation routes; now it's a thin state holder with no
 * chrome of its own — it just tracks which one is active and renders that
 * page's full header + content (title, breadcrumb, and that page's own
 * action buttons, which differ between the list views and the create
 * form). The single All/Draft/Converted/Expired tab row lives inside
 * SalesQuotationTable itself (matching the reference design), and is
 * lifted here via `tab`/`onTabChange` so clicking it swaps the whole page
 * body instead of just filtering the table's rows.
 */
export default function SalesQuotationPage() {
  const [tab, setTab] = useState('all');

  if (tab === 'create') {
    return <CreateSalesQuotationPage onBack={() => setTab('all')} />;
  }

  if (tab === 'all') {
    return <SalesQuotationOverviewPage tab={tab} onTabChange={setTab} onCreate={() => setTab('create')} />;
  }

  return (
    <SalesQuotationStatusPage
      status={tab}
      tab={tab}
      onTabChange={setTab}
      onCreate={() => setTab('create')}
    />
  );
}
