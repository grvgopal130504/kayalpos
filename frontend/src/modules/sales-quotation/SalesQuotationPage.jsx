import { useState } from 'react';

import SalesQuotationOverviewPage from './SalesQuotationOverviewPage';
import SalesQuotationStatusPage from './SalesQuotationStatusPage';
import CreateSalesQuotationPage from './CreateSalesQuotationPage';
import QuotationViewPage from './QuotationViewPage';

/**
 * Landing page for the sidebar's Sales Quotation item — a single page that
 * hosts the list (All/Draft/Pending or "Converted"/Expired), the create/edit
 * form, and the read-only view, all swapped in place via local state instead
 * of separate /create, /edit/:id, /view/:id routes. Clicking "New
 * Quotation", a row's "View", or a row's "Edit" just swaps which body
 * renders here — the browser stays on /sales-quotation throughout.
 */
export default function SalesQuotationPage() {
  const [tab, setTab] = useState('all');
  const [activeId, setActiveId] = useState(null);

  const goToList = () => {
    setActiveId(null);
    setTab('all');
  };
  const openCreate = () => {
    setActiveId(null);
    setTab('create');
  };
  const openEdit = (id) => {
    setActiveId(id);
    setTab('edit');
  };
  const openView = (id) => {
    setActiveId(id);
    setTab('view');
  };

  if (tab === 'create' || tab === 'edit') {
    return (
      <CreateSalesQuotationPage
        id={tab === 'edit' ? activeId : undefined}
        onBack={(savedId) => (tab === 'edit' ? openView(savedId || activeId) : goToList())}
      />
    );
  }

  if (tab === 'view') {
    return <QuotationViewPage id={activeId} onBack={goToList} onEdit={() => openEdit(activeId)} />;
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
