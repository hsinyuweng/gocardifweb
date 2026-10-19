import type { Feed, RawFeedItem } from '../types/feed';
import type { MarketPulse, RawPulseMetric } from '../types/marketPulse';
import type { FeedItemViewModel, FeedViewModel, MarketPulseViewModel, PulseMetricViewModel } from '../types/viewModel';
import { formatDateTimeTaipei } from '../lib/format';
import { num, objList, str, strList } from './normalize';

// 動態清單與市場脈動的原始欄位只在這裡讀取（正式格式未定版，改格式時改這裡）

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** 只有日期時視為台北時間當天 0 點 */
function parsePublished(v: string | null): { time: number | null; dateOnly: boolean } {
  if (v === null) return { time: null, dateOnly: false };
  const dateOnly = DATE_ONLY.test(v);
  const time = Date.parse(dateOnly ? `${v}T00:00:00+08:00` : v);
  return { time: Number.isNaN(time) ? null : time, dateOnly };
}

function safeUrl(v: unknown): string | null {
  const s = str(v);
  return s !== null && /^https?:\/\//i.test(s) ? s : null;
}

function normalizeFeedItem(item: RawFeedItem, i: number): FeedItemViewModel {
  const publishedAt = str(item.published_at);
  const { time, dateOnly } = parsePublished(publishedAt);
  return {
    id: str(item.id) ?? `feed-${i}`,
    category: str(item.category),
    title: str(item.title),
    summary: str(item.summary),
    source: str(item.source),
    url: safeUrl(item.url),
    publishedAt,
    publishedTime: time,
    dateOnly,
    relatedReportIds: strList(item.related_report_ids),
    country: str(item.country),
    productCategory: str(item.product_category),
  };
}

export function normalizeFeed(feed: Feed): FeedViewModel {
  const items = objList(feed.items)
    .map(normalizeFeedItem)
    .sort((a, b) => {
      if (a.publishedTime === b.publishedTime) return 0;
      if (a.publishedTime === null) return 1;
      if (b.publishedTime === null) return -1;
      return b.publishedTime - a.publishedTime;
    });
  return { generatedAt: formatDateTimeTaipei(str(feed.generated_at)), items };
}

function normalizeMetric(m: RawPulseMetric, i: number): PulseMetricViewModel {
  return {
    key: str(m.key) ?? `metric-${i}`,
    label: str(m.label),
    unit: str(m.unit),
    latestValue: num(m.latest_value),
    changePct: num(m.change_pct),
    changeLabel: str(m.change_label),
    series: objList(m.series)
      .map((p) => num(p.value))
      .filter((v): v is number => v !== null),
    source: str(m.source),
    sourceUrl: safeUrl(m.source_url),
    asOf: str(m.as_of),
  };
}

export function normalizeMarketPulse(pulse: MarketPulse): MarketPulseViewModel {
  return {
    generatedAt: formatDateTimeTaipei(str(pulse.generated_at)),
    metrics: objList(pulse.metrics).map(normalizeMetric),
  };
}
