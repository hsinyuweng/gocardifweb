import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router';
import { StatusMessage } from '../components/common/StatusMessage';
import { ReportView } from '../components/report/ReportView';
import { useConfig } from '../config/ConfigContext';
import { getDataSource, normalizeReport } from '../data';
import type { ReportViewModel } from '../types/viewModel';
import { zhTW } from '../i18n/zh-TW';
import { orDash } from '../lib/format';
import { readOwnerPreference, subscribeOwnerPreference } from '../lib/ownerPreference';
import {
  OWNER_PARAM,
  ownerParamValue,
  readFromPath,
  readFromState,
  requestedOwner as resolveOwner,
} from '../lib/ownerParam';
import { errorText, useBreadcrumb, usePageNotices } from './pageChrome';

type ReportState =
  | { status: 'loading' }
  | { status: 'ok'; vm: ReportViewModel }
  | { status: 'error'; error: unknown };

/** 報告頁（第 11.3 節）：只負責取資料與載入／錯誤狀態，成功後渲染 ReportView */
export function ReportPage() {
  const { reportId = '' } = useParams();
  const config = useConfig();
  const [state, setState] = useState<ReportState>({ status: 'loading' });
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const myUnit = useSyncExternalStore(subscribeOwnerPreference, readOwnerPreference);

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

  // 從我的待辦進來時麵包屑回到我的待辦；從首頁進來時回到原本的篩選狀態
  const from = readFromPath(location.state);
  const parent = from?.startsWith('/tasks')
    ? { label: zhTW.nav.tasks, to: from }
    : { label: zhTW.nav.overview, to: from ?? '/cases', state: readFromState(location.state) };
  useBreadcrumb([parent, { label: vm ? orDash(vm.summary.name) : reportId }]);
  usePageNotices(vm?.schemaVersionMismatch ? [{ tone: 'warning', text: zhTW.schemaMismatch }] : []);

  // 負責單位（D7）：網址優先 → 我的單位 → 全部；不在本報告選項內時視為「全部」
  const urlOwner = searchParams.get(OWNER_PARAM);
  const requestedOwner = resolveOwner(urlOwner, myUnit);
  const owner = useMemo(
    () => (vm && requestedOwner !== null && vm.ownerOptions.includes(requestedOwner) ? requestedOwner : null),
    [vm, requestedOwner],
  );

  const setOwnerParam = useCallback(
    (next: string | null) => {
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          p.set(OWNER_PARAM, ownerParamValue(next));
          return p;
        },
        // 保留來源頁資訊，麵包屑才不會跑掉
        { replace: true, state: location.state },
      );
    },
    [setSearchParams, location.state],
  );

  // 由我的單位取得的值同步寫入網址，方便分享
  useEffect(() => {
    if (urlOwner === null && owner !== null) setOwnerParam(owner);
  }, [urlOwner, owner, setOwnerParam]);

  if (state.status === 'loading') return <StatusMessage tone="info" message={zhTW.common.loading} />;
  if (state.status === 'error') {
    const { message, detail } = errorText(state.error, zhTW.errors.notFoundReport);
    return <StatusMessage tone="error" message={message} detail={detail} />;
  }
  return <ReportView vm={state.vm} owner={owner} onOwnerChange={setOwnerParam} />;
}
