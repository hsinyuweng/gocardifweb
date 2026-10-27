import { zhTW } from '../i18n/zh-TW';
import type { RecentFeed } from './feedSummary';
import { formatSharePct } from './format';
import type { HeadlinePart } from './insights';
import type { KeyNumber } from './marketStory';

// 新聞與法規監控的第一個畫面（2026-10-27 V3）：一句結論、數字磚、圖表標題。只用資料裡的數字。

const t = zhTW.news;
const short = zhTW.home.domainShort;

const domainName = (d: RecentFeed['domains'][number]['domain']) => short[d ?? 'none'];
const pct = (n: number, total: number) => formatSharePct((n / total) * 100);

/**
 * 「近 30 天 34 則動態都是業者新聞稿，法規 0 則」（法規則數珊瑚色）；
 * 有法規時「近 30 天 34 則動態，法規 3 則，品牌公關最多」。沒有動態時為 null。
 */
export function newsHeadline(r: RecentFeed): HeadlinePart[] | null {
  const n = r.items.length;
  if (n === 0) return null;
  const allSelf = r.selfReported === n && r.regulation === 0;
  const parts: HeadlinePart[] = [
    { text: t.lead(n) + (allSelf ? t.allSelfReported : '') + zhTW.insights.comma },
    { text: t.regulationCount(r.regulation), strong: true },
  ];
  const top = r.domains[0];
  if (!allSelf && top) parts.push({ text: t.topDomainTail(domainName(top.domain)) });
  return parts;
}

/** 4 個數字磚：近 30 天動態、法規（珊瑚色）、最多的領域、發稿最多的公司 */
export function newsNumbers(r: RecentFeed): KeyNumber[] {
  const n = r.items.length;
  if (n === 0) return [];
  const out: KeyNumber[] = [
    {
      key: 'recent',
      label: t.tile.recent,
      value: t.count(n),
      note: r.selfReported === n ? t.tile.allSelf : r.selfReported > 0 ? t.tile.someSelf(r.selfReported) : null,
    },
    { key: 'regulation', label: t.tile.regulation, value: t.count(r.regulation), note: r.regulation === 0 ? t.tile.noRegulation : null, coral: true },
  ];
  const top = r.domains[0];
  if (top) out.push({ key: 'domain', label: t.tile.topDomain, value: domainName(top.domain), note: t.tile.domainShare(top.count, pct(top.count, n)) });
  const company = r.companies[0];
  if (company) out.push({ key: 'company', label: t.tile.topCompany, value: company.name, note: t.count(company.count) });
  return out;
}

/** 圖表段落標題：「品牌公關占 67.6%，凱基人壽發稿最多」 */
export function newsHeading(r: RecentFeed): string | null {
  const top = r.domains[0];
  if (!top || r.items.length === 0) return null;
  return t.heading(domainName(top.domain), pct(top.count, r.items.length), r.companies[0]?.name ?? null);
}
