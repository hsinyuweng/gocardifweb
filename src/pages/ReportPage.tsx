import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { StatusMessage } from '../components/common/StatusMessage';
import { ReportNav } from '../components/report/ReportNav';
import { ReportView } from '../components/report/ReportView';
import { WatchlistButton } from '../components/report/WatchlistButton';
import { useConfig } from '../config/ConfigContext';
import { getDataSource, normalizeReport, normalizeReportIndex } from '../data';
import type { ReportViewModel } from '../types/viewModel';
import { zhTW } from '../i18n/zh-TW';
import { orDash } from '../lib/format';
import { readOwnerPreference, subscribeOwnerPreference } from '../lib/ownerPreference';
import { markReviewed } from '../lib/reviewed';
import { readOrder, setLastReport } from '../lib/listReturn';
import { sortRows } from '../lib/overviewFilter';
import { addToWatchlist, readWatchlist, removeFromWatchlist, subscribeWatchlist } from '../lib/watchlist';
import {
  OWNER_PARAM,
  ownerParamValue,
  readFromPath,
  readFromState,
  requestedOwner as resolveOwner,
} from '../lib/ownerParam';
import { errorText, useBreadcrumb, useIndexState, usePageActionSlot, usePageNotices } from './pageChrome';

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
  const watchlist = useSyncExternalStore(subscribeWatchlist, readWatchlist);
  const actionSlot = usePageActionSlot();
  const navigate = useNavigate();

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

  // 成功顯示即記為已審閱；日期用報告清單的產出日期，與競品研究的未審閱判斷一致
  const indexState = useIndexState();
  useEffect(() => {
    if (!vm || indexState.status === 'loading') return;
    const row =
      indexState.status === 'ok'
        ? normalizeReportIndex(indexState.index).rows.find((r) => r.reportId === reportId)
        : undefined;
    markReviewed(reportId, row ? row.generatedDate : vm.summary.generatedDate);
    setLastReport(reportId);
  }, [vm, indexState, reportId]);

  // 上一份／下一份（2026-10-27 V3）：照清單帶來的順序；沒有時用競品研究預設排序（產出日期新到舊）
  const order = useMemo(() => {
    const fromList = readOrder(location.state);
    if (fromList) return fromList;
    if (indexState.status !== 'ok') return [];
    return sortRows(normalizeReportIndex(indexState.index).rows, 'generatedDate', 'desc').flatMap((r) => (r.reportId ? [r.reportId] : []));
  }, [location.state, indexState]);
  const at = order.indexOf(reportId);
  // 切換報告用 replace：瀏覽器上一頁與「← 回…」都直接回清單
  const goTo = (id: string) =>
    navigate(`/report/${encodeURIComponent(id)}${location.search}`, { replace: true, state: location.state });

  // 從我的待辦、市場總覽進來時麵包屑回到該頁；從追蹤清單、競品研究進來時連來源頁的狀態一起帶回
  const from = readFromPath(location.state);
  const parent = from?.startsWith('/tasks')
    ? { label: zhTW.nav.tasks, to: from }
    : from === '/'
      ? { label: zhTW.nav.home, to: '/' }
      : from?.startsWith('/watchlist')
        ? { label: zhTW.nav.watchlist, to: from, state: readFromState(location.state) }
        : from?.startsWith('/news')
          ? { label: zhTW.nav.news, to: from, state: readFromState(location.state) }
          : { label: zhTW.nav.overview, to: from ?? '/research', state: readFromState(location.state) };
  useBreadcrumb([parent, { label: vm ? orDash(vm.summary.name) : reportId }]);

  // 「← 回…」：站內點進來的用瀏覽器上一頁（回到清單原本的篩選與捲動位置）；直接打開網址的連到來源頁
  const historyIdx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
  const goBack = () => {
    if (from !== null && historyIdx > 0) void navigate(-1);
    else void navigate(parent.to, { state: 'state' in parent ? parent.state : undefined });
  };
  const nav = (
    <ReportNav
      backLabel={parent.label}
      onBack={goBack}
      position={at >= 0 ? { index: at + 1, total: order.length } : null}
      onPrev={at > 0 ? () => goTo(order[at - 1]!) : null}
      onNext={at >= 0 && at < order.length - 1 ? () => goTo(order[at + 1]!) : null}
    />
  );
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

  if (state.status === 'loading')
    return (
      <div className="space-y-4">
        {nav}
        <StatusMessage tone="info" message={zhTW.common.loading} />
      </div>
    );
  if (state.status === 'error') {
    const { message, detail } = errorText(state.error, zhTW.errors.notFoundReport);
    return (
      <div className="space-y-4">
        {nav}
        <StatusMessage tone="error" message={message} detail={detail} />
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {nav}
      {actionSlot
        ? createPortal(
            <WatchlistButton
              added={watchlist.includes(reportId)}
              onAdd={() => addToWatchlist(reportId)}
              onRemove={() => removeFromWatchlist(reportId)}
              listLinkState={{
                from: location.pathname + location.search,
                fromState: location.state,
                fromLabel: orDash(state.vm.summary.name),
              }}
            />,
            actionSlot,
          )
        : null}
      <ReportView vm={state.vm} owner={owner} onOwnerChange={setOwnerParam} />
    </div>
  );
}
