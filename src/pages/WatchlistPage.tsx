import { useMemo, useState, useSyncExternalStore } from 'react';
import { Link, useLocation } from 'react-router';
import type { BreadcrumbItem } from '../components/layout/TopBar';
import { StatusMessage } from '../components/common/StatusMessage';
import { CandidateItem } from '../components/watchlist/CandidateItem';
import { WeightPanel } from '../components/watchlist/WeightPanel';
import { normalizeReportIndex } from '../data';
import { zhTW } from '../i18n/zh-TW';
import { readFromPath, readFromState } from '../lib/ownerParam';
import { anyBrandFitScore, buildCandidates } from '../lib/score';
import { addToWatchlist, readWatchlist, removeFromWatchlist, subscribeWatchlist } from '../lib/watchlist';
import { readWeights, resetWeights, setWeight, subscribeWeights } from '../lib/weights';
import { errorText, useBreadcrumb, useIndexState } from './pageChrome';
import { PageHeader } from '../components/layout/PageHeader';

const t = zhTW.watchlist;

/** 報告頁「看追蹤清單 →」帶來的商品名稱，用於麵包屑 */
function readFromLabel(state: unknown): string | null {
  const label = (state as { fromLabel?: unknown } | null)?.fromLabel;
  return typeof label === 'string' ? label : null;
}

/** 追蹤清單（2026-10-20 新規劃）：候選商品依綜合分數排序，權重滑桿即時重算 */
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
  const weights = useSyncExternalStore(subscribeWeights, readWeights);
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  // 剛移出的商品：可復原，下一個動作後消失
  const [removed, setRemoved] = useState<{ id: string; index: number; name: string } | null>(null);

  const rows = useMemo(
    () => (indexState.status === 'ok' ? normalizeReportIndex(indexState.index).rows : []),
    [indexState],
  );
  const { ranked, missing } = useMemo(() => buildCandidates(ids, rows, weights), [ids, rows, weights]);
  const hasBrandFit = anyBrandFitScore(ranked.map((c) => c.row));
  // 標題旁說明：全部用後端分數／部分燈號換算／全部燈號換算
  const signalCount = ranked.filter((c) => c.score.usesSignal).length;
  const metaText =
    ranked.length > 0 && signalCount === 0
      ? t.metaBackend(ids.length)
      : signalCount > 0 && signalCount < ranked.length
        ? t.metaPartial(ids.length)
        : t.meta(ids.length);

  const remove = (id: string, name: string) => {
    setRemoved({ id, index: ids.indexOf(id), name });
    removeFromWatchlist(id);
  };
  const toggle = (id: string) => {
    setRemoved(null);
    setExpanded((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  };
  const linkState = { from: location.pathname + location.search, fromState: location.state };

  let body;
  if (indexState.status === 'loading') {
    body = <StatusMessage tone="info" message={zhTW.common.loading} />;
  } else if (indexState.status === 'error') {
    const { message, detail } = errorText(indexState.error, zhTW.errors.notFoundIndex);
    body = <StatusMessage tone="error" message={message} detail={detail} />;
  } else if (ids.length === 0) {
    body = (
      <div className="space-y-2 rounded border border-slate-200 bg-white px-4 py-4">
        <p className="text-slate-600">{t.empty}</p>
        <Link to="/research" className="text-sm text-navy-700 hover:underline">
          {t.goResearch}
        </Link>
      </div>
    );
  } else {
    body = (
      <ol className="divide-y divide-slate-100 rounded border border-slate-200 bg-white">
        {ranked.map((c, i) => {
          const id = c.row.reportId as string;
          return (
            <CandidateItem
              key={id}
              rank={i + 1}
              candidate={c}
              expanded={expanded.has(id)}
              onToggle={() => toggle(id)}
              onRemove={() => remove(id, c.row.name ?? id)}
              linkState={linkState}
            />
          );
        })}
        {missing.map((id) => (
          <li key={id} className="flex items-center justify-between gap-4 px-4 py-3 text-slate-500">
            <span className="min-w-0 break-all">{t.missing(id)}</span>
            <button type="button" onClick={() => remove(id, id)} className="shrink-0 text-sm text-navy-700 hover:underline">
              {t.remove}
            </button>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon="watchlist"
        title={t.title}
        desc={zhTW.pageDesc.watchlist}
        aside={indexState.status === 'ok' ? metaText : null}
      />
      <WeightPanel
        weights={weights}
        hasBrandFit={hasBrandFit}
        onChange={(key, value) => {
          setRemoved(null);
          setWeight(key, value);
        }}
        onReset={() => {
          setRemoved(null);
          resetWeights();
        }}
      />
      {removed ? (
        <p className="rounded bg-slate-100 px-4 py-2 text-sm text-slate-700" role="status">
          {t.removed(removed.name)}
          <button
            type="button"
            onClick={() => {
              addToWatchlist(removed.id, removed.index);
              setRemoved(null);
            }}
            className="ml-2 text-navy-700 underline underline-offset-2 hover:text-navy-800"
          >
            {t.undo}
          </button>
        </p>
      ) : null}
      {body}
    </div>
  );
}
