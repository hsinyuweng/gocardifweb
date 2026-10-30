import { useSyncExternalStore, type KeyboardEvent, type MouseEvent } from 'react';
import { zhTW } from '../../i18n/zh-TW';
import { addToWatchlist, readWatchlist, removeFromWatchlist, subscribeWatchlist } from '../../lib/watchlist';

const t = zhTW.watchlist;

/**
 * 競品研究列表的「追蹤」欄（2026-10-31）：「＋ 追蹤」外框按鈕／「★ 已追蹤」實心，再按一次移出。
 * 不會打開報告：點擊與鍵盤事件都不往上傳到整列。
 */
export function WatchToggle({ reportId, name }: { reportId: string; name: string }) {
  const added = useSyncExternalStore(subscribeWatchlist, readWatchlist).includes(reportId);
  const toggle = (e: MouseEvent) => {
    e.stopPropagation();
    if (added) removeFromWatchlist(reportId);
    else addToWatchlist(reportId);
  };
  const stopKeys = (e: KeyboardEvent) => e.stopPropagation();
  return (
    <button
      type="button"
      aria-pressed={added}
      aria-label={`${added ? t.listRemoveHint : t.listAddHint}：${name}`}
      title={added ? t.listRemoveHint : t.listAddHint}
      onClick={toggle}
      onKeyDown={stopKeys}
      className={`inline-flex h-8 items-center whitespace-nowrap rounded-full px-3.5 text-[13px] font-medium transition-colors ${
        added
          ? 'bg-watch text-white hover:bg-watch-dark'
          : 'bg-white text-watch-dark ring-1 ring-watch/60 hover:bg-watch-pale'
      }`}
    >
      {added ? t.listAdded : t.listAdd}
    </button>
  );
}
