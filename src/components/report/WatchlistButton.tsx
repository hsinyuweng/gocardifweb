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

/** 報告頁底部：加入追蹤清單／已在追蹤清單＋移出；列印時不顯示 */
export function WatchlistButton({ added, onAdd, onRemove, listLinkState }: WatchlistControl) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 print:hidden">
      {added ? (
        <>
          <span className="inline-flex h-9 items-center rounded bg-slate-100 px-4 font-medium text-navy-800 ring-1 ring-slate-200">
            {t.added}
          </span>
          <button type="button" onClick={onRemove} className="text-sm text-navy-700 hover:underline">
            {t.remove}
          </button>
          <Link to="/watchlist" state={listLinkState} className="text-sm text-navy-700 hover:underline">
            {t.viewList}
          </Link>
        </>
      ) : (
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-9 items-center rounded bg-navy-800 px-4 font-medium text-white hover:bg-navy-700"
        >
          {t.add}
        </button>
      )}
    </div>
  );
}
