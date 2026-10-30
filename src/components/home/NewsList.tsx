import type { FeedViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { recentFeed } from '../../lib/feedSummary';
import { relativeTimeText } from '../../lib/format';
import { BigShareBar } from '../charts/BigShareBar';
import { FeedKindTag } from '../news/FeedKindTag';
import { FeedTitle } from './FeedItemLine';
import { KeyLine } from './HomeCard';

const t = zhTW.home;
const LIST_LIMIT = 2;

/**
 * 新聞與法規監控框（2026-10-27 視覺改版）：近 30 天則數與法規則數（0 則時珊瑚色）、
 * 各領域則數大橫條、最新 2 則（標題新分頁開原文）。
 */
export function NewsList({ feed }: { feed: FeedViewModel }) {
  if (feed.items.length === 0) return <p className="text-muted">{t.noFeedItems}</p>;
  const recent = recentFeed(feed);
  return (
    <>
      <KeyLine num={recent.items.length}>
        {t.newsKey} <span className={recent.regulation === 0 ? 'text-coral' : undefined}>{recent.regulation}</span> {t.countUnit}
      </KeyLine>
      <BigShareBar
        ariaLabel={t.newsKey}
        segments={recent.domains.map(({ domain, count }) => ({
          key: domain ?? 'none',
          label: `${t.domainShort[domain ?? 'none']} ${count}`,
          value: count,
          title: `${domain ? zhTW.news.domains[domain] : t.domainShort.none}：${count} ${t.countUnit}`,
        }))}
      />
      <ul className="mt-auto space-y-1.5 text-[13px]">
        {feed.items.slice(0, LIST_LIMIT).map((item) => (
          <li key={item.id} className="flex items-baseline gap-2">
            <FeedKindTag kind={item.kind} />
            <span className="min-w-0 flex-1 truncate" title={item.title ?? undefined}>
              <FeedTitle item={item} />
            </span>
            <span className="shrink-0 text-xs whitespace-nowrap text-muted">
              {relativeTimeText(item.publishedTime, item.dateOnly, item.publishedAt)}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
