import { useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { RecommendationBar } from '../components/overview/RecommendationBar';
import { OverviewToolbar } from '../components/overview/OverviewToolbar';
import { ReportTable } from '../components/overview/ReportTable';
import { StatusMessage } from '../components/common/StatusMessage';
import { normalizeReportIndex } from '../data';
import { zhTW } from '../i18n/zh-TW';
import { orDash } from '../lib/format';
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

const t = zhTW.overview;

/** 案件總覽（第 11.2 節） */
export function OverviewPage() {
  useBreadcrumb([{ label: zhTW.nav.overview }]);
  const navigate = useNavigate();
  const indexState = useIndexState();

  const location = useLocation();
  // 篩選與排序存在網址：進報告頁再返回時恢復（替換目前紀錄，不新增瀏覽紀錄）
  const [searchParams, setSearchParams] = useSearchParams();
  const urlState = useMemo(() => readOverviewParams(searchParams), [searchParams]);
  const { filters, sortKey, sortDir } = urlState;
  const update = (next: OverviewUrlState) => setSearchParams(writeOverviewParams(next), { replace: true });

  const vm = useMemo(
    () => (indexState.status === 'ok' ? normalizeReportIndex(indexState.index) : null),
    [indexState],
  );
  const visibleRows = useMemo(
    () => (vm ? sortRows(filterRows(vm.rows, filters), sortKey, sortDir) : []),
    [vm, filters, sortKey, sortDir],
  );

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
            onOpen={(id) =>
              navigate(`/report/${encodeURIComponent(id)}`, { state: { from: location.pathname + location.search } })
            }
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="text-xl font-semibold text-slate-900">{t.title}</h1>
        {vm ? (
          <span className="text-xs text-slate-500">
            {t.total(vm.rows.length)} · {t.updatedAt(orDash(vm.generatedAt))}
          </span>
        ) : null}
      </div>
      {body}
    </div>
  );
}
