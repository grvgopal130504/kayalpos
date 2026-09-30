import { useState } from 'react';

import SalesInvoiceOverviewPage from './SalesInvoiceOverviewPage';
import SalesInvoiceStatusPage from './SalesInvoiceStatusPage';
import CreateSalesInvoicePage from './CreateSalesInvoicePage';
import InvoiceViewPage from './InvoiceViewPage';

/**
 * Landing page for the sidebar's Sales Invoice item — a single page that
 * hosts the list (All/Draft/Sent/Paid/Overdue), the create/edit form, and
 * the read-only view, all swapped in place via local state instead of
 * separate /create, /edit/:id, /view/:id routes. Clicking "New Sales
 * Invoice", a row's "View", or a row's "Edit" just swaps which body renders
 * here — the browser stays on /sales-invoice throughout. Mirrors
 * SalesOrderPage/SalesQuotationPage.
 */
export default function SalesInvoicePage() {
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
      <CreateSalesInvoicePage
        id={tab === 'edit' ? activeId : undefined}
        onBack={(savedId) => (tab === 'edit' ? openView(savedId || activeId) : goToList())}
      />
    );
  }

  if (tab === 'view') {
    return <InvoiceViewPage id={activeId} onBack={goToList} onEdit={() => openEdit(activeId)} />;
  }

  if (tab === 'all') {
    return (
      <SalesInvoiceOverviewPage
        tab={tab}
        onTabChange={setTab}
        onCreate={openCreate}
        onView={openView}
        onEdit={openEdit}
      />
    );
  }

  return (
    <SalesInvoiceStatusPage
      status={tab}
      tab={tab}
      onTabChange={setTab}
      onCreate={openCreate}
      onView={openView}
      onEdit={openEdit}
    />
  );
}
