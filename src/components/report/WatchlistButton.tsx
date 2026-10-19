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

const linkClass = 'whitespace-nowrap text-sm text-navy-700 hover:underline';

/**
 * 報告頁的加入追蹤清單（2026-10-20 經確認：放在固定的頂部列右側，捲到哪裡都按得到）。
 * 窄螢幕已加入時只顯示「✓ 已追蹤」＋「移出」，讓麵包屑有空間。頂部列列印時不顯示。
 */
export function WatchlistButton({ added, onAdd, onRemove, listLinkState }: WatchlistControl) {
  if (!added) {
    return (
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex h-8 items-center whitespace-nowrap rounded bg-navy-800 px-3 text-sm font-medium text-white hover:bg-navy-700"
      >
        {t.add}
      </button>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-8 items-center whitespace-nowrap rounded bg-slate-100 px-3 text-sm font-medium text-navy-800 ring-1 ring-slate-200">
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
