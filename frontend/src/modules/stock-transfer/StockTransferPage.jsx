import { useState } from 'react';
import StockTransferOverviewPage from './StockTransferOverviewPage';
import StockTransferStatusPage from './StockTransferStatusPage';
import CreateStockTransferPage from './CreateStockTransferPage';
import TransferViewPage from './TransferViewPage';

/**
 * Zero-chrome state container for the Stock Transfer module — tracks which
 * sub-page is active (list / create / edit / view) and renders that
 * sub-page's full self-contained component, so everything stays on the one
 * /stock-transfer page without separate /create, /edit/:code, /view/:code
 * routes. Mirrors StockIndentPage.
 */
export default function StockTransferPage() {
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
      <CreateStockTransferPage
        code={tab === 'edit' ? activeCode : undefined}
        onBack={tab === 'edit' ? () => openView(activeCode) : goToList}
      />
    );
  }

  if (tab === 'view') {
    return <TransferViewPage code={activeCode} onBack={goToList} onEdit={() => openEdit(activeCode)} />;
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
