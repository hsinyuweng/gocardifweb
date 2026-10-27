import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { RecommendationBar } from '../components/overview/RecommendationBar';
import { OverviewToolbar } from '../components/overview/OverviewToolbar';
import { ReportTable } from '../components/overview/ReportTable';
import { StatusMessage } from '../components/common/StatusMessage';
import { normalizeReportIndex } from '../data';
import { zhTW } from '../i18n/zh-TW';
import { orDash } from '../lib/format';
import { readFromPath } from '../lib/ownerParam';
import { readLastReport, saveListScroll, takeListScroll } from '../lib/listReturn';
import { isUnreviewed, readReviewed, subscribeReviewed } from '../lib/reviewed';
import {
  DEFAULT_SORT_DIR,
  filterRows,
  readOverviewParams,
  sortRows,
  writeOverviewParams,
  type OverviewFilters,
  type OverviewUrlState,
  type SortKey,
} from '../lib/overviewFilter';
import { errorText, useBreadcrumb, useIndexState } from './pageChrome';
import { PageHeader } from '../components/layout/PageHeader';

const t = zhTW.overview;

/** 競品研究：全部報告表格（第 11.2 節，原案件總覽） */
export function OverviewPage() {
  const navigate = useNavigate();
  const indexState = useIndexState();

  const location = useLocation();
  // 從市場總覽進來時，麵包屑可以點回首頁
  const fromHome = readFromPath(location.state) === '/';
  useBreadcrumb(
    fromHome ? [{ label: zhTW.nav.home, to: '/' }, { label: zhTW.nav.overview }] : [{ label: zhTW.nav.overview }],
  );
  // 篩選與排序存在網址：進報告頁再返回時恢復（替換目前紀錄，不新增瀏覽紀錄）
  const [searchParams, setSearchParams] = useSearchParams();
  const urlState = useMemo(() => readOverviewParams(searchParams), [searchParams]);
  const { filters, sortKey, sortDir } = urlState;
  // 保留來源頁資訊，篩選後麵包屑不會跑掉
  const update = (next: OverviewUrlState) =>
    setSearchParams(writeOverviewParams(next), { replace: true, state: location.state });

  const vm = useMemo(
    () => (indexState.status === 'ok' ? normalizeReportIndex(indexState.index) : null),
    [indexState],
  );
  const reviewed = useSyncExternalStore(subscribeReviewed, readReviewed);
  const unreadIds = useMemo(
    () => new Set((vm?.rows ?? []).filter((r) => isUnreviewed(r, reviewed)).map((r) => r.reportId as string)),
    [vm, reviewed],
  );
  const visibleRows = useMemo(
    () =>
      vm
        ? sortRows(
            filterRows(vm.rows, filters, (r) => r.reportId !== null && unreadIds.has(r.reportId)),
            sortKey,
            sortDir,
          )
        : [],
    [vm, filters, sortKey, sortDir, unreadIds],
  );

  // 從報告頁回來時（2026-10-27 V3）：回到離開時的捲動位置，最後看的報告那一列標亮 2 秒
  const listPath = location.pathname + location.search;
  const [highlight, setHighlight] = useState<string | null>(null);
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current || !vm) return;
    restored.current = true;
    const y = takeListScroll(listPath);
    if (y === null) return;
    requestAnimationFrame(() => window.scrollTo(0, y));
    setHighlight(readLastReport());
    const timer = window.setTimeout(() => setHighlight(null), 2000);
    return () => window.clearTimeout(timer);
  }, [vm, listPath]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) update({ ...urlState, sortDir: sortDir === 'asc' ? 'desc' : 'asc' });
    else update({ ...urlState, sortKey: key, sortDir: DEFAULT_SORT_DIR[key] });
  };
  const patch = (p: Partial<OverviewFilters>) => update({ ...urlState, filters: { ...filters, ...p } });

  let body;
  if (indexState.status === 'loading') {
    body = <StatusMessage tone="info" message={zhTW.common.loading} />;
  } else if (indexState.status === 'error') {
    const { message, detail } = errorText(indexState.error, zhTW.errors.notFoundIndex);
    body = <StatusMessage tone="error" message={message} detail={detail} />;
  } else if (vm && vm.rows.length === 0) {
    body = <StatusMessage tone="info" message={t.empty} />;
  } else if (vm) {
    body = (
      <div className="space-y-4">
        <RecommendationBar
          groups={vm.recommendationGroups}
          selected={filters.recommendation}
          onSelect={(recommendation) => patch({ recommendation })}
          unreadCount={unreadIds.size}
          unreadOn={filters.unread}
          onToggleUnread={() => patch({ unread: !filters.unread })}
        />
        <OverviewToolbar
          search={filters.search}
          country={filters.country}
          category={filters.category}
          countryOptions={vm.countryOptions}
          categoryOptions={vm.categoryOptions}
          onSearchChange={(search) => patch({ search })}
          onCountryChange={(country) => patch({ country })}
          onCategoryChange={(category) => patch({ category })}
        />
        {visibleRows.length === 0 ? (
          <StatusMessage tone="info" message={t.noMatch} />
        ) : (
          <ReportTable
            rows={visibleRows}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
            unreadIds={unreadIds}
            highlightId={highlight}
            onOpen={(id) => {
              saveListScroll(listPath, window.scrollY);
              // order：報告頁「上一份／下一份」照目前的篩選與排序
              void navigate(`/report/${encodeURIComponent(id)}`, {
                state: {
                  from: listPath,
                  fromState: location.state,
                  order: visibleRows.flatMap((r) => (r.reportId ? [r.reportId] : [])),
                },
              });
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon="research"
        title={t.title}
        desc={zhTW.pageDesc.research}
        aside={vm ? `${t.total(vm.rows.length)} · ${t.updatedAt(orDash(vm.generatedAt))}` : null}
      />
      {body}
    </div>
  );
}
