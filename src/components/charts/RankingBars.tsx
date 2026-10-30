import { Fragment } from 'react';
import type { PulseRankRowViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';

// 同業排名橫條（純 CSS，2026-10-27 視覺改版規劃 §8）：名次、公司、橫條、數字。
// 自家公司（法巴）整列珊瑚色；名次不連續時中間放「⋯」。橫條長度以列出的最大值為 100%。

interface RankingBarsProps {
  rows: PulseRankRowViewModel[];
  formatValue: (v: number) => string;
  ariaLabel: string;
  /** 緊湊版（重點指標卡內）：列距小、字小 */
  compact?: boolean;
}

export function RankingBars({ rows, formatValue, ariaLabel, compact = false }: RankingBarsProps) {
  const max = Math.max(...rows.map((r) => r.value), 0) || 1;
  return (
    <ul
      aria-label={ariaLabel}
      className={`grid grid-cols-[auto_auto_1fr] items-center gap-x-3 ${compact ? 'gap-y-1 text-[12.5px]' : 'gap-y-2 text-[13.5px]'}`}
    >
      {rows.map((r, i) => {
        const gap = i > 0 && r.rank - rows[i - 1]!.rank > 1;
        const tone = r.isSelf ? 'font-medium text-coral' : 'text-ink2';
        return (
          <Fragment key={`${r.rank}-${r.name ?? i}`}>
            {gap ? (
              <li aria-hidden className="col-span-3 pl-1 leading-none text-muted">
                {zhTW.market.ranking.gap}
              </li>
            ) : null}
            <li className="contents" title={`${zhTW.market.rank(String(r.rank))} ${orDash(r.name)}：${formatValue(r.value)}`}>
              <span className={`text-right tabular-nums ${r.isSelf ? 'text-coral' : 'text-muted'}`}>{r.rank}</span>
              <span className={`max-w-[11rem] truncate ${tone}`}>{orDash(r.name)}</span>
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className={`${compact ? 'h-2' : 'h-2.5'} shrink-0 rounded ${r.isSelf ? 'bg-coral' : 'bg-p-pale'}`}
                  style={{ width: `calc((100% - 3.5rem) * ${r.value / max})`, minWidth: 4 }}
                />
                <span className={`tabular-nums ${tone}`}>{formatValue(r.value)}</span>
              </span>
            </li>
          </Fragment>
        );
      })}
    </ul>
  );
}
