import { Link, useLocation } from 'react-router';
import type { OverviewRow, SignalColor } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';

// 引進分數（lib/introScore.ts）的顯示：數字＋長條。顏色跟整體建議一致：推進藍、不建議紅、其他灰。

const BAR: Record<SignalColor, string> = {
  green: 'bg-good',
  yellow: 'bg-slate-400',
  orange: 'bg-slate-400',
  red: 'bg-coral',
  gray: 'bg-slate-400',
};
const NUM: Record<SignalColor, string> = {
  green: 'text-good-ink',
  yellow: 'text-ink',
  orange: 'text-ink',
  red: 'text-coral',
  gray: 'text-ink',
};

const scoreTitle = (r: OverviewRow) =>
  r.score ? zhTW.score.breakdown(r.score.rec, r.score.blocking, r.score.market) : undefined;

/** 只有數字（首頁框內的小列） */
export function ScoreNumber({ row, className = '' }: { row: OverviewRow; className?: string }) {
  if (!row.score) return null;
  return (
    <span className={`shrink-0 font-semibold tabular-nums ${NUM[row.recommendation.color]} ${className}`} title={scoreTitle(row)}>
      {zhTW.score.points(row.score.total)}
    </span>
  );
}

/** 表格欄：數字在左、固定寬度長條在右 */
export function ScoreBar({ row, barClass = 'w-16' }: { row: OverviewRow; barClass?: string }) {
  if (!row.score) return <span className="text-muted">{zhTW.common.dash}</span>;
  const c = row.recommendation.color;
  return (
    <span className="flex items-center gap-2" title={scoreTitle(row)}>
      <span className={`w-7 text-right text-[15px] font-semibold tabular-nums ${NUM[c]}`}>{row.score.total}</span>
      <span className={`h-2 shrink-0 overflow-hidden rounded-full bg-line ${barClass}`}>
        <span className={`block h-full rounded-full ${BAR[c]}`} style={{ width: `${row.score.total}%` }} />
      </span>
    </span>
  );
}

/**
 * 所有商品的分數橫條圖（競品研究第一個畫面）：簡稱（連報告頁）｜長條（0–100）｜分數。
 * 推薦的商品藍色，一眼看出哪件最好。rows 已排好。
 */
export function ScoreChart({ rows }: { rows: OverviewRow[] }) {
  const location = useLocation();
  const shown = rows.filter((r) => r.score !== null);
  if (shown.length === 0) return null;
  return (
    <ul aria-label={zhTW.score.chartLabel} className="grid grid-cols-[minmax(0,12rem)_1fr_auto] items-center gap-x-3 gap-y-2 text-[13.5px]">
      {shown.map((r) => {
        const c = r.recommendation.color;
        const strong = c === 'green';
        return (
          <li key={r.reportId ?? r.name} className="contents" title={scoreTitle(r)}>
            {r.reportId ? (
              <Link
                to={`/report/${encodeURIComponent(r.reportId)}`}
                state={{ from: location.pathname + location.search, fromState: location.state }}
                className={`truncate hover:underline ${strong ? 'font-semibold text-ink' : 'text-ink2'}`}
                title={r.name ?? undefined}
              >
                {orDash(r.shortName)}
              </Link>
            ) : (
              <span className="truncate text-ink2">{orDash(r.shortName)}</span>
            )}
            <span className="h-3 overflow-hidden rounded-md bg-p-faint">
              <span className={`block h-full rounded-md ${BAR[c]}`} style={{ width: `${r.score!.total}%` }} />
            </span>
            <span className={`w-8 text-right font-semibold tabular-nums ${NUM[c]}`}>{r.score!.total}</span>
          </li>
        );
      })}
    </ul>
  );
}
