import { zhTW } from '../i18n/zh-TW';
import type { RecentFeed } from './feedSummary';
import type { HeadlinePart } from './insights';

// 新聞與法規監控的第一個畫面（2026-11-01 顯示資料整理）：只突顯影響引進判斷的法規與同業商品動態。

const t = zhTW.news;

const domainCount = (r: RecentFeed, d: string) => r.domains.find((x) => x.domain === d)?.count ?? 0;

/** 「近 30 天法規 12 則、同業商品與通路動態 10 則」（法規則數用代表色深色）；沒有動態時為 null。數字卡拿掉（2026-11-01：標題已寫） */
export function newsHeadline(r: RecentFeed): HeadlinePart[] | null {
  if (r.items.length === 0) return null;
  return [
    { text: t.leadRecent },
    { text: t.regulationCount(r.regulation) },
    { text: t.productTail(domainCount(r, 'product_channel')) },
  ];
}
