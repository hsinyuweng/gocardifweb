import type { ReactNode } from 'react';
import type { RecommendationGroup } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { DOT_CLASS } from '../../lib/signalColor';
import { orDash } from '../../lib/format';
import { groupsByRank } from '../../lib/researchStory';

/** 列上目前選的那一個（一次只選一個，2026-11-02 使用者要求） */
export type BarChoice =
  | { kind: 'all' }
  | { kind: 'sort'; key: 'market' | 'feasibility' }
  | { kind: 'rec'; key: string | null }
  | { kind: 'unread' };

interface RecommendationBarProps {
  groups: RecommendationGroup[];
  active: BarChoice;
  /** 再點一次已選的按鈕時傳回「全部」 */
  onSelect: (next: BarChoice) => void;
  unreadCount: number;
}

// shrink-0 + whitespace-nowrap：窄螢幕時按鈕不被擠扁，整列改為橫向捲動
const base = 'inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 ring-1 transition-colors';
const on = 'bg-p text-white ring-p';
const off = 'bg-white text-ink ring-line hover:ring-p-mid';

const same = (a: BarChoice, b: BarChoice) =>
  a.kind === b.kind && ('key' in a ? 'key' in b && a.key === b.key : true);

/** 按鈕文字（2026-11-02）：「暫緩，待補資料」→「暫緩推進」；其他用後端原文 */
const buttonLabel = (g: RecommendationGroup) => (g.key !== null ? zhTW.overview.recButton[g.key] : undefined) ?? g.label;

/**
 * 篩選與排序列（第 11.2 節第 2 點；2026-11-02 改單選）：全部｜市場優先｜法規優先｜各建議｜新商品。
 * 市場、法規是排序（全部商品），各建議與新商品是篩選（依引進分數排）；點一次選取、再點一次回到全部。
 */
export function RecommendationBar({ groups, active, onSelect, unreadCount }: RecommendationBarProps) {
  const button = (choice: BarChoice, content: ReactNode, key: string) => {
    const isOn = same(active, choice);
    return (
      <button
        key={key}
        type="button"
        aria-pressed={isOn}
        className={`${base} ${isOn ? on : off}`}
        onClick={() => onSelect(isOn ? { kind: 'all' } : choice)}
      >
        {content}
      </button>
    );
  };
  const count = (n: number, isOn: boolean) => <span className={isOn ? 'text-white/80' : 'text-muted'}>{n}</span>;
  const unreadOn = active.kind === 'unread';

  return (
    <div className="flex h-12 items-center gap-2 overflow-x-auto px-px">
      {button({ kind: 'all' }, zhTW.overview.all, 'all')}
      {button({ kind: 'sort', key: 'market' }, zhTW.overview.sortMarket, 'market')}
      {button({ kind: 'sort', key: 'feasibility' }, zhTW.overview.sortLegal, 'legal')}
      {/* 建議由好到壞：有條件推進在暫緩推進前面 */}
      {groupsByRank(groups).map((g) => {
        const choice: BarChoice = { kind: 'rec', key: g.key };
        return button(
          choice,
          <>
            <span aria-hidden className={`inline-block size-2 rounded-full ${DOT_CLASS[g.color]}`} />
            <span>{orDash(buttonLabel(g))}</span>
            {count(g.count, same(active, choice))}
          </>,
          `rec-${g.key ?? '__null__'}`,
        );
      })}
      {/* 新商品（2026-11-02 由「沒看過」改名）：這台瀏覽器還沒打開過的報告；全部看過時不顯示 */}
      {unreadCount > 0 || unreadOn
        ? button(
            { kind: 'unread' },
            <>
              <span aria-hidden className="inline-block size-2 rounded-full bg-p" />
              <span>{zhTW.overview.unread}</span>
              {count(unreadCount, unreadOn)}
            </>,
            'unread',
          )
        : null}
    </div>
  );
}
