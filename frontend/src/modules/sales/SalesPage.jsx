import GroupLandingPage from '../../components/common/GroupLandingPage';
import { SALES_ITEMS } from '../../components/layout/navConfig';

export default function SalesPage() {
  return <GroupLandingPage titleKey="nav.sales" items={SALES_ITEMS} descPrefix="sales" />;
}
