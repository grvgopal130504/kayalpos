import { useState } from 'react';

import SalesOrderOverviewPage from './SalesOrderOverviewPage';
import SalesOrderStatusPage from './SalesOrderStatusPage';
import CreateSalesOrderPage from './CreateSalesOrderPage';
import OrderViewPage from './OrderViewPage';

/**
 * Landing page for the sidebar's Sales Order item — a single page that hosts
 * the list (All/Pending/Confirmed/Delivered), the create/edit form, and the
 * read-only view, all swapped in place via local state instead of separate
 * /create, /edit/:id, /view/:id routes. Clicking "New Sales Order", a row's
 * "View", or a row's "Edit" just swaps which body renders here — the browser
 * stays on /sales-order throughout. Mirrors SalesQuotationPage.
 */
export default function SalesOrderPage() {
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
      <CreateSalesOrderPage
        id={tab === 'edit' ? activeId : undefined}
        onBack={(savedId) => (tab === 'edit' ? openView(savedId || activeId) : goToList())}
      />
    );
  }

  if (tab === 'view') {
    return <OrderViewPage id={activeId} onBack={goToList} onEdit={() => openEdit(activeId)} />;
  }

  if (tab === 'all') {
    return (
      <SalesOrderOverviewPage
        tab={tab}
        onTabChange={setTab}
        onCreate={openCreate}
        onView={openView}
        onEdit={openEdit}
      />
    );
  }

  return (
    <SalesOrderStatusPage
      status={tab}
      tab={tab}
      onTabChange={setTab}
      onCreate={openCreate}
      onView={openView}
      onEdit={openEdit}
    />
  );
}
