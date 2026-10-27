import { Fragment } from 'react';
import { Link } from 'react-router';
import type { Candidate, CompareSortKey, DimensionKey, DimensionScore } from '../../lib/score';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';
import { CandidateBreakdown } from './CandidateBreakdown';

const t = zhTW.watchlist;
const linkButton = 'text-sm text-ink2 hover:text-ink hover:underline';

interface CompareTableProps {
  /** 已依目前欄位排序 */
  rows: Candidate[];
  /** 綜合名次（不隨欄位排序改變） */
  rankOf: (id: string) => number;
  dims: readonly DimensionKey[];
  sortKey: CompareSortKey;
  sortDir: 'asc' | 'desc';
  onSort: (key: CompareSortKey) => void;
  expanded: ReadonlySet<string>;
  onToggle: (id: string) => void;
  onRemove: (id: string, name: string) => void;
  /** 進報告頁帶的 location.state（含上一份／下一份的順序） */
  linkState: unknown;
}

/** 一格分數：數字＋小橫條；燈號換算加灰色「燈號」；沒有資料寫「無資料」 */
function ScoreCell({ d }: { d: DimensionScore | undefined }) {
  if (!d || d.score === null) return <span className="text-xs text-muted">{t.noData}</span>;
  return (
    <span className="flex items-center gap-2">
      <span className="w-7 text-right tabular-nums text-ink">{d.score}</span>
      <span className="h-2 w-20 overflow-hidden rounded-full bg-p-faint">
        <span className="block h-full rounded-full bg-p-mid" style={{ width: `${Math.max(2, d.score)}%` }} />
      </span>
      {d.scoreSource === 'signal' ? <span className="text-[11px] text-muted">{t.signalTag}</span> : null}
    </span>
  );
}

function SortHeader({ label, col, sortKey, sortDir, onSort }: { label: string; col: CompareSortKey } & Pick<CompareTableProps, 'sortKey' | 'sortDir' | 'onSort'>) {
  const on = col === sortKey;
  return (
    <th scope="col" aria-sort={on ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'} className="px-3 font-medium">
      <button type="button" onClick={() => onSort(col)} title={t.compare.sortBy(label)} className={`inline-flex items-center gap-1 hover:text-ink ${on ? 'text-ink' : ''}`}>
        {label}
        <span aria-hidden className={on ? 'text-p' : 'text-line'}>
          {on && sortDir === 'asc' ? '▲' : '▼'}
        </span>
      </button>
    </th>
  );
}

/** 追蹤清單比較表（2026-10-27 V4）：每列一件商品，每欄一個面向＋綜合；點欄位標題排序，「明細 ▾」展開計算過程 */
export function CompareTable({ rows, rankOf, dims, sortKey, sortDir, onSort, expanded, onToggle, onRemove, linkState }: CompareTableProps) {
  const sortProps = { sortKey, sortDir, onSort };
  return (
    <div className="relative overflow-x-auto rounded-xl border border-line bg-white">
      <table className="w-full min-w-[860px] border-collapse text-left">
        <thead className="border-b border-line text-[13px] text-ink2">
          <tr className="h-11">
            <th scope="col" className="w-14 px-3 text-right font-medium">{t.compare.rank}</th>
            <th scope="col" className="px-3 font-medium">{t.compare.product}</th>
            {dims.map((k) => (
              <SortHeader key={k} label={t.dimensions[k]} col={k} {...sortProps} />
            ))}
            <SortHeader label={t.compare.total} col="total" {...sortProps} />
            <th scope="col" className="px-3 font-medium">
              <span className="sr-only">{t.compare.actions}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => {
            const id = c.row.reportId as string;
            const open = expanded.has(id);
            return (
              <Fragment key={id}>
                <tr className="border-b border-line align-middle last:border-b-0">
                  <td className="px-3 py-3 text-right tabular-nums text-muted">{rankOf(id)}</td>
                  <td className="max-w-[18rem] px-3 py-3">
                    <Link
                      to={`/report/${encodeURIComponent(id)}`}
                      state={linkState}
                      className="font-medium text-ink hover:underline"
                    >
                      {orDash(c.row.name)}
                    </Link>
                    <div className="truncate text-xs text-muted">
                      {orDash(c.row.issuer)} · {orDash(c.row.countryLabel)}
                    </div>
                  </td>
                  {dims.map((k) => (
                    <td key={k} className="px-3 py-3">
                      <ScoreCell d={c.score.dims.find((d) => d.key === k)} />
                    </td>
                  ))}
                  <td className="px-3 py-3 text-[20px] font-medium tabular-nums text-ink">{orDash(c.score.total)}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <button type="button" aria-expanded={open} onClick={() => onToggle(id)} className={linkButton}>
                      {t.breakdown} {open ? '▴' : '▾'}
                    </button>
                    <button type="button" onClick={() => onRemove(id, c.row.name ?? id)} className={`${linkButton} ml-4`}>
                      {t.remove}
                    </button>
                  </td>
                </tr>
                {open ? (
                  <tr className="border-b border-line bg-p-faint/40 last:border-b-0">
                    <td />
                    <td colSpan={dims.length + 3} className="px-3 py-3">
                      <CandidateBreakdown score={c.score} />
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
