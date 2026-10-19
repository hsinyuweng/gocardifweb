import type { KeyboardEvent } from 'react';
import type { BlockerCounts, OverviewRow } from '../../types/viewModel';
import type { SortDir, SortKey } from '../../lib/overviewFilter';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';
import { SOFT_BADGE_CLASS } from '../../lib/signalColor';
import { SignalLabel } from '../common/SignalLabel';

const t = zhTW.overview;
const c = t.columns;

interface ReportTableProps {
  rows: OverviewRow[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  onOpen: (reportId: string) => void;
  /** 未審閱的 report_id */
  unreadIds: ReadonlySet<string>;
}

function SortHeader({
  label,
  column,
  sortKey,
  sortDir,
  onSort,
}: {
  label: string;
  column: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const active = sortKey === column;
  return (
    <th
      scope="col"
      aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
      className="px-3 font-medium"
    >
      <button type="button" onClick={() => onSort(column)} className="inline-flex items-center gap-1 hover:text-navy-800">
        {label}
        <span aria-hidden className={`text-[10px] ${active ? 'text-navy-800' : 'text-slate-300'}`}>
          {active && sortDir === 'asc' ? t.sortAsc : t.sortDesc}
        </span>
      </button>
    </th>
  );
}

/** 待解決：「阻斷 n · 注意 m」；有重大時前面加紅字「重大 k」 */
function BlockerCell({ counts }: { counts: BlockerCounts }) {
  return (
    <span className="whitespace-nowrap">
      {counts.critical > 0 ? (
        <>
          <span className="font-semibold text-red-600">{t.blockerCritical(counts.critical)}</span>
          {' · '}
        </>
      ) : null}
      {t.blockerBlocking(counts.blocking)} · {t.blockerWarning(counts.warning)}
    </span>
  );
}

/** 案件表格（第 11.2 節第 4 點） */
export function ReportTable({ rows, sortKey, sortDir, onSort, onOpen, unreadIds }: ReportTableProps) {
  const handleKey = (e: KeyboardEvent, id: string | null) => {
    if (id && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onOpen(id);
    }
  };

  return (
    <div className="overflow-x-auto rounded border border-slate-200 bg-white">
      <table className="w-full min-w-[1100px] border-collapse text-left">
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
          <tr className="h-10">
            <SortHeader label={c.product} column="name" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <th scope="col" className="px-3 font-medium">{c.country}</th>
            <th scope="col" className="px-3 font-medium">{c.category}</th>
            <th scope="col" className="px-3 font-medium">{c.marketDemand}</th>
            <th scope="col" className="px-3 font-medium">{c.actuarial}</th>
            <th scope="col" className="px-3 font-medium">{c.regulatory}</th>
            <th scope="col" className="px-3 font-medium">{c.recommendation}</th>
            <th scope="col" className="px-3 font-medium">{c.blockers}</th>
            <SortHeader label={c.generatedDate} column="generatedDate" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const clickable = r.reportId !== null;
            return (
              <tr
                key={r.reportId ?? `row-${i}`}
                role={clickable ? 'link' : undefined}
                tabIndex={clickable ? 0 : undefined}
                onClick={clickable ? () => onOpen(r.reportId as string) : undefined}
                onKeyDown={(e) => handleKey(e, r.reportId)}
                className={`border-b border-slate-100 last:border-b-0 ${
                  clickable ? 'cursor-pointer hover:bg-slate-50 focus:bg-slate-50 focus:outline-none' : ''
                }`}
              >
                <td className="px-3 py-2">
                  <div className="font-semibold text-slate-900">
                    {orDash(r.name)}
                    {r.reportId !== null && unreadIds.has(r.reportId) ? (
                      <span className="ml-2 inline-block rounded bg-slate-100 px-1.5 py-0.5 align-middle text-xs font-medium text-navy-700 ring-1 ring-slate-200">
                        {t.unread}
                      </span>
                    ) : null}
                  </div>
                  <div className="text-xs text-slate-500">{orDash(r.issuer)}</div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{orDash(r.countryLabel)}</td>
                <td className="px-3 py-2">{orDash(r.category)}</td>
                <td className="px-3 py-2"><SignalLabel signal={r.marketDemand} /></td>
                <td className="px-3 py-2"><SignalLabel signal={r.actuarial} /></td>
                <td className="px-3 py-2"><SignalLabel signal={r.regulatory} /></td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-block whitespace-nowrap rounded px-2 py-0.5 text-[13px] ring-1 ${
                      SOFT_BADGE_CLASS[r.recommendation.color]
                    }`}
                  >
                    {orDash(r.recommendation.text)}
                  </span>
                </td>
                <td className="px-3 py-2"><BlockerCell counts={r.blockerCounts} /></td>
                <td className="px-3 py-2 whitespace-nowrap tabular-nums">{orDash(r.generatedDate)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
