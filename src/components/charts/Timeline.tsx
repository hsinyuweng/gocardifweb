import type { PulseEventViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';

// 時程（純 CSS）：由左到右等距排列；已發生實心點，預計的空心點＋「預計」。
// 事件多時只在卡片內左右捲動，不會讓整頁變寬。

export function Timeline({ events }: { events: PulseEventViewModel[] }) {
  if (events.length === 0) return <p className="text-slate-500">{zhTW.market.noChartData}</p>;
  return (
    <div className="overflow-x-auto pb-1">
      <ol className="grid min-w-full" style={{ gridTemplateColumns: `repeat(${events.length}, minmax(7.5rem, 1fr))` }}>
        {events.map((e, i) => (
          <li key={i} className="relative pt-6 pr-3">
            {i < events.length - 1 ? <span aria-hidden className="absolute top-[7px] left-2 right-0 h-0.5 bg-slate-200" /> : null}
            <span
              aria-hidden
              className={`absolute top-0 left-0 size-4 rounded-full border-2 border-navy-700 ${e.upcoming ? 'bg-white' : 'bg-navy-700'}`}
            />
            <p className="text-xs text-slate-500 tabular-nums">
              {orDash(e.date)}
              {e.upcoming ? <span className="ml-1 rounded bg-slate-100 px-1 text-slate-600">{zhTW.market.upcoming}</span> : null}
            </p>
            <p className="mt-0.5 text-sm text-slate-800">{orDash(e.title)}</p>
            {e.note ? <p className="mt-0.5 text-xs text-slate-500">{e.note}</p> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
