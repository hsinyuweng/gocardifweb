import type { FeedItemViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { relativeTimeText } from '../../lib/format';
import { FeedTitle } from './FeedItemLine';

const t = zhTW.home;

/** 新聞與法規監控卡片內容：一行一則，[新聞]／[法規] 標籤＋標題＋相對時間 */
export function NewsList({ items }: { items: FeedItemViewModel[] }) {
  if (items.length === 0) return <p className="text-slate-500">{t.noFeedItems}</p>;
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.id} className="flex items-baseline gap-2">
          <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-navy-700 ring-1 ring-slate-200">
            {item.category === 'regulation' ? t.regulationTag : t.newsTag}
          </span>
          <span className="min-w-0 flex-1 truncate" title={item.title ?? undefined}>
            <FeedTitle item={item} />
          </span>
          <span className="shrink-0 text-xs whitespace-nowrap text-slate-500">
            {relativeTimeText(item.publishedTime, item.dateOnly, item.publishedAt)}
          </span>
        </li>
      ))}
    </ul>
  );
}
