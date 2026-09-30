import { useState } from 'react';

import StockIndentOverviewPage from './StockIndentOverviewPage';
import StockIndentStatusPage from './StockIndentStatusPage';
import CreateStockIndentPage from './CreateStockIndentPage';
import IndentViewPage from './IndentViewPage';

/**
 * Landing page for the sidebar's Stock Indent item — a single page that
 * hosts the list (All/Draft/Pending Approval/Approved/Rejected), the
 * create/edit form, and the read-only view, all swapped in place via local
 * state instead of separate /create, /edit/:id, /view/:id routes. Clicking
 * "New Stock Indent", a row's "View", or a row's "Edit" just swaps which
 * body renders here — the browser stays on /stock-indent throughout.
 * Mirrors BarcodeLabelPage/SalesOrderPage.
 */
export default function StockIndentPage() {
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
      <CreateStockIndentPage
        id={tab === 'edit' ? activeId : undefined}
        onBack={(savedId) => (tab === 'edit' ? openView(savedId || activeId) : goToList())}
      />
    );
  }

  if (tab === 'view') {
    return <IndentViewPage id={activeId} onBack={goToList} onEdit={() => openEdit(activeId)} />;
  }

  if (tab === 'all') {
    return (
      <StockIndentOverviewPage
        tab={tab}
        onTabChange={setTab}
        onCreate={openCreate}
        onView={openView}
        onEdit={openEdit}
      />
    );
  }

  return (
    <StockIndentStatusPage
      status={tab}
      tab={tab}
      onTabChange={setTab}
      onCreate={openCreate}
      onView={openView}
      onEdit={openEdit}
    />
  );
}
