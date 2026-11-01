import type { FeedViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { recentFeed } from '../../lib/feedSummary';
import { relativeTimeText } from '../../lib/format';
import { FeedTitle } from './FeedItemLine';
import { KeyLine } from './HomeCard';

const t = zhTW.home;
const LIST_LIMIT = 3;

/**
 * 新聞與法規監控框（2026-11-01 顯示資料整理）：只看法規——近 30 天法規則數、最新 3 則法規（標題新分頁開原文）。
 */
export function NewsList({ feed }: { feed: FeedViewModel }) {
  const recent = recentFeed(feed);
  const regs = recent.items.filter((i) => i.kind === 'regulation');
  if (regs.length === 0) return <p className="text-muted">{t.noRegulation}</p>;
  return (
    <>
      <KeyLine num={regs.length}>{t.regulationKey}</KeyLine>
      <ul className="space-y-1.5 text-[13px]">
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
