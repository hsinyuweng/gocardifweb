import { useMemo, useState, useSyncExternalStore } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';
import type { BreadcrumbItem } from '../components/layout/TopBar';
import { StatusMessage } from '../components/common/StatusMessage';
import { CompareTable } from '../components/watchlist/CompareTable';
import { PresetPicker } from '../components/watchlist/PresetPicker';
import { normalizeReportIndex } from '../data';
import { zhTW } from '../i18n/zh-TW';
import { readFromPath, readFromState } from '../lib/ownerParam';
import { anyBrandFitScore, buildCandidates, dataCoverage, DIMENSIONS, sortCandidates, type CompareSortKey } from '../lib/score';
import { addToWatchlist, readWatchlist, removeFromWatchlist, subscribeWatchlist } from '../lib/watchlist';
import { PRESET_WEIGHTS, readPreset, setPreset, subscribePreset } from '../lib/weights';
import { errorText, useBreadcrumb, useIndexState } from './pageChrome';
import { PageHeader } from '../components/layout/PageHeader';

const t = zhTW.watchlist;

/** 報告頁「看追蹤清單 →」帶來的商品名稱，用於麵包屑 */
function readFromLabel(state: unknown): string | null {
  const label = (state as { fromLabel?: unknown } | null)?.fromLabel;
  return typeof label === 'string' ? label : null;
}

const SORT_KEYS: readonly CompareSortKey[] = ['total', ...DIMENSIONS];

/** 追蹤清單（2026-10-20 新規劃；2026-10-27 V4 改為比較表）：候選商品各面向分數並排，點欄位排序，「看重」預設決定綜合分數 */
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
  const preset = useSyncExternalStore(subscribePreset, readPreset);
  const weights = PRESET_WEIGHTS[preset];
  // 排序寫進網址（replace），預設依綜合由高到低
  const [searchParams, setSearchParams] = useSearchParams();
  const sortParam = searchParams.get('sort');
  const sortKey: CompareSortKey = SORT_KEYS.includes(sortParam as CompareSortKey) ? (sortParam as CompareSortKey) : 'total';
  const sortDir = searchParams.get('dir') === 'asc' ? 'asc' : 'desc';
  const onSort = (key: CompareSortKey) => {
    const dir = key === sortKey ? (sortDir === 'desc' ? 'asc' : 'desc') : 'desc';
    const p = new URLSearchParams();
    if (key !== 'total') p.set('sort', key);
    if (dir !== 'desc') p.set('dir', dir);
    setSearchParams(p, { replace: true, state: location.state });
  };
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  // 剛移出的商品：可復原，下一個動作後消失
  const [removed, setRemoved] = useState<{ id: string; index: number; name: string } | null>(null);

  const rows = useMemo(
    () => (indexState.status === 'ok' ? normalizeReportIndex(indexState.index).rows : []),
    [indexState],
  );
  const { ranked, missing } = useMemo(() => buildCandidates(ids, rows, weights), [ids, rows, weights]);
  const hasBrandFit = anyBrandFitScore(ranked.map((c) => c.row));
  // 所有候選都沒有品牌分數時不顯示品牌欄
  const dims = hasBrandFit ? DIMENSIONS : DIMENSIONS.filter((k) => k !== 'brandFit');
  const sorted = useMemo(() => sortCandidates(ranked, sortKey, sortDir), [ranked, sortKey, sortDir]);
  const rankOf = (id: string) => ranked.findIndex((c) => c.row.reportId === id) + 1;
  // 一行說明：哪些面向還沒有資料
  const coverage = dataCoverage(ranked, dims);
  const dimNames = (keys: readonly typeof DIMENSIONS[number][]) => keys.map((k) => t.dimensions[k]).join('、');
  const coverageText =
    ranked.length === 0 || coverage.missing.length === 0
      ? null
      : coverage.withData.length === 1
        ? t.coverageOnly(dimNames(coverage.missing), dimNames(coverage.withData), coverage.signalOnly)
        : t.coveragePartial(dimNames(coverage.missing));

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
  // order：報告頁「上一份／下一份」照比較表目前的順序
  const linkState = {
    from: location.pathname + location.search,
    fromState: location.state,
    order: sorted.map((c) => c.row.reportId as string),
  };

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
      <div className="space-y-3">
        <CompareTable
          rows={sorted}
          rankOf={rankOf}
          dims={dims}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={onSort}
          expanded={expanded}
          onToggle={toggle}
          onRemove={remove}
          linkState={linkState}
        />
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
        aside={indexState.status === 'ok' ? t.metaBackend(ids.length) : null}
      />
      {ids.length > 0 ? (
        <div className="space-y-1.5">
          <PresetPicker
            value={preset}
            onChange={(p) => {
              setRemoved(null);
              setPreset(p);
            }}
          />
          {coverageText ? <p className="text-[13px] text-ink2">{coverageText}</p> : null}
        </div>
      ) : null}
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
