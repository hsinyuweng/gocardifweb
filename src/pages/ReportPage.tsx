import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { StatusMessage } from '../components/common/StatusMessage';
import { ReportView } from '../components/report/ReportView';
import { useConfig } from '../config/ConfigContext';
import { getDataSource, normalizeReport } from '../data';
import type { ReportViewModel } from '../types/viewModel';
import { zhTW } from '../i18n/zh-TW';
import { orDash } from '../lib/format';
import { readOwnerPreference, writeOwnerPreference } from '../lib/ownerPreference';
import { errorText, useBreadcrumb, usePageNotices } from './pageChrome';

type ReportState =
  | { status: 'loading' }
  | { status: 'ok'; vm: ReportViewModel }
  | { status: 'error'; error: unknown };

const OWNER_PARAM = 'owner';

/** 報告頁（第 11.3 節）：只負責取資料與載入／錯誤狀態，成功後渲染 ReportView */
export function ReportPage() {
  const { reportId = '' } = useParams();
  const config = useConfig();
  const [state, setState] = useState<ReportState>({ status: 'loading' });
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    let alive = true;
    setState({ status: 'loading' });
    getDataSource(config)
      .getReport(reportId)
      .then((report) => alive && setState({ status: 'ok', vm: normalizeReport(report) }))
      .catch((error: unknown) => alive && setState({ status: 'error', error }));
    return () => {
      alive = false;
    };
  }, [config, reportId]);

  const vm = state.status === 'ok' ? state.vm : null;

  useBreadcrumb([{ label: zhTW.nav.overview, to: '/' }, { label: vm ? orDash(vm.summary.name) : reportId }]);
  usePageNotices(vm?.schemaVersionMismatch ? [{ tone: 'warning', text: zhTW.schemaMismatch }] : []);

  // 負責單位（D7）：網址優先 → localStorage → 全部；不在本報告選項內時視為「全部」
  const urlOwner = searchParams.get(OWNER_PARAM);
  const requestedOwner = urlOwner ?? readOwnerPreference();
  const owner = useMemo(
    () => (vm && requestedOwner !== null && vm.ownerOptions.includes(requestedOwner) ? requestedOwner : null),
    [vm, requestedOwner],
  );

  const setOwnerParam = useCallback(
    (next: string | null) => {
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          if (next === null) p.delete(OWNER_PARAM);
          else p.set(OWNER_PARAM, next);
          return p;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // 由 localStorage 取得的值同步寫入網址，方便分享
  useEffect(() => {
    if (urlOwner === null && owner !== null) setOwnerParam(owner);
  }, [urlOwner, owner, setOwnerParam]);

  const handleOwnerChange = (next: string | null) => {
    setOwnerParam(next);
    writeOwnerPreference(next);
  };

  if (state.status === 'loading') return <StatusMessage tone="info" message={zhTW.common.loading} />;
  if (state.status === 'error') {
    const { message, detail } = errorText(state.error, zhTW.errors.notFoundReport);
    return <StatusMessage tone="error" message={message} detail={detail} />;
  }
  return <ReportView vm={state.vm} owner={owner} onOwnerChange={handleOwnerChange} />;
}
