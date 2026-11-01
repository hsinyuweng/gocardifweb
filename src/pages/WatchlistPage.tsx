import { useMemo, useState, useSyncExternalStore } from 'react';
import { Link, useLocation } from 'react-router';
import type { BreadcrumbItem } from '../components/layout/TopBar';
import { StatusMessage } from '../components/common/StatusMessage';
import { CompareTable } from '../components/watchlist/CompareTable';
import { normalizeReportIndex } from '../data';
import { zhTW } from '../i18n/zh-TW';
import { readFromPath, readFromState } from '../lib/ownerParam';
import { rankRows } from '../lib/researchStory';
import { addToWatchlist, readWatchlist, removeFromWatchlist, subscribeWatchlist } from '../lib/watchlist';
import { errorText, useBreadcrumb, useIndexState } from './pageChrome';
import { PageHeader } from '../components/layout/PageHeader';

const t = zhTW.watchlist;

/** 報告頁「看追蹤清單 →」帶來的商品名稱，用於麵包屑 */
function readFromLabel(state: unknown): string | null {
  const label = (state as { fromLabel?: unknown } | null)?.fromLabel;
  return typeof label === 'string' ? label : null;
}

/** 追蹤清單（2026-10-20 新規劃；2026-11-01 使用者回饋：拿掉綜合分數與看重切換，固定依建議 → 阻斷少 → 潛在市場大排序） */
export function WatchlistPage() {
  const location = useLocation();
  const from = readFromPath(location.state);
  const self: BreadcrumbItem = { label: zhTW.nav.watchlist };
  let crumbs: BreadcrumbItem[] = [self];
  if (from === '/') crumbs = [{ label: zhTW.nav.home, to: '/' }, self];
  else if (from?.startsWith('/report/'))
    crumbs = [{ label: readFromLabel(location.state) ?? from, to: from, state: readFromState(location.state) }, self];
  useBreadcrumb(crumbs);

  const indexState = useIndexState();
  const ids = useSyncExternalStore(subscribeWatchlist, readWatchlist);
  // 剛移出的商品：可復原，下一個動作後消失
  const [removed, setRemoved] = useState<{ id: string; index: number; name: string } | null>(null);

  const rows = useMemo(
    () => (indexState.status === 'ok' ? normalizeReportIndex(indexState.index).rows : []),
    [indexState],
  );
  const watched = useMemo(() => rankRows(rows.filter((r) => r.reportId !== null && ids.includes(r.reportId))), [rows, ids]);
  // 清單裡有、報告清單找不到的 report_id
  const missing = useMemo(
    () => (indexState.status === 'ok' ? ids.filter((id) => !rows.some((r) => r.reportId === id)) : []),
    [ids, rows, indexState],
  );

  const remove = (id: string, name: string) => {
    setRemoved({ id, index: ids.indexOf(id), name });
    removeFromWatchlist(id);
  };
  // order：報告頁「上一份／下一份」照比較表的順序
  const linkState = {
    from: location.pathname + location.search,
    fromState: location.state,
    order: watched.map((r) => r.reportId as string),
  };

  let body;
  if (indexState.status === 'loading') {
    body = <StatusMessage tone="info" message={zhTW.common.loading} />;
  } else if (indexState.status === 'error') {
    const { message, detail } = errorText(indexState.error, zhTW.errors.notFoundIndex);
    body = <StatusMessage tone="error" message={message} detail={detail} />;
  } else if (ids.length === 0) {
    body = (
      <div className="space-y-2 rounded-xl border border-line bg-white px-5 py-4">
        <p className="text-ink2">{t.empty}</p>
        <Link to="/research" className="text-sm text-p-ink hover:underline">
          {t.goResearch}
        </Link>
      </div>
    );
  } else {
    body = (
      <div className="space-y-3">
        <CompareTable rows={watched} onRemove={remove} linkState={linkState} />
        {missing.map((id) => (
          <p key={id} className="flex items-center justify-between gap-4 rounded-xl border border-line bg-white px-4 py-3 text-muted">
            <span className="min-w-0 break-all">{t.missing(id)}</span>
            <button type="button" onClick={() => remove(id, id)} className="shrink-0 text-sm text-ink2 hover:underline">
              {t.remove}
            </button>
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon="watchlist"
        title={t.title}
        desc={zhTW.pageDesc.watchlist}
      />
      {removed ? (
        <p className="rounded-md bg-line px-4 py-2 text-sm text-ink" role="status">
          {t.removed(removed.name)}
          <button
            type="button"
            onClick={() => {
              addToWatchlist(removed.id, removed.index);
              setRemoved(null);
            }}
            className="ml-2 text-p-ink underline underline-offset-2 hover:text-p-ink"
          >
            {t.undo}
          </button>
        </p>
      ) : null}
      {body}
    </div>
  );
}
