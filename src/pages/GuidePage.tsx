import { StatusMessage } from '../components/common/StatusMessage';
import { zhTW } from '../i18n/zh-TW';
import { useBreadcrumb } from './pageChrome';

/** 使用說明：階段 4 實作，目前只顯示說明 */
export function GuidePage() {
  useBreadcrumb([{ label: zhTW.nav.guide }]);
  return <StatusMessage tone="info" message={zhTW.placeholder.comingSoon} />;
}
