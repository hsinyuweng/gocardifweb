import type { RecommendationGroup } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { DOT_CLASS } from '../../lib/signalColor';
import { orDash } from '../../lib/format';

interface RecommendationBarProps {
  groups: RecommendationGroup[];
  /** null 表示目前為「全部」 */
  selected: { key: string | null } | null;
  onSelect: (next: { key: string | null } | null) => void;
}

// shrink-0 + whitespace-nowrap：窄螢幕時按鈕不被擠扁，整列改為橫向捲動
const base = 'inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 ring-1 transition-colors';
const on = 'bg-navy-800 text-white ring-navy-800';
const off = 'bg-white text-slate-700 ring-slate-300 hover:ring-slate-400';

/** 建議分布列（第 11.2 節第 2 點）：點擊篩選，再點一次取消 */
export function RecommendationBar({ groups, selected, onSelect }: RecommendationBarProps) {
  return (
    <div className="flex h-12 items-center gap-2 overflow-x-auto px-px">
      <button type="button" className={`${base} ${selected === null ? on : off}`} onClick={() => onSelect(null)}>
        {zhTW.overview.all}
      </button>
      {groups.map((g) => {
        const active = selected !== null && selected.key === g.key;
        return (
          <button
            key={g.key ?? '__null__'}
            type="button"
            aria-pressed={active}
            className={`${base} ${active ? on : off}`}
            onClick={() => onSelect(active ? null : { key: g.key })}
          >
            <span aria-hidden className={`inline-block size-2 rounded-full ${DOT_CLASS[g.color]}`} />
            <span>{orDash(g.label)}</span>
            <span className={active ? 'text-white/80' : 'text-slate-500'}>{g.count}</span>
          </button>
        );
      })}
    </div>
  );
}
