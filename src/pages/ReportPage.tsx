import { useParams } from 'react-router';
import { StatusMessage } from '../components/common/StatusMessage';
import { normalizeReportIndex } from '../data';
import { zhTW } from '../i18n/zh-TW';
import { orDash } from '../lib/format';
import { useBreadcrumb, useIndexState } from './pageChrome';

/** 報告頁：階段 2 實作，目前只顯示說明 */
export function ReportPage() {
  const { reportId } = useParams();
  const indexState = useIndexState();
  const row =
    indexState.status === 'ok'
      ? normalizeReportIndex(indexState.index).rows.find((r) => r.reportId === reportId)
      : undefined;

  useBreadcrumb([{ label: zhTW.nav.overview, to: '/' }, { label: orDash(row?.name) }]);
  return <StatusMessage tone="info" message={zhTW.placeholder.comingSoon} />;
}
