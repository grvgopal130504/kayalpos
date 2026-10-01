import GroupLandingPage from '../../components/common/GroupLandingPage';
import { SYNC_ITEMS } from '../../components/layout/navConfig';

export default function SynchronizationPage() {
  return <GroupLandingPage titleKey="nav.synchronization" items={SYNC_ITEMS} descPrefix="synchronization" />;
}
