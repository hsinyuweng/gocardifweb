import type { FeedDomain, FeedItemViewModel, FeedViewModel } from '../types/viewModel';
import { todayTaipei } from './format';

const DAY_MS = 86_400_000;
const WINDOW_MS = 30 * DAY_MS;
const COMPANY_LIMIT = 5;

export interface RecentFeed {
  /** 近 30 天的動態，新到舊 */
  items: FeedItemViewModel[];
  regulation: number;
  /** 業者自述（新聞稿）的則數 */
  selfReported: number;
  /** 各領域則數，多到少；沒有領域的為 null */
  domains: { domain: FeedDomain | null; count: number }[];
  /** 發稿最多的公司（前 5），多到少 */
  companies: { name: string; count: number }[];
  /** 每週則數（週一起算，由舊到新，中間沒有動態的週為 0）；label「10/19」 */
  weeks: { label: string; count: number }[];
  /** 最早與最新一則的日期「9/29」「10/22」；沒有時為 null */
  range: { from: string; to: string } | null;
}

/** 來源「中央社財經訊息平台－凱基人壽」→「凱基人壽」；沒有「－」時用整個來源 */
export function companyOf(source: string | null): string | null {
  if (!source) return null;
  const parts = source.split(/[－—]/);
  return (parts[parts.length - 1] ?? source).trim() || null;
}

/** 台北時間的日期（UTC 0 點毫秒），用來算週 */
function taipeiDay(time: number): number {
  const [y, m, d] = todayTaipei(new Date(time)).split('-').map(Number) as [number, number, number];
  return Date.UTC(y, m - 1, d);
}

const md = (day: number) => {
  const d = new Date(day);
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
};

/**
 * 近 30 天的動態：從資料更新時間往前算（後端暫停更新時數字不會慢慢變成 0）；
 * 資料沒有更新時間才用現在。沒有發布時間的不計入。
 */
export function recentFeed(feed: FeedViewModel, now: number = Date.now()): RecentFeed {
  const from = (feed.generatedTime ?? now) - WINDOW_MS;
  const items = feed.items.filter((i) => i.publishedTime !== null && i.publishedTime >= from);

  const domainCounts = new Map<FeedDomain | null, number>();
  const companyCounts = new Map<string, number>();
  const weekCounts = new Map<number, number>();
  for (const i of items) {
    domainCounts.set(i.domain, (domainCounts.get(i.domain) ?? 0) + 1);
    const company = companyOf(i.source);
    if (company) companyCounts.set(company, (companyCounts.get(company) ?? 0) + 1);
    const day = taipeiDay(i.publishedTime!);
    const monday = day - ((new Date(day).getUTCDay() + 6) % 7) * DAY_MS;
    weekCounts.set(monday, (weekCounts.get(monday) ?? 0) + 1);
  }

  const mondays = [...weekCounts.keys()].sort((a, b) => a - b);
  const weeks: RecentFeed['weeks'] = [];
  if (mondays.length > 0) {
    for (let w = mondays[0]!; w <= mondays[mondays.length - 1]!; w += 7 * DAY_MS) weeks.push({ label: md(w), count: weekCounts.get(w) ?? 0 });
  }
  const days = items.map((i) => taipeiDay(i.publishedTime!));

  return {
    items,
    regulation: items.filter((i) => i.kind === 'regulation').length,
    selfReported: items.filter((i) => i.selfReported).length,
    domains: [...domainCounts].map(([domain, count]) => ({ domain, count })).sort((a, b) => b.count - a.count),
    companies: [...companyCounts]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, COMPANY_LIMIT),
    weeks,
    range: days.length > 0 ? { from: md(Math.min(...days)), to: md(Math.max(...days)) } : null,
  };
}

/** 一則動態的台北日期「2026-10-22」；沒有發布時間時為 null */
export function feedDay(item: FeedItemViewModel): string | null {
  return item.publishedTime === null ? null : todayTaipei(new Date(item.publishedTime));
}

/** 最近 n 個有動態的日子（新到舊）：date「2026-10-22」、label「10/22」、則數 */
export function recentDays(items: FeedItemViewModel[], n = 5): { date: string; label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const i of items) {
    const d = feedDay(i);
    if (d) counts.set(d, (counts.get(d) ?? 0) + 1);
  }
  return [...counts]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, n)
    .map(([date, count]) => {
      const [, m, d] = date.split('-');
      return { date, label: `${+m!}/${+d!}`, count };
    });
}
