import type { PulseMetricViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { changePctText, orDash } from '../../lib/format';
import { Sparkline } from '../charts/Sparkline';

/** 市場脈動卡片內容：名稱、變化（▲▼，海軍藍，不用燈號色 D4）、期間、趨勢小線圖 */
export function PulseList({ metrics }: { metrics: PulseMetricViewModel[] }) {
  if (metrics.length === 0) return <p className="text-slate-500">{zhTW.home.noMetrics}</p>;
  return (
    <ul className="space-y-4">
      {metrics.map((m) => (
        <li key={m.key} className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-slate-600">{orDash(m.label)}</p>
            <p className="mt-0.5 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-navy-800 tabular-nums">{changePctText(m.changePct)}</span>
              {m.changeLabel ? <span className="text-xs text-slate-500">{m.changeLabel}</span> : null}
            </p>
          </div>
          <span className="text-navy-600">
            <Sparkline values={m.series} />
          </span>
        </li>
      ))}
    </ul>
  );
}
