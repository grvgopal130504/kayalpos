import { useState } from 'react';

import StockTransferOverviewPage from './StockTransferOverviewPage';
import StockTransferStatusPage from './StockTransferStatusPage';
import CreateStockTransferPage from './CreateStockTransferPage';
import TransferViewPage from './TransferViewPage';

/**
 * Landing page for the sidebar's Stock Transfer item — a single page that
 * hosts the list (All/Draft/In Transit/Received/Cancelled), the create/edit
 * form, and the read-only view, all swapped in place via local state
 * instead of separate /create, /edit/:id, /view/:id routes. Clicking "New
 * Stock Transfer", a row's "View", or a row's "Edit" just swaps which body
 * renders here — the browser stays on /stock-transfer throughout. Mirrors
 * StockIndentPage/BarcodeLabelPage.
 */
export default function StockTransferPage() {
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
      <CreateStockTransferPage
        id={tab === 'edit' ? activeId : undefined}
        onBack={(savedId) => (tab === 'edit' ? openView(savedId || activeId) : goToList())}
      />
    );
  }

  if (tab === 'view') {
    return <TransferViewPage id={activeId} onBack={goToList} onEdit={() => openEdit(activeId)} />;
  }

  if (tab === 'all') {
    return (
      <StockTransferOverviewPage
        tab={tab}
        onTabChange={setTab}
        onCreate={openCreate}
        onView={openView}
        onEdit={openEdit}
      />
    );
  }

  return (
    <StockTransferStatusPage
      status={tab}
      tab={tab}
      onTabChange={setTab}
      onCreate={openCreate}
      onView={openView}
      onEdit={openEdit}
    />
  );
}
