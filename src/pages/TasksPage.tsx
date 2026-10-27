import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import { Link, useSearchParams } from 'react-router';
import { StatusMessage } from '../components/common/StatusMessage';
import { OwnerFilter } from '../components/report/OwnerFilter';
import { OwnerPicker } from '../components/tasks/OwnerPicker';
import { TaskGroupCard } from '../components/tasks/TaskGroupCard';
import { zhTW } from '../i18n/zh-TW';
import { OWNER_PARAM, ownerParamValue, requestedOwner as resolveOwner } from '../lib/ownerParam';
import { readOwnerPreference, subscribeOwnerPreference } from '../lib/ownerPreference';
import { countOwners, groupTasks, summarizeTasks } from '../lib/tasks';
import { errorText, useAllReports, useBreadcrumb, useIndexState } from './pageChrome';
import { PageHeader } from '../components/layout/PageHeader';

const t = zhTW.tasks;

/** 我的待辦（規格外功能，2026-10-18 經確認）：跨報告依負責單位彙整 */
export function TasksPage() {
  useBreadcrumb([{ label: zhTW.nav.tasks }]);
  const indexState = useIndexState();
  const allState = useAllReports();
  const [searchParams, setSearchParams] = useSearchParams();
  const myUnit = useSyncExternalStore(subscribeOwnerPreference, readOwnerPreference);

  const reports = useMemo(() => (allState.status === 'ok' ? allState.result.reports : []), [allState]);
  const ownerCounts = useMemo(() => countOwners(reports), [reports]);
  const ownerOptions = useMemo(() => ownerCounts.map((c) => c.owner), [ownerCounts]);

  // 負責單位：網址優先 → 我的單位 → 未選；不在選項內時視為未選
  const urlOwner = searchParams.get(OWNER_PARAM);
  const requested = resolveOwner(urlOwner, myUnit);
  const owner = requested !== null && ownerOptions.includes(requested) ? requested : null;

  const groups = useMemo(() => (owner !== null ? groupTasks(reports, owner) : []), [reports, owner]);

  /** replace：下拉切換不新增瀏覽紀錄；選單位按鈕則新增，按上一頁可回到選單位畫面 */
  const setOwnerParam = useCallback(
    (next: string | null, replace: boolean) => {
      setSearchParams({ [OWNER_PARAM]: ownerParamValue(next) }, { replace });
    },
    [setSearchParams],
  );

  // 由我的單位取得的值同步寫入網址，方便分享
  useEffect(() => {
    if (urlOwner === null && owner !== null) setOwnerParam(owner, true);
  }, [urlOwner, owner, setOwnerParam]);

  let body;
  if (indexState.status === 'error') {
    const { message, detail } = errorText(indexState.error, zhTW.errors.notFoundIndex);
    body = <StatusMessage tone="error" message={message} detail={detail} />;
  } else if (allState.status === 'error') {
    const { message, detail } = errorText(allState.error, zhTW.errors.notFoundReport);
    body = <StatusMessage tone="error" message={message} detail={detail} />;
  } else if (allState.status !== 'ok') {
    body = <StatusMessage tone="info" message={zhTW.common.loading} />;
  } else if (reports.length === 0) {
    body = <StatusMessage tone="info" message={zhTW.overview.empty} />;
  } else if (owner === null) {
    body = (
      <StatusMessage tone="info" message={t.choosePrompt}>
        <OwnerPicker counts={ownerCounts} onSelect={(o) => setOwnerParam(o, false)} />
      </StatusMessage>
    );
  } else {
    const allUnitsLink = (
      <Link to={`/tasks?${OWNER_PARAM}=`} className="text-navy-700 hover:underline print:hidden">
        {t.allUnits}
      </Link>
    );
    if (groups.length === 0) {
      body = (
        <StatusMessage tone="info" message={zhTW.report.noOwnerMatch}>
          {allUnitsLink}
        </StatusMessage>
      );
    } else {
      const s = summarizeTasks(groups);
      body = (
        <div className="space-y-4">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            {allUnitsLink}
            <p className="text-slate-700">
              {t.summary(s.blockerCount, s.criticalCount, s.nextStepCount, s.productCount)}
            </p>
          </div>
          {groups.map((g) => (
            <TaskGroupCard key={g.reportId} group={g} owner={owner} />
          ))}
        </div>
      );
    }
  }

  const failedNames = allState.status === 'ok' ? allState.result.failedNames : [];

  return (
    <div className="space-y-6">
      <PageHeader
        icon="tasks"
        title={
          <>
            {t.title}
            {owner !== null ? (
              <span className="ml-3 hidden text-xs font-normal text-slate-600 print:inline">
                {zhTW.report.printOwnerNote(owner)}
              </span>
            ) : null}
          </>
        }
        desc={zhTW.pageDesc.tasks}
        aside={
          allState.status === 'ok' && ownerOptions.length > 0 ? (
            <div className="flex flex-wrap items-center gap-3 text-sm text-ink">
              <OwnerFilter options={ownerOptions} selected={owner} onChange={(o) => setOwnerParam(o, true)} />
              {owner !== null ? (
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="h-8 rounded border border-slate-300 bg-white px-3 text-slate-700 hover:border-navy-600 hover:text-navy-800 print:hidden"
                >
                  {zhTW.report.print}
                </button>
              ) : null}
            </div>
          ) : null
        }
      />
      {failedNames.length > 0 ? (
        <StatusMessage tone="error" message={t.partialFailure(failedNames.length, failedNames.join('、'))} />
      ) : null}
      {body}
    </div>
  );
}
