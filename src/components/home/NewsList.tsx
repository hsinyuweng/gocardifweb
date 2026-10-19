import type { FeedItemViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { FeedMeta, FeedTitle } from './FeedItemLine';

/** 新聞監控卡片內容：最新幾則新聞與市場統計 */
export function NewsList({ items }: { items: FeedItemViewModel[] }) {
  if (items.length === 0) return <p className="text-slate-500">{zhTW.home.noFeedItems}</p>;
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id}>
          <FeedTitle item={item} />
          <FeedMeta item={item} />
        </li>
      ))}
    </ul>
  );
}
