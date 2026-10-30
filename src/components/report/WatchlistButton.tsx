import { Link } from 'react-router';
import { zhTW } from '../../i18n/zh-TW';

const t = zhTW.watchlist;

export interface WatchlistControl {
  added: boolean;
  onAdd: () => void;
  onRemove: () => void;
  /** 「看追蹤清單 →」連結附帶的 location.state（追蹤清單麵包屑可回到此報告） */
  listLinkState: unknown;
}

const linkClass = 'whitespace-nowrap text-sm text-ink2 hover:text-ink hover:underline';

/**
 * 報告頁的加入追蹤清單（2026-10-31：追蹤清單代表色薰衣草，☆／★）。
 * large：頁首右側的大按鈕（和一句結論同一個畫面）；compact：固定頂部列，捲到哪裡都按得到。
 * 已加入時顯示「★ 已在追蹤清單」＋「移出」＋「看追蹤清單 →」（窄螢幕只留「★ 已追蹤」＋「移出」）。列印時不顯示。
 */
export function WatchlistButton({ added, onAdd, onRemove, listLinkState, size = 'compact' }: WatchlistControl & { size?: 'large' | 'compact' }) {
  const large = size === 'large';
  const box = large ? 'h-10 px-5 text-[15px]' : 'h-8 px-3.5 text-sm';
  if (!added) {
    return (
      <button
        type="button"
        onClick={onAdd}
        className={`inline-flex items-center whitespace-nowrap rounded-full bg-watch font-medium text-white shadow-sm transition-colors hover:bg-watch-dark print:hidden ${box}`}
      >
        {t.add}
      </button>
    );
  }
  return (
    <div className="flex items-center gap-3 print:hidden">
      <span className={`inline-flex items-center whitespace-nowrap rounded-full bg-watch-pale font-medium text-watch-dark ring-1 ring-watch/40 ${box}`}>
        <span className="sm:hidden">{t.addedShort}</span>
        <span className="hidden sm:inline">{t.added}</span>
      </span>
      <button type="button" onClick={onRemove} className={linkClass}>
        {t.remove}
      </button>
      <Link to="/watchlist" state={listLinkState} className={`${linkClass} hidden sm:inline`}>
        {t.viewList}
      </Link>
    </div>
  );
}
