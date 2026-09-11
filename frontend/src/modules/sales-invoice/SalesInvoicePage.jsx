import { useState } from 'react';
import SalesInvoiceOverviewPage from './SalesInvoiceOverviewPage';
import SalesInvoiceStatusPage from './SalesInvoiceStatusPage';
import CreateSalesInvoicePage from './CreateSalesInvoicePage';
import InvoiceViewPage from './InvoiceViewPage';

/**
 * Zero-chrome state container for the Sales Invoice module — tracks which
 * sub-page is active (list / create / edit / view) and renders that
 * sub-page's full self-contained component, so everything stays on the one
 * /sales-invoice page without separate /create, /edit/:code, /view/:code
 * routes. Mirrors SalesOrderPage/SalesQuotationPage.
 */
export default function SalesInvoicePage() {
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
      <CreateSalesInvoicePage
        code={tab === 'edit' ? activeCode : undefined}
        onBack={tab === 'edit' ? () => openView(activeCode) : goToList}
      />
    );
  }

  if (tab === 'view') {
    return <InvoiceViewPage code={activeCode} onBack={goToList} onEdit={() => openEdit(activeCode)} />;
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
