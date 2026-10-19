import { useState } from 'react';
import { Link } from 'react-router';
import type { FeedItemViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash, relativeTimeText } from '../../lib/format';
import { FeedTitle } from '../home/FeedItemLine';
import { FeedKindTag } from './FeedKindTag';

const t = zhTW.news;

interface NewsItemProps {
  item: FeedItemViewModel;
  /** 此法規影響的追蹤清單商品（report_id 與名稱）；空陣列時不顯示展開 */
  affected: Array<{ id: string; name: string }>;
  /** 進報告頁時帶的 location.state（麵包屑回到新聞與法規監控） */
  linkState: unknown;
}

/** 新聞與法規監控的一則：標籤＋標題、來源 · 時間；法規可展開受影響的追蹤商品 */
export function NewsItem({ item, affected, linkState }: NewsItemProps) {
  const [open, setOpen] = useState(false);
  return (
    <li className="flex gap-2 px-4 py-3">
      <span className="mt-0.5">
        <FeedKindTag kind={item.kind} />
      </span>
      <div className="min-w-0">
        <FeedTitle item={item} />
        <p className="mt-0.5 text-xs text-slate-500">
          {orDash(item.source)} · {relativeTimeText(item.publishedTime, item.dateOnly, item.publishedAt)}
          {affected.length > 0 ? (
            <>
              {' · '}
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpen(!open)}
                className="text-navy-700 underline-offset-2 hover:underline"
              >
                {t.affects(affected.length)} {open ? '▴' : '▾'}
              </button>
            </>
          ) : null}
        </p>
        {open ? (
          <ul className="mt-1 space-y-0.5 border-l-2 border-slate-200 pl-3 text-sm">
            {affected.map((p) => (
              <li key={p.id}>
                <Link to={`/report/${encodeURIComponent(p.id)}`} state={linkState} className="text-navy-700 hover:underline">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}
