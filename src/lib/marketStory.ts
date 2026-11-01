import type {
  OverviewRow,
  PulseMetricViewModel,
  PulsePointViewModel,
  PulseRankingViewModel,
  PulseRankRowViewModel,
  PulseShareViewModel,
  PulseTrendViewModel,
} from '../types/viewModel';
import { zhTW } from '../i18n/zh-TW';
import { formatPulsePeriod, formatPulseValue, formatSharePct, orDash } from './format';
import type { HeadlinePart } from './insights';
import { metricsByGroup, pulseDigits } from './pulse';
import type { Tone } from './tone';
import { signedPct, signTone } from './tone';

// 市場脈動的閱讀路徑內容（2026-11-01 使用者回饋第二輪：一頁、大標題＋大圖＋4 張圖卡；
// 每張卡的標題是一句結論，結論裡的數字就是圖上標出的重點）。
// 只用資料裡的數字；哪個指標放哪裡由 type、group、unit 決定，不寫死指標代號。

const t = zhTW.market;

// ───────── 期間 ─────────

/** 頁首右側的資料期間：「2026-08」→「2026 年 8 月」；日「2026 年 10 月 29 日」；其他照原文 */
export function periodLong(period: string | null): string | null {
  if (period === null) return null;
  const m = /^(\d{4})-(\d{2})$/.exec(period);
  if (m) return t.periodLong(+m[1]!, +m[2]!);
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(period);
  if (d) return t.dayLong(+d[1]!, +d[2]!, +d[3]!);
  return formatPulsePeriod(period);
}

/** 期間的口語寫法：「2026-08」→「8 月」；其他照原文 */
export function periodText(period: string | null): string | null {
  if (period === null) return null;
  const m = /^\d{4}-(\d{2})$/.exec(period);
  if (m) return zhTW.insights.month(+m[1]!);
  return formatPulsePeriod(period);
}

const isMonthly = (p: string | null | undefined) => !!p && /^\d{4}-\d{2}$/.test(p);
const isDaily = (p: string | null | undefined) => !!p && /^\d{4}-\d{2}-\d{2}$/.test(p);

// ───────── 取指標 ─────────

const trends = (list: PulseMetricViewModel[]) =>
  list.filter((m): m is PulseTrendViewModel => m.type === 'trend' && m.latestValue !== null);
export const shareMetrics = (list: PulseMetricViewModel[]) =>
  list.filter((m): m is PulseShareViewModel => m.type === 'share' && m.periods.length > 0);

export const trendValue = (m: PulseTrendViewModel, v: number | null) => formatPulseValue(v, m.unit, pulseDigits(m.group));

/** 市場脈動用到的指標，依用途取出；沒有資料的為 null/undefined */
export function pickMetrics(metrics: PulseMetricViewModel[]) {
  const g = metricsByGroup(metrics);
  const growth = g.get('growth') ?? [];
  const pricing = g.get('pricing') ?? [];
  const yoy = trends(growth).find((m) => m.unit === '%');
  const amount = trends(growth).find((m) => m.unit === zhTW.units.ntd);
  const mix = shareMetrics(growth).find((s) => s.periods.at(-1)?.parts.some((p) => p.growthPct !== null));
  // 利率：日資料優先（近 12 個月每日）
  const yieldM = trends(pricing).find((m) => isDaily(m.points.at(-1)?.period)) ?? trends(pricing)[0];
  const brand = g.get('brand') ?? [];
  const channel = shareMetrics(g.get('channel') ?? [])[0];
  // 法巴市占率（品牌組的百分比趨勢；2026-11-01 要畫過去五年）
  const selfShare = trends(brand).find((m) => m.unit === '%');
  return { yoy, amount, mix, yieldM, ranking: selfRanking(brand), channel, selfShare };
}

// ───────── 成長 ─────────

/** 最後連續同號（正或負）的期數 */
export function streak(points: PulsePointViewModel[]): { n: number; positive: boolean } {
  const last = points.at(-1)?.value ?? 0;
  if (last === 0) return { n: 0, positive: true };
  const positive = last > 0;
  let n = 0;
  for (let i = points.length - 1; i >= 0 && (positive ? points[i]!.value > 0 : points[i]!.value < 0); i--) n++;
  return { n, positive };
}

