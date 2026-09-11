import { useState } from 'react';
import SalesOrderOverviewPage from './SalesOrderOverviewPage';
import SalesOrderStatusPage from './SalesOrderStatusPage';
import CreateSalesOrderPage from './CreateSalesOrderPage';
import OrderViewPage from './OrderViewPage';

/**
 * Zero-chrome state container for the Sales Order module — tracks which
 * sub-page is active (list / create / edit / view) and renders that
 * sub-page's full self-contained component, so everything stays on the one
 * /sales-order page without separate /create, /edit/:code, /view/:code
 * routes. Mirrors SalesQuotationPage.
 */
export default function SalesOrderPage() {
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
      <CreateSalesOrderPage
        code={tab === 'edit' ? activeCode : undefined}
        onBack={tab === 'edit' ? () => openView(activeCode) : goToList}
      />
    );
  }

  if (tab === 'view') {
    return <OrderViewPage code={activeCode} onBack={goToList} onEdit={() => openEdit(activeCode)} />;
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
