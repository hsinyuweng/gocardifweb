import type { FeedViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { recentFeed } from '../../lib/feedSummary';
import { relativeTimeText } from '../../lib/format';
import { FeedTitle } from './FeedItemLine';

const t = zhTW.home;
const LIST_LIMIT = 5;

/**
 * 新聞與法規監控框（2026-11-01 使用者回饋）：標明是「最新法規」（沒有判斷重要性的資料，只能依時間），
 * 列最新 5 則（標題新分頁開原文）。不放則數（和下面列的幾則對不起來）。
 */
export function NewsList({ feed }: { feed: FeedViewModel }) {
  const regs = recentFeed(feed).items.filter((i) => i.kind === 'regulation');
  if (regs.length === 0) return <p className="text-muted">{t.noRegulation}</p>;
  return (
    <>
      <p className="text-xs text-muted">{t.latestRegulation}</p>
      <ul className="space-y-2 text-[13px]">
        {regs.slice(0, LIST_LIMIT).map((item) => (
          <li key={item.id} className="flex items-baseline gap-2">
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
