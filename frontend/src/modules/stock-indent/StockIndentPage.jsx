import { useState } from 'react';
import StockIndentOverviewPage from './StockIndentOverviewPage';
import StockIndentStatusPage from './StockIndentStatusPage';
import CreateStockIndentPage from './CreateStockIndentPage';
import IndentViewPage from './IndentViewPage';

/**
 * Zero-chrome state container for the Stock Indent module — tracks which
 * sub-page is active (list / create / edit / view) and renders that
 * sub-page's full self-contained component, so everything stays on the one
 * /stock-indent page without separate /create, /edit/:code, /view/:code
 * routes. Mirrors SalesInvoicePage/BarcodeLabelPage.
 */
export default function StockIndentPage() {
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
      <CreateStockIndentPage
        code={tab === 'edit' ? activeCode : undefined}
        onBack={tab === 'edit' ? () => openView(activeCode) : goToList}
      />
    );
  }

  if (tab === 'view') {
    return <IndentViewPage code={activeCode} onBack={goToList} onEdit={() => openEdit(activeCode)} />;
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
