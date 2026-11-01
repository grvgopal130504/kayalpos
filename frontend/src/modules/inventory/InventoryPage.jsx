import GroupLandingPage from '../../components/common/GroupLandingPage';
import { INVENTORY_ITEMS } from '../../components/layout/navConfig';

export default function InventoryPage() {
  return <GroupLandingPage titleKey="nav.inventory" items={INVENTORY_ITEMS} descPrefix="inventory" />;
}
