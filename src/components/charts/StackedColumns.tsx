import type { PulseSharePeriodViewModel } from '../../types/viewModel';
import { formatSharePct, shortPeriodLabels } from '../../lib/format';

// 每期 100% 堆疊直條（純 CSS）。項目依最新一期占比排序；強調的項目用珊瑚色，其他用代表色深淺。
// 最新一期右邊直接標名稱與占比（太小的段不標）；滑鼠移上去顯示該段數值。

interface StackedColumnsProps {
  periods: PulseSharePeriodViewModel[];
  /** 強調哪個項目（珊瑚色） */
  strongName?: string | null;
  ariaLabel: string;
  height?: number;
}

const COLORS = ['bg-p-pale', 'bg-p-mid', 'bg-p', 'bg-line'];
/** 占比低於此值的段不在右側標字 */
const LABEL_MIN = 6;

export function StackedColumns({ periods, strongName = null, ariaLabel, height = 170 }: StackedColumnsProps) {
  const latest = periods.at(-1);
  if (!latest) return null;
  const names = [...latest.parts].sort((a, b) => b.sharePct - a.sharePct).map((p) => p.name ?? '');
  let k = 0;
  const colorOf = new Map(names.map((n) => [n, n === strongName ? 'bg-coral' : COLORS[Math.min(k++, COLORS.length - 1)]!]));
  const labels = shortPeriodLabels(periods.map((p) => p.period));
  // 由下往上依 names 順序堆疊
  const stack = (p: PulseSharePeriodViewModel) =>
    names.flatMap((n) => p.parts.filter((x) => (x.name ?? '') === n).map((x) => ({ name: n, v: x.sharePct })));
  let acc = 0;
  const latestLabels = stack(latest).map((s) => {
    const mid = acc + s.v / 2;
    acc += s.v;
    return { ...s, mid };
  });

  return (
    <div role="img" aria-label={ariaLabel} className="flex gap-3">
      <div className="flex flex-1 items-end justify-around gap-1">
        {periods.map((p, i) => (
          <div key={p.period ?? i} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full max-w-[30px] flex-col-reverse gap-[1.5px]" style={{ height }}>
              {stack(p).map((s) => (
                <div
                  key={s.name}
                  title={`${labels[i]} ${s.name} ${formatSharePct(s.v)}`}
                  className={colorOf.get(s.name)}
                  style={{ height: `${s.v}%` }}
                />
              ))}
            </div>
            <span className="text-[11.5px] text-muted">{labels[i]}</span>
          </div>
        ))}
      </div>
      <div className="relative w-28 shrink-0" style={{ height }}>
        {latestLabels
          .filter((s) => s.v >= LABEL_MIN)
          .map((s) => (
            <span
              key={s.name}
              className={`absolute truncate text-xs ${s.name === strongName ? 'font-medium text-ink' : 'text-ink2'}`}
              style={{ bottom: `${s.mid}%`, transform: 'translateY(50%)', maxWidth: '100%' }}
              title={`${s.name} ${formatSharePct(s.v)}`}
            >
              {s.name} {formatSharePct(s.v)}
            </span>
          ))}
      </div>
    </div>
  );
}
