import { useState } from 'react';
import BarcodeLabelOverviewPage from './BarcodeLabelOverviewPage';
import BarcodeLabelStatusPage from './BarcodeLabelStatusPage';
import CreateBarcodeLabelPage from './CreateBarcodeLabelPage';
import BarcodeLabelViewPage from './BarcodeLabelViewPage';

/**
 * Zero-chrome state container for the Barcode & Label module — tracks
 * which sub-page is active (list / create / edit / view) and renders that
 * sub-page's full self-contained component, so everything stays on the one
 * /barcode-label page without separate /create, /edit/:code, /view/:code
 * routes. Mirrors SalesInvoicePage/SalesOrderPage/SalesQuotationPage.
 */
export default function BarcodeLabelPage() {
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
      <CreateBarcodeLabelPage
        code={tab === 'edit' ? activeCode : undefined}
        onBack={tab === 'edit' ? () => openView(activeCode) : goToList}
      />
    );
  }

  if (tab === 'view') {
    return <BarcodeLabelViewPage code={activeCode} onBack={goToList} onEdit={() => openEdit(activeCode)} />;
  }

  if (tab === 'all') {
    return (
      <BarcodeLabelOverviewPage
        tab={tab}
        onTabChange={setTab}
        onCreate={openCreate}
        onView={openView}
        onEdit={openEdit}
      />
    );
  }

  return (
    <BarcodeLabelStatusPage
      status={tab}
      tab={tab}
      onTabChange={setTab}
      onCreate={openCreate}
      onView={openView}
      onEdit={openEdit}
    />
  );
}