/** 「成長 68.5%」（好）／「衰退 3.2%」（壞） */
const growthPart = (v: number): HeadlinePart => ({
  text: v >= 0 ? t.grow(formatSharePct(v)) : t.shrink(formatSharePct(-v)),
  tone: v >= 0 ? 'good' : 'bad',
});

/** 總覽結論：「8 月新契約保費比去年同期成長 68.5%，連續 8 個月成長」 */
export function growthHeadline(yoy: PulseTrendViewModel): HeadlinePart[] {
  const v = yoy.latestValue!;
  const s = streak(yoy.points);
  const parts: HeadlinePart[] = [{ text: t.vsLastYear(periodText(yoy.points.at(-1)?.period ?? null)) }, growthPart(v)];
  if (s.n >= 3) parts.push({ text: t.streakTail(s.n, s.positive) });
  return parts;
}

/** 大標題：「新契約保費連續 8 個月成長」；沒有連續 3 期以上時同 growthHeadline */
export function heroHeadline(yoy: PulseTrendViewModel): HeadlinePart[] {
  const s = streak(yoy.points);
  if (s.n < 3) return growthHeadline(yoy);
  return [{ text: t.hero.lead }, { text: t.hero.streak(s.n, s.positive), tone: s.positive ? 'good' : 'bad' }];
}

/** 各險種年增率與候選商品對應（首頁市場框、市場脈動共用） */
export interface LineGrowthRow {
  name: string;
  growthPct: number;
  sharePct: number;
  /** 屬於這個險種的候選商品件數 */
  related: number;
}

/** 有候選商品的險種排前面，再依年增率高到低 */
export function lineGrowthRows(metrics: PulseMetricViewModel[], rows: OverviewRow[]): { period: string | null; rows: LineGrowthRow[] } | null {
  const mix = pickMetrics(metrics).mix;
  const latest = mix?.periods.at(-1);
  if (!latest) return null;
  const out = latest.parts
    .filter((p) => p.name && p.growthPct !== null)
    .map((p) => ({ name: p.name!, growthPct: p.growthPct!, sharePct: p.sharePct, related: rows.filter((r) => r.productLine === p.name).length }))
    .sort((a, b) => Number(b.related > 0) - Number(a.related > 0) || b.growthPct - a.growthPct);
  return out.length > 0 ? { period: latest.period, rows: out } : null;
}

/** 正負橫條的列：依年增率高到低，有候選商品的險種實心並標「7 件候選」 */
export function lineBarRows(lines: LineGrowthRow[]) {
  return [...lines]
    .sort((a, b) => b.growthPct - a.growthPct)
    .map((r) => ({ name: r.name, value: r.growthPct, strong: r.related > 0, tag: r.related > 0 ? t.lineTag(r.related) : null }));
}

/** 險種卡標題：「7 件候選商品屬於人壽保險，比去年同期 +51.9%」 */
export function lineHeading(lines: LineGrowthRow[]): HeadlinePart[] {
  const top = [...lines].sort((a, b) => b.related - a.related)[0];
  if (!top || top.related === 0) return [{ text: t.heading.lines }];
  return [{ text: t.heading.lineTop(top.related, top.name) }, { text: signedPct(top.growthPct), tone: signTone(top.growthPct) }];
}

// ───────── 利率 ─────────

/** 利率一年來的變化（近 12 個月的第一點到最新）；上升對儲蓄型商品定價是好事 */
export function yieldChange(m: PulseTrendViewModel): { latest: string; diff: number; diffText: string; tone?: Tone; meaning: string } | null {
  const first = m.points[0];
  const last = m.points.at(-1);
  if (!first || !last || m.points.length < 2) return null;
  const diff = last.value - first.value;
  const digits = pulseDigits(m.group);
  const flat = Math.abs(diff) < 0.5 * 10 ** -digits;
  return {
    latest: trendValue(m, last.value),
    diff,
    diffText: flat ? t.yield.flat : `${diff > 0 ? '+' : '-'}${Math.abs(diff).toFixed(digits)}%`,
    tone: flat ? undefined : diff > 0 ? 'good' : 'bad',
    meaning: flat ? t.yield.flatMeaning : diff > 0 ? t.yield.upMeaning : t.yield.downMeaning,
  };
}

