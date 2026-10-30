import type { PulseEventViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';

// 時程（純 CSS）：由左到右等距排列；已發生實心點，預計的空心點＋「預計」。
// 事件多時只在卡片內左右捲動，不會讓整頁變寬。

export function Timeline({ events }: { events: PulseEventViewModel[] }) {
  if (events.length === 0) return <p className="text-muted">{zhTW.market.noChartData}</p>;
  return (
    <div className="overflow-x-auto pb-1">
      <ol className="grid min-w-full" style={{ gridTemplateColumns: `repeat(${events.length}, minmax(7.5rem, 1fr))` }}>
        {events.map((e, i) => (
          <li key={i} className="relative pt-6 pr-3">
            {i < events.length - 1 ? <span aria-hidden className="absolute top-[7px] left-2 right-0 h-0.5 bg-line" /> : null}
            <span
              aria-hidden
              className={`absolute top-0 left-0 size-4 rounded-full border-2 border-p ${e.upcoming ? 'bg-white' : 'bg-p'}`}
            />
            <p className="text-xs text-muted tabular-nums">
              {orDash(e.date)}
              {e.upcoming ? <span className="ml-1 rounded-md bg-line px-1 text-ink2">{zhTW.market.upcoming}</span> : null}
            </p>
            <p className="mt-0.5 text-sm text-ink">{orDash(e.title)}</p>
            {e.note ? <p className="mt-0.5 text-xs text-muted">{e.note}</p> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
