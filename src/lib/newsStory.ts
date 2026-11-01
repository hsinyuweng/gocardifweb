import { zhTW } from '../i18n/zh-TW';
import type { RecentFeed } from './feedSummary';
import type { HeadlinePart } from './insights';
import type { KeyNumber } from './marketStory';

// 新聞與法規監控的第一個畫面（2026-11-01 顯示資料整理）：只突顯影響引進判斷的法規與同業商品動態。

const t = zhTW.news;

const domainCount = (r: RecentFeed, d: string) => r.domains.find((x) => x.domain === d)?.count ?? 0;

/** 「近 30 天法規 12 則、同業商品與通路動態 10 則」（法規則數珊瑚色）；沒有動態時為 null */
export function newsHeadline(r: RecentFeed): HeadlinePart[] | null {
  if (r.items.length === 0) return null;
  return [
    { text: t.leadRecent },
    { text: t.regulationCount(r.regulation), strong: true },
    { text: t.productTail(domainCount(r, 'product_channel')) },
  ];
}

/** 3 個數字磚：法規（珊瑚色）、同業商品與通路、其他動態（預設收起） */
export function newsNumbers(r: RecentFeed): KeyNumber[] {
  const n = r.items.length;
  if (n === 0) return [];
  const product = domainCount(r, 'product_channel');
  return [
    { key: 'regulation', label: t.tile.regulation, value: t.count(r.regulation), note: r.regulation === 0 ? t.tile.noRegulation : null, coral: true },
    { key: 'product', label: t.tile.product, value: t.count(product), note: null },
    { key: 'others', label: t.tile.others, value: t.count(n - r.regulation - product), note: t.tile.othersNote },
  ];
}