/** 利率卡標題：「10 年期公債殖利率一年 +0.78%」 */
export function yieldHeading(m: PulseTrendViewModel): HeadlinePart[] {
  const c = yieldChange(m);
  if (!c) return [{ text: `${orDash(m.label)} ${trendValue(m, m.latestValue)}` }];
  return [{ text: `${orDash(m.label)}${t.yield.inYear}` }, { text: c.diffText, tone: c.tone }];
}

// ───────── 競爭 ─────────

/** 一組裡第一個有自家公司（法巴）的排名 */
export function selfRanking(list: PulseMetricViewModel[]): { m: PulseRankingViewModel; self: PulseRankRowViewModel; index: number } | null {
  for (const m of list) {
    if (m.type !== 'ranking') continue;
    const index = m.rows.findIndex((r) => r.isSelf);
    if (index !== -1) return { m, self: m.rows[index]!, index };
  }
  return null;
}

export const rankingValue = (m: PulseRankingViewModel, v: number) => formatPulseValue(v, m.unit, pulseDigits(m.group));

/** 排名預覽：前 top 名＋自家前後各 around 名 */
export function rankingPreview(m: PulseRankingViewModel, top: number, around: number): PulseRankRowViewModel[] {
  const selfIdx = m.rows.findIndex((r) => r.isSelf);
  return m.rows.filter((_, i) => i < top || (selfIdx !== -1 && Math.abs(i - selfIdx) <= around));
}

/** 排名卡標題：「法國巴黎人壽排第 10 名，市占率 3.56%」 */
export function rankingHeadline(r: NonNullable<ReturnType<typeof selfRanking>>): HeadlinePart[] {
  return [
    { text: t.ranking.selfLead(orDash(r.self.name)) },
    { text: t.rank(String(r.self.rank)), tone: 'key' },
    { text: t.ranking.shareTail(rankingValue(r.m, r.self.value)) },
  ];
}

/** 法巴市占率卡標題：「法巴新契約保費市占率近 5 年從 2.80% 升到 3.56%」；資料涵蓋不到 2 年時寫期間 */
export function selfShareHeading(m: PulseTrendViewModel): HeadlinePart[] {
  const first = m.points[0]!;
  const last = m.points.at(-1)!;
  const years = new Set(m.points.map((p) => /^(\d{4})/.exec(p.period ?? '')?.[1]).filter(Boolean)).size;
  const span = years >= 2 ? t.selfShare.years(years) : t.selfShare.sincePeriod(first.period ?? '');
  return [
    { text: `${orDash(m.label)}${span}${t.selfShare.from(trendValue(m, first.value))}${last.value >= first.value ? t.selfShare.up : t.selfShare.down}` },
    { text: trendValue(m, last.value), tone: 'key' },
  ];
}

/** 與前後名次的差距：「比第 9 名三商美邦人壽少 0.08%，比第 11 名安達國際人壽多 0.09%」 */
export function rankingGapHeading(r: NonNullable<ReturnType<typeof selfRanking>>): string | null {
  const { m, self, index } = r;
  const prev = m.rows[index - 1];
  const next = m.rows[index + 1];
  const gap = (v: number) => rankingValue(m, Math.abs(v)).replace(/%$/, '');
  const parts = [
    prev ? t.ranking.behind(prev.rank, orDash(prev.name), gap(prev.value - self.value)) : null,
    next ? t.ranking.ahead(next.rank, orDash(next.name), gap(self.value - next.value)) : null,
  ].filter((x): x is string => x !== null);
  return parts.length > 0 ? parts.join('，') : null;
}

/** 銀行通路（法巴的主力通路）在通路占比裡的那一段 */
export function bankChannel(share: PulseShareViewModel) {
  return share.periods.at(-1)?.parts.find((p) => p.name?.includes('銀行')) ?? null;
}

// ───────── 數字卡 ─────────

export interface KeyNumber {
  key: string;
  label: string;
  value: string;
  /** 數字下方的小字 */
  note: string | null;
  /** 好壞色（lib/tone.ts）；沒有時一般文字色 */
  tone?: Tone;
  /** 數字可點（例如商品名連到報告頁） */
  href?: string;
  /** 迷你線（由舊到新），放卡片右上角 */
  spark?: number[];
  /** 數字是一段文字（例如卡關原因）：字小一點，不截斷 */
  small?: boolean;
}

export { isDaily, isMonthly };
