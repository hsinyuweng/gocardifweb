import type { DistributionSegment } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { DOT_CLASS } from '../../lib/signalColor';

/** 法規燈號分布條（第 13 節，純 CSS）：依各值比例分段，下方以文字列出標籤與數字 */
export function RegulatoryDistributionBar({ segments }: { segments: DistributionSegment[] }) {
  const total = segments.reduce((sum, s) => sum + s.count, 0);
  if (total === 0) return <p className="text-slate-500">{zhTW.charts.noData}</p>;

  return (
    <div>
      {/* 段與段之間留 1px 白色間隔，避免同色段（如待補、不適用皆為灰）黏在一起 */}
      <div className="flex h-2.5 gap-px overflow-hidden rounded-full bg-white" aria-hidden>
        {segments
          .filter((s) => s.count > 0)
          .map((s) => (
            <div key={s.key} className={DOT_CLASS[s.color]} style={{ width: `${(s.count / total) * 100}%` }} />
          ))}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
        {segments.map((s) => (
          <li key={s.key} className="inline-flex items-center gap-1">
            <span aria-hidden className={`inline-block size-2 rounded-full ${DOT_CLASS[s.color]}`} />
            {s.label} <span className="font-semibold text-slate-800 tabular-nums">{s.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
