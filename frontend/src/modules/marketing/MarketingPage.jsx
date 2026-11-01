import GroupLandingPage from '../../components/common/GroupLandingPage';
import { MARKETING_ITEMS } from '../../components/layout/navConfig';

export default function MarketingPage() {
  return <GroupLandingPage titleKey="nav.marketing" items={MARKETING_ITEMS} descPrefix="marketing" />;
}
