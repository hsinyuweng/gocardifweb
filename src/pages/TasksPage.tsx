import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { StatusMessage } from '../components/common/StatusMessage';
import { OwnerFilter } from '../components/report/OwnerFilter';
import { OwnerPicker } from '../components/tasks/OwnerPicker';
import { TaskGroupCard } from '../components/tasks/TaskGroupCard';
import { useConfig } from '../config/ConfigContext';
import { getDataSource, normalizeReport, normalizeReportIndex } from '../data';
import type { ReportViewModel } from '../types/viewModel';
import { zhTW } from '../i18n/zh-TW';
import { orDash } from '../lib/format';
import { DEFAULT_SORT_DIR, sortRows } from '../lib/overviewFilter';
import { readOwnerPreference, writeOwnerPreference } from '../lib/ownerPreference';
import { countOwners, groupTasks, summarizeTasks } from '../lib/tasks';
import { errorText, useBreadcrumb, useIndexState } from './pageChrome';

const t = zhTW.tasks;
const OWNER_PARAM = 'owner';

type TasksState =
  | { status: 'loading' }
  | { status: 'ok'; reports: ReportViewModel[]; failedNames: string[] }
  | { status: 'error'; error: unknown };

/** 我的待辦（規格外功能，2026-10-18 經確認）：跨報告依負責單位彙整 */
export function TasksPage() {
  useBreadcrumb([{ label: zhTW.nav.tasks }]);
  const config = useConfig();
  const indexState = useIndexState();
  const [state, setState] = useState<TasksState>({ status: 'loading' });
  const [searchParams, setSearchParams] = useSearchParams();

  // 讀完清單後同時讀取所有報告；部分失敗時其餘照常顯示
  useEffect(() => {
    if (indexState.status !== 'ok') return;
    let alive = true;
    setState({ status: 'loading' });
    // 依案件總覽預設順序；缺 report_id 的列在首頁也無法開啟，這裡略過
    const rows = sortRows(normalizeReportIndex(indexState.index).rows, 'generatedDate', DEFAULT_SORT_DIR.generatedDate)
      .filter((row) => row.reportId !== null);
    const source = getDataSource(config);
    Promise.allSettled(rows.map((row) => source.getReport(row.reportId!))).then((results) => {
      if (!alive) return;
      const reports: ReportViewModel[] = [];
      const failedNames: string[] = [];
      let firstError: unknown = null;
      results.forEach((res, i) => {
        if (res.status === 'fulfilled') {
          try {
            reports.push(normalizeReport(res.value));
            return;
          } catch (e) {
            firstError ??= e;
          }
        } else {
          firstError ??= res.reason;
        }
        failedNames.push(orDash(rows[i]!.name));
      });
      if (reports.length === 0 && firstError !== null) setState({ status: 'error', error: firstError });
      else setState({ status: 'ok', reports, failedNames });
    });
    return () => {
      alive = false;
    };
  }, [config, indexState]);

  const reports = useMemo(() => (state.status === 'ok' ? state.reports : []), [state]);
  const ownerCounts = useMemo(() => countOwners(reports), [reports]);
  const ownerOptions = useMemo(() => ownerCounts.map((c) => c.owner), [ownerCounts]);

  // 負責單位：網址優先 → localStorage（與報告頁共用）→ 未選；不在選項內時視為未選
  const urlOwner = searchParams.get(OWNER_PARAM);
  const requestedOwner = urlOwner ?? readOwnerPreference();
  const owner = requestedOwner !== null && ownerOptions.includes(requestedOwner) ? requestedOwner : null;

  const groups = useMemo(() => (owner !== null ? groupTasks(reports, owner) : []), [reports, owner]);

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

  let body;
  if (indexState.status === 'error') {
    const { message, detail } = errorText(indexState.error, zhTW.errors.notFoundIndex);
    body = <StatusMessage tone="error" message={message} detail={detail} />;
  } else if (state.status === 'error') {
    const { message, detail } = errorText(state.error, zhTW.errors.notFoundReport);
    body = <StatusMessage tone="error" message={message} detail={detail} />;
  } else if (state.status === 'loading') {
    body = <StatusMessage tone="info" message={zhTW.common.loading} />;
  } else if (reports.length === 0) {
    body = <StatusMessage tone="info" message={zhTW.overview.empty} />;
  } else if (owner === null) {
    body = (
      <StatusMessage tone="info" message={t.choosePrompt}>
        <OwnerPicker counts={ownerCounts} onSelect={handleOwnerChange} />
      </StatusMessage>
    );
  } else if (groups.length === 0) {
    body = <StatusMessage tone="info" message={zhTW.report.noOwnerMatch} />;
  } else {
    const s = summarizeTasks(groups);
    body = (
      <div className="space-y-4">
        <p className="text-slate-700">{t.summary(s.blockerCount, s.criticalCount, s.nextStepCount, s.productCount)}</p>
        {groups.map((g) => (
          <TaskGroupCard key={g.reportId} group={g} owner={owner} />
        ))}
      </div>
    );
  }

  const failedNames = state.status === 'ok' ? state.failedNames : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h1 className="text-xl font-semibold text-slate-900">
          {t.title}
          {owner !== null ? (
            <span className="ml-3 hidden text-xs font-normal text-slate-600 print:inline">
              {zhTW.report.printOwnerNote(owner)}
            </span>
          ) : null}
        </h1>
        {state.status === 'ok' && ownerOptions.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3">
            <OwnerFilter options={ownerOptions} selected={owner} onChange={handleOwnerChange} />
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
        ) : null}
      </div>
      {failedNames.length > 0 ? (
        <StatusMessage tone="error" message={t.partialFailure(failedNames.length, failedNames.join('、'))} />
      ) : null}
      {body}
    </div>
  );
}
