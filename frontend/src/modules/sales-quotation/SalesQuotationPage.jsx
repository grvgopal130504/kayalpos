import { useState } from 'react';

import SalesQuotationOverviewPage from './SalesQuotationOverviewPage';
import SalesQuotationStatusPage from './SalesQuotationStatusPage';
import CreateSalesQuotationPage from './CreateSalesQuotationPage';
import QuotationViewPage from './QuotationViewPage';

/**
 * Landing page for the sidebar's Sales Quotation item — a single page that
 * hosts the list (All/Draft/Converted/Expired), the create/edit form, and
 * the read-only view, all swapped in place via local state instead of
 * separate /create, /edit/:code, /view/:code routes. Clicking "New
 * Quotation", a row's "View", or a row's "Edit" just swaps which body
 * renders here — the browser stays on /sales-quotation throughout.
 */
export default function SalesQuotationPage() {
  const [tab, setTab] = useState('all');
  const [activeCode, setActiveCode] = useState(null);

  const goToList = () => {
    setActiveCode(null);
    setTab('all');
  };
  const openCreate = () => {
    setActiveCode(null);
    setTab('create');
  };
  const openEdit = (code) => {
    setActiveCode(code);
    setTab('edit');
  };
  const openView = (code) => {
    setActiveCode(code);
    setTab('view');
  };

  if (tab === 'create' || tab === 'edit') {
    return (
      <CreateSalesQuotationPage
        code={tab === 'edit' ? activeCode : undefined}
        onBack={tab === 'edit' ? () => openView(activeCode) : goToList}
      />
    );
  }

  if (tab === 'view') {
    return <QuotationViewPage code={activeCode} onBack={goToList} onEdit={() => openEdit(activeCode)} />;
  }

  if (tab === 'all') {
    return (
      <SalesQuotationOverviewPage
        tab={tab}
        onTabChange={setTab}
        onCreate={openCreate}
        onView={openView}
        onEdit={openEdit}
      />
    );
  }

  return (
    <SalesQuotationStatusPage
      status={tab}
      tab={tab}
      onTabChange={setTab}
      onCreate={openCreate}
      onView={openView}
      onEdit={openEdit}
    />
  );
}
