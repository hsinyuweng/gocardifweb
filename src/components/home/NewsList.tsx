import { Link } from 'react-router';
import type { FeedItemViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { relativeTimeText } from '../../lib/format';
import { FeedKindTag } from '../news/FeedKindTag';
import { FeedTitle } from './FeedItemLine';

const t = zhTW.home;

/** 新聞與法規監控卡片內容：一行一則，[新聞]／[法規] 標籤＋標題＋相對時間；右下「看全部 →」 */
export function NewsList({ items }: { items: FeedItemViewModel[] }) {
  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="text-slate-500">{t.noFeedItems}</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => (
            <li key={item.id} className="flex items-baseline gap-2">
              <FeedKindTag kind={item.kind} />
              <span className="min-w-0 flex-1 truncate" title={item.title ?? undefined}>
                <FeedTitle item={item} />
              </span>
              <span className="shrink-0 text-xs whitespace-nowrap text-slate-500">
                {relativeTimeText(item.publishedTime, item.dateOnly, item.publishedAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="text-right">
        <Link to="/news" state={{ from: '/' }} className="text-sm text-navy-700 hover:underline">
          {t.seeAll}
        </Link>
      </div>
    </div>
  );
}
