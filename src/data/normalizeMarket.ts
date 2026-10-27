import type { Feed, RawFeedItem } from '../types/feed';
import type { MarketPulse, RawPulseMetric, RawPulsePoint } from '../types/marketPulse';
import type {
  FeedDomain,
  FeedItemViewModel,
  FeedViewModel,
  MarketPulseViewModel,
  PulseGroup,
  PulseMetricViewModel,
  PulsePointViewModel,
} from '../types/viewModel';
import { formatDateTimeTaipei } from '../lib/format';
import { num, objList, safeUrl, str, strList } from './normalize';

// 動態清單與市場脈動的原始欄位只在這裡讀取（正式格式未定版，改格式時改這裡）

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const DOMAINS: readonly FeedDomain[] = ['product_channel', 'market_macro', 'regulation', 'claims_consumer', 'customer_brand'];

function feedKind(item: RawFeedItem): 'news' | 'regulation' {
  const kind = str(item.kind);
  if (kind === 'news' || kind === 'regulation') return kind;
  return str(item.category) === 'regulation' ? 'regulation' : 'news';
}

function feedDomain(v: unknown): FeedDomain | null {
  const s = str(v);
  return DOMAINS.includes(s as FeedDomain) ? (s as FeedDomain) : null;
}

/** 只有日期時視為台北時間當天 0 點 */
function parsePublished(v: string | null): { time: number | null; dateOnly: boolean } {
  if (v === null) return { time: null, dateOnly: false };
  const dateOnly = DATE_ONLY.test(v);
  const time = Date.parse(dateOnly ? `${v}T00:00:00+08:00` : v);
  return { time: Number.isNaN(time) ? null : time, dateOnly };
}

function normalizeFeedItem(item: RawFeedItem, i: number): FeedItemViewModel {
  const publishedAt = str(item.published_at);
  const { time, dateOnly } = parsePublished(publishedAt);
  return {
    id: str(item.id) ?? `feed-${i}`,
    kind: feedKind(item),
    domain: feedDomain(item.domain),
    title: str(item.title),
    summary: str(item.summary),
    source: str(item.source),
    selfReported: item.self_reported === true,
    url: safeUrl(item.url),
    publishedAt,
    publishedTime: time,
    dateOnly,
    relatedReportIds: strList(item.related_report_ids),
    affectedCategories: strList(item.affected_categories),
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
  const generatedRaw = str(feed.generated_at);
  const generatedTime = generatedRaw === null ? NaN : Date.parse(generatedRaw);
  return {
    generatedAt: formatDateTimeTaipei(generatedRaw),
    generatedTime: Number.isNaN(generatedTime) ? null : generatedTime,
    items,
  };
}

const PULSE_GROUPS: readonly PulseGroup[] = ['growth', 'pricing', 'channel', 'health', 'brand'];

/** 非數字的點略過 */
function points(series: RawPulsePoint[] | null | undefined): PulsePointViewModel[] {
  return objList(series).flatMap((p) => {
    const value = num(p.value);
    return value === null ? [] : [{ period: str(p.period), value }];
  });
}

function normalizeMetric(m: RawPulseMetric, i: number): PulseMetricViewModel | null {
  const g = str(m.group);
  const base = {
    key: str(m.key) ?? `metric-${i}`,
    // 舊格式沒有 group：當作成長動能
    group: PULSE_GROUPS.includes(g as PulseGroup) ? (g as PulseGroup) : 'growth',
    featured: m.featured === true,
    label: str(m.label),
    unit: str(m.unit),
    source: str(m.source),
    sourceUrl: safeUrl(m.source_url),
    asOf: str(m.as_of),
    stale: m.stale === true,
  };
  const type = str(m.type);
  if (type === 'multi_line') {
    return {
      ...base,
      type,
      lines: objList(m.lines).map((l) => ({ name: str(l.name), points: points(l.series) })),
    };
  }
  if (type === 'share') {
    return {
      ...base,
      type,
      periods: objList(m.periods).map((p) => ({
        period: str(p.period),
        parts: objList(p.parts).flatMap((part) => {
          const sharePct = num(part.share_pct);
          return sharePct === null ? [] : [{ name: str(part.name), sharePct, growthPct: num(part.growth_pct) }];
        }),
      })),
    };
  }
  if (type === 'timeline') {
    return {
      ...base,
      type,
      events: objList(m.events)
        .map((e) => ({ date: str(e.date), title: str(e.title), upcoming: str(e.status) === 'upcoming', note: str(e.note) }))
        // 日期由舊到新；缺日期排最後
        .sort((a, b) => (a.date ?? '￿').localeCompare(b.date ?? '￿')),
    };
  }
  // 不認得的 type（例如 schema 2.2 的 ranking，網站尚未支援）略過，不當成單線趨勢
  if (type !== null && type !== 'trend') return null;
  // 舊格式沒有 type：當作單線趨勢
  return {
    ...base,
    type: 'trend',
    latestValue: num(m.latest_value),
    change: num(m.change_pct),
    changeUnit: str(m.change_unit) === 'pp' ? 'pp' : 'pct',
    changeLabel: str(m.change_label),
    points: points(m.series),
  };
}

function focusSummary(v: MarketPulse['focus_summary']): MarketPulseViewModel['focus'] {
  if (typeof v === 'string') return v.trim() ? { text: v.trim(), asOf: null } : null;
  if (typeof v !== 'object' || v === null) return null;
  const text = str(v.text)?.trim();
  return text ? { text, asOf: str(v.as_of) } : null;
}

export function normalizeMarketPulse(pulse: MarketPulse): MarketPulseViewModel {
  return {
    generatedAt: formatDateTimeTaipei(str(pulse.generated_at)),
    focus: focusSummary(pulse.focus_summary),
    metrics: objList(pulse.metrics).flatMap((m, i) => normalizeMetric(m, i) ?? []),
  };
}
