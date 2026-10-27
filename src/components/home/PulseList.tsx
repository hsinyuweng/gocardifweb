import { Link } from 'react-router';
import type { PulseTrendViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { formatPulseValue, orDash, pulseChangeText } from '../../lib/format';
import { Sparkline } from '../charts/Sparkline';
import { StaleTag } from '../market/StaleTag';

/** 市場脈動卡片內容：名稱、最新值大字、變化（▲▼，海軍藍，不用燈號色 D4）＋期間、趨勢小線圖；右下「看全部 →」 */
export function PulseList({ metrics }: { metrics: PulseTrendViewModel[] }) {
  return (
    <div className="space-y-3">
      {metrics.length === 0 ? (
        <p className="text-slate-500">{zhTW.home.noMetrics}</p>
      ) : (
        <ul className="space-y-4">
          {metrics.map((m) => (
            <li key={m.key} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-slate-600">
                  {orDash(m.label)}
                  {m.stale ? <StaleTag /> : null}
                </p>
                <p className="mt-0.5 text-2xl font-semibold text-navy-800 tabular-nums">{formatPulseValue(m.latestValue, m.unit)}</p>
                {m.change !== null ? (
                  <p className="mt-0.5 flex items-baseline gap-2 text-sm">
                    <span className="text-navy-800 tabular-nums">{pulseChangeText(m.change, m.changeUnit)}</span>
                    {m.changeLabel ? <span className="text-xs text-slate-500">{m.changeLabel}</span> : null}
                  </p>
                ) : null}
              </div>
              <span className="text-navy-600">
                <Sparkline values={m.points.map((p) => p.value)} />
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="text-right">
        <Link to="/market" state={{ from: '/' }} className="text-sm text-navy-700 hover:underline">
          {zhTW.home.seeAll}
        </Link>
      </div>
    </div>
  );
}
