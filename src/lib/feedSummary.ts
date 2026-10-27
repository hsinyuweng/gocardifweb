import type { FeedDomain, FeedItemViewModel, FeedViewModel } from '../types/viewModel';

const WINDOW_MS = 30 * 86_400_000;

export interface RecentFeed {
  /** 近 30 天的動態，新到舊 */
  items: FeedItemViewModel[];
  regulation: number;
  /** 各領域則數，多到少；沒有領域的為 null */
  domains: { domain: FeedDomain | null; count: number }[];
}

/**
 * 近 30 天的動態：從資料更新時間往前算（後端暫停更新時數字不會慢慢變成 0）；
 * 資料沒有更新時間才用現在。沒有發布時間的不計入。
 */
export function recentFeed(feed: FeedViewModel, now: number = Date.now()): RecentFeed {
  const from = (feed.generatedTime ?? now) - WINDOW_MS;
  const items = feed.items.filter((i) => i.publishedTime !== null && i.publishedTime >= from);
  const counts = new Map<FeedDomain | null, number>();
  for (const i of items) counts.set(i.domain, (counts.get(i.domain) ?? 0) + 1);
  return {
    items,
    regulation: items.filter((i) => i.kind === 'regulation').length,
    domains: [...counts].map(([domain, count]) => ({ domain, count })).sort((a, b) => b.count - a.count),
  };
}
