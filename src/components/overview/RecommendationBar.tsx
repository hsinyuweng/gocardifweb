import type { RecommendationGroup } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { DOT_CLASS } from '../../lib/signalColor';
import { orDash } from '../../lib/format';

interface RecommendationBarProps {
  groups: RecommendationGroup[];
  /** null 表示目前為「全部」 */
  selected: { key: string | null } | null;
  onSelect: (next: { key: string | null } | null) => void;
  /** 未審閱開關（與建議篩選可同時使用） */
  unreadCount: number;
  unreadOn: boolean;
  onToggleUnread: () => void;
}

// shrink-0 + whitespace-nowrap：窄螢幕時按鈕不被擠扁，整列改為橫向捲動
const base = 'inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 ring-1 transition-colors';
const on = 'bg-p text-white ring-p';
const off = 'bg-white text-ink ring-line hover:ring-p-mid';

/** 建議分布列（第 11.2 節第 2 點）：點擊篩選，再點一次取消 */
export function RecommendationBar({
  groups,
  selected,
  onSelect,
  unreadCount,
  unreadOn,
  onToggleUnread,
}: RecommendationBarProps) {
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
            <span className={active ? 'text-white/80' : 'text-muted'}>{g.count}</span>
          </button>
        );
      })}
      {/* 沒看過（2026-10-31 改名、移到最後）：這台瀏覽器還沒打開過的報告；全部看過時不顯示 */}
      {unreadCount > 0 || unreadOn ? (
        <>
          <span aria-hidden className="h-5 w-px shrink-0 bg-line" />
          <button type="button" aria-pressed={unreadOn} className={`${base} ${unreadOn ? on : off}`} onClick={onToggleUnread}>
            <span aria-hidden className="inline-block size-2 rounded-full bg-p" />
            <span>{zhTW.overview.unread}</span>
            <span className={unreadOn ? 'text-white/80' : 'text-muted'}>{unreadCount}</span>
          </button>
        </>
      ) : null}
    </div>
  );
}
