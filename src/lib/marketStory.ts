import type {
  PulseGroup,
  PulseMetricViewModel,
  PulsePointViewModel,
  PulseRankingViewModel,
  PulseRankRowViewModel,
  PulseShareViewModel,
  PulseTrendViewModel,
} from '../types/viewModel';
import { zhTW } from '../i18n/zh-TW';
import { formatPulsePeriod, formatPulseValue, formatSharePct, orDash, pulseChangeParts } from './format';
import { metricsByGroup, PULSE_GROUP_ORDER, pulseDigits } from './pulse';

// 市場脈動分頁的閱讀路徑內容（2026-10-27 視覺改版 V2）：數字磚、圖表標題。
// 只用資料裡的數字；哪個指標放哪裡由 type 與 group 決定，不寫死指標代號。

const t = zhTW.market;

/** 市場脈動分頁：總覽＋各組 */
export type MarketTab = 'overview' | PulseGroup;

/** 有指標的組（分頁只顯示這些；健康度等沒有資料時不出現） */
export function availableGroups(metrics: PulseMetricViewModel[]): PulseGroup[] {
  const groups = metricsByGroup(metrics);
  return PULSE_GROUP_ORDER.filter((g) => groups.get(g)!.length > 0);
}

export function isTrend(m: PulseMetricViewModel): m is PulseTrendViewModel {
  return m.type === 'trend';
}

/** 一組的主要指標：第一個有最新值的單線趨勢 */
export function mainTrend(list: PulseMetricViewModel[]): PulseTrendViewModel | undefined {
  return list.filter(isTrend).find((m) => m.latestValue !== null);
}

export function shareMetrics(list: PulseMetricViewModel[]): PulseShareViewModel[] {
  return list.filter((m): m is PulseShareViewModel => m.type === 'share' && m.periods.length > 0);
}

// ───────── 同業排名 ─────────

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

/** 差距的數字（不帶符號與單位）：「0.08」 */
const gapNumber = (m: PulseRankingViewModel, v: number) => rankingValue(m, Math.abs(v)).replace(/%$/, '');

/** 排名預覽：前 top 名＋自家前後各 around 名（重點指標卡用 around=2、只列自家附近） */
export function rankingPreview(m: PulseRankingViewModel, top: number, around: number): PulseRankRowViewModel[] {
  const selfIdx = m.rows.findIndex((r) => r.isSelf);
  return m.rows.filter((_, i) => i < top || (selfIdx !== -1 && Math.abs(i - selfIdx) <= around));
}

/** 與前後名次的差距：「比第 9 名三商美邦人壽少 0.08 個百分點，比第 11 名安達國際人壽多 0.09 個百分點」 */
export function rankingGapHeading(list: PulseMetricViewModel[]): string | null {
  const r = selfRanking(list);
  if (!r) return null;
  const { m, self, index } = r;
  const prev = m.rows[index - 1];
  const next = m.rows[index + 1];
  const tr = t.ranking;
  const parts = [
    prev ? tr.behind(prev.rank, orDash(prev.name), gapNumber(m, prev.value - self.value)) : null,
    next ? tr.ahead(next.rank, orDash(next.name), gapNumber(m, self.value - next.value)) : null,
  ].filter((x): x is string => x !== null);
  return parts.length > 0 ? parts.join('，') : null;
}

/** 排名的數字磚：（沒有單線市占率時）自家數值、名次、與前一名差距、前 5 名合計 */
function rankingTiles(list: PulseMetricViewModel[], withShare: boolean): KeyNumber[] {
  const r = selfRanking(list);
  if (!r) return [];
  const { m, self, index } = r;
  const tr = t.ranking;
  const out: KeyNumber[] = [];
  if (withShare) {
    out.push({ key: `${m.key}-self`, label: tr.shareOf(orDash(self.name)), value: rankingValue(m, self.value), note: periodLong(m.period), coral: true });
  }
  out.push({ key: `${m.key}-rank`, label: tr.tileRank, value: zhTW.market.rank(String(self.rank)), note: tr.ofTotal(m.rows.length) });
  const prev = m.rows[index - 1];
  const next = m.rows[index + 1];
  if (prev) {
    out.push({ key: `${m.key}-gap`, label: tr.tileGap, value: tr.pp(gapNumber(m, prev.value - self.value)), note: tr.neighbor(prev.rank, orDash(prev.name)) });
  } else if (next) {
    out.push({ key: `${m.key}-gap`, label: tr.tileLead, value: tr.pp(gapNumber(m, self.value - next.value)), note: tr.neighbor(next.rank, orDash(next.name)) });
  }
  const top = m.rows.slice(0, 5);
  if (top.length === 5 && m.unit === '%') {
    const first = m.rows[0]!;
    out.push({
      key: `${m.key}-top`,
      label: tr.tileTop(5),
      value: rankingValue(m, top.reduce((s, x) => s + x.value, 0)),
      note: tr.topNote(orDash(first.name), rankingValue(m, first.value)),
    });
  }
  return out;
}

/** 期間的數量詞：月「個月」、週「週」、其他「期」 */
export function periodUnit(period: string | null): string {
  if (period && /^\d{4}-\d{2}$/.test(period)) return t.unitMonth;
  if (period && /^\d{4}-\d{2}-\d{2}$/.test(period)) return t.unitTradingDay;
  if (period && /^\d{4}-W\d{2}$/.test(period)) return t.unitWeek;
  return t.unitPeriod;
}

/** 頁首右側的資料期間：「2026-08」→「2026 年 8 月」；週「10/19 當週」；其他照原文 */
export function periodLong(period: string | null): string | null {
  if (period === null) return null;
  const m = /^(\d{4})-(\d{2})$/.exec(period);
  if (m) return t.periodLong(+m[1]!, +m[2]!);
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(period);
  if (d) return t.dayLong(+d[1]!, +d[2]!, +d[3]!);
  return formatPulsePeriod(period);
}

/** 期間的口語寫法：「2026-08」→「8 月」；週「10/19 當週」；其他照原文 */
export function periodText(period: string | null): string | null {
  if (period === null) return null;
  const m = /^\d{4}-(\d{2})$/.exec(period);
  if (m) return zhTW.insights.month(+m[1]!);
  return formatPulsePeriod(period);
}

/** 正負有意義的指標：成長動能組（年增率等）。利率、市占率永遠是正的，不寫「連續 N 期為正」 */
export function signMatters(m: PulseTrendViewModel): boolean {
  return m.group === 'growth';
}

/** 最後連續同號（正或負）的期數；最新值為 0 時為 0 */
export function streak(points: PulsePointViewModel[]): { n: number; positive: boolean } {
  const last = points.at(-1)?.value ?? 0;
  if (last === 0) return { n: 0, positive: true };
  const positive = last > 0;
  let n = 0;
  for (let i = points.length - 1; i >= 0 && (positive ? points[i]!.value > 0 : points[i]!.value < 0); i--) n++;
  return { n, positive };
}

export const trendDigits = (m: PulseTrendViewModel) => pulseDigits(m.group);

/** 名次：數字越小越好，「最高」是最小的數字 */
export const isRank = (m: PulseTrendViewModel) => m.unit === zhTW.units.rank;

/** 期間最高（名次為最好）與最低的點 */
export function extremes(m: PulseTrendViewModel): { high: PulsePointViewModel; low: PulsePointViewModel } | null {
  if (m.points.length === 0) return null;
  const sign = isRank(m) ? -1 : 1;
  const high = m.points.reduce((a, b) => (sign * b.value > sign * a.value ? b : a));
  const low = m.points.reduce((a, b) => (sign * b.value < sign * a.value ? b : a));
  return { high, low };
}

/** 跨年的月資料寫成「2025 年 10 月」、日資料「2025 年 10 月 21 日」，否則「10 月」「10/29」 */
function pointPeriod(points: PulsePointViewModel[], period: string | null): string {
  const years = new Set(points.map((p) => /^(\d{4})-\d{2}(?:-\d{2})?$/.exec(p.period ?? '')?.[1]).filter(Boolean));
  return (years.size > 1 ? periodLong(period) : periodText(period)) ?? '';
}
export const trendValue = (m: PulseTrendViewModel, v: number | null) => formatPulseValue(v, m.unit, trendDigits(m));

/** 占比變化最大的項目（最近兩期，依名稱比對）；變化不到 0.05 個百分點時為 null */
export function biggestShareShift(share: PulseShareViewModel) {
  if (share.periods.length < 2) return null;
  const [prev, last] = share.periods.slice(-2) as [PulseShareViewModel['periods'][number], PulseShareViewModel['periods'][number]];
  let best: { name: string; sharePct: number; diff: number; prevPeriod: string | null; values: number[] } | null = null;
  for (const part of last.parts) {
    const before = prev.parts.find((p) => p.name === part.name);
    if (!part.name || !before) continue;
    const diff = part.sharePct - before.sharePct;
    if (best === null || Math.abs(diff) > Math.abs(best.diff)) {
      const values = share.periods.flatMap((p) => p.parts.filter((x) => x.name === part.name).map((x) => x.sharePct));
      best = { name: part.name, sharePct: part.sharePct, diff, prevPeriod: prev.period, values };
    }
  }
  return best !== null && Math.abs(best.diff) >= 0.05 ? best : null;
}

/** 最新一期年增率最快的項目，以及衰退的項目（沒有年增率時為 null） */
export function growthLeaders(share: PulseShareViewModel) {
  const parts = (share.periods.at(-1)?.parts ?? []).filter((p) => p.growthPct !== null && p.name);
  if (parts.length === 0) return null;
  const fastest = parts.reduce((a, b) => (b.growthPct! > a.growthPct! ? b : a));
  return { fastest, declined: parts.filter((p) => p.growthPct! < 0).map((p) => p.name!) };
}

/** 年增率：1 位小數「135.8%」「-1.8%」 */
const growthText = (v: number) => formatSharePct(v);

// ───────── 數字磚 ─────────

export interface KeyNumber {
  key: string;
  label: string;
  value: string;
  /** 數字下方的小字（變化、期間） */
  note: string | null;
  coral?: boolean;
  /** 迷你線（由舊到新） */
  spark?: number[];
}

const MAX_NUMBERS = 4;

function trendTile(m: PulseTrendViewModel, coral: boolean): KeyNumber {
  const change = m.change !== null ? pulseChangeParts(m.change, m.changeUnit, trendDigits(m)) : null;
  return {
    key: m.key,
    label: orDash(m.label),
    value: trendValue(m, m.latestValue),
    note: change ? `${change.value}${change.unit ? ` ${change.unit}` : ''}${m.changeLabel ? `，${m.changeLabel}` : ''}` : periodLong(m.points.at(-1)?.period ?? null),
    coral,
    spark: m.points.length >= 2 ? m.points.map((p) => p.value) : undefined,
  };
}

function shiftTile(share: PulseShareViewModel): KeyNumber | null {
  const s = biggestShareShift(share);
  if (!s) return null;
  const change = pulseChangeParts(s.diff, 'pp', 1);
  const prev = periodText(s.prevPeriod);
  return {
    key: `${share.key}-${s.name}`,
    label: t.tile.shareOf(s.name),
    value: formatSharePct(s.sharePct),
    note: `${change.value} ${change.unit}，${prev ? t.tile.vsPeriod(prev) : t.tile.vsPrev}`,
    spark: s.values.length >= 2 ? s.values : undefined,
  };
}

/** 分頁：主要指標的最新值、變化、期間最高；再補同組其他指標與占比變化，最後是期間最低。只有占比時列最新一期前幾名 */
export function tabNumbers(list: PulseMetricViewModel[]): KeyNumber[] {
  const m = mainTrend(list);
  const out: KeyNumber[] = [];
  if (m) {
    const period = m.points.at(-1)?.period ?? null;
    out.push({ key: `${m.key}-latest`, label: orDash(m.label), value: trendValue(m, m.latestValue), note: periodLong(period), coral: true });
    if (m.change !== null) {
      const c = pulseChangeParts(m.change, m.changeUnit, trendDigits(m));
      out.push({ key: `${m.key}-change`, label: m.changeLabel ?? t.tile.vsPrev, value: c.value, note: c.unit || null });
    }
    const ext = extremes(m)!;
    const extreme = (pick: 'max' | 'min') => {
      const p = pick === 'max' ? ext.high : ext.low;
      const unit = periodUnit(p.period);
      return {
        key: `${m.key}-${pick}`,
        label: (pick === 'max' ? t.tile.high : t.tile.low)(m.points.length, unit),
        value: trendValue(m, p.value),
        note: periodLong(p.period),
      };
    };
    if (m.points.length >= 3) out.push(extreme('max'));
    for (const other of list.filter(isTrend).filter((x) => x !== m && x.latestValue !== null)) out.push(trendTile(other, false));
    for (const s of shareMetrics(list)) {
      const tile = shiftTile(s);
      if (tile) out.push(tile);
    }
    // 只有 1 期的單線（市占率）＋同組排名：名次、差距、前 5 名比最低值更有用
    out.push(...rankingTiles(list, false));
    if (m.points.length >= 3) out.push(extreme('min'));
    return out.slice(0, MAX_NUMBERS);
  }
  const ranked = rankingTiles(list, true);
  if (ranked.length > 0) return ranked.slice(0, MAX_NUMBERS);
  const share = shareMetrics(list)[0];
  const latest = share?.periods.at(-1);
  if (!share || !latest) return [];
  return [...latest.parts]
    .sort((a, b) => b.sharePct - a.sharePct)
    .slice(0, MAX_NUMBERS)
    .map((p, i) => ({
      key: `${share.key}-${p.name ?? i}`,
      label: t.tile.shareOf(orDash(p.name)),
      value: formatSharePct(p.sharePct),
      note: p.growthPct !== null ? t.tile.growth(growthText(p.growthPct)) : periodLong(latest.period),
      coral: i === 0,
    }));
}

// ───────── 一句話 ─────────

/** 主要指標圖的標題：成長動能都為正（負）時寫期數與最高（最低）；否則寫最高與最低（名次：最好與最差） */
export function trendHeading(m: PulseTrendViewModel): string | null {
  const pts = m.points;
  if (pts.length < 2) return null;
  const { high, low } = extremes(m)!;
  const unit = periodUnit(pts.at(-1)!.period);
  const p = (x: PulsePointViewModel) => pointPeriod(pts, x.period);
  if (signMatters(m) && pts.every((x) => x.value > 0)) return t.heading.allPositive(pts.length, unit, p(high), trendValue(m, high.value));
  if (signMatters(m) && pts.every((x) => x.value < 0)) return t.heading.allNegative(pts.length, unit, p(low), trendValue(m, low.value));
  return t.heading.highLow(p(high), trendValue(m, high.value), p(low), trendValue(m, low.value));
}

/** 主要指標以外、有 2 期以上的月資料單線（例：成長動能的新契約保費金額），各畫一張直條圖 */
export function extraMonthlyTrends(list: PulseMetricViewModel[]): PulseTrendViewModel[] {
  const main = mainTrend(list);
  return list
    .filter(isTrend)
    .filter((m) => m !== main && m.points.length >= 2 && /^\d{4}-\d{2}$/.test(m.points.at(-1)!.period ?? '') && !isRank(m));
}

/** 金額圖的標題：有去年同月時「8 月新契約保費 1,245.9 億元，比去年同期 +68.5%」，否則同 trendHeading */
export function amountHeading(m: PulseTrendViewModel): string | null {
  const last = m.points.at(-1);
  const ym = /^(\d{4})-(\d{2})$/.exec(last?.period ?? '');
  if (!last || !ym || !m.label) return trendHeading(m);
  const before = m.points.find((p) => p.period === `${+ym[1]! - 1}-${ym[2]}`);
  if (!before || before.value === 0) return trendHeading(m);
  const yoy = (last.value / before.value - 1) * 100;
  return t.heading.amountYoy(zhTW.insights.lead(periodText(last.period), m.label), trendValue(m, last.value), `${yoy > 0 ? '+' : ''}${formatSharePct(yoy)}`);
}

/** 細節的占比段落標題：年增最快的項目＋（同一項目時）占比比上期多或少幾個百分點 */
export function shareDetailHeading(share: PulseShareViewModel): string {
  const lead = growthLeaders(share);
  if (!lead) return t.heading.shareDetail;
  const shift = biggestShareShift(share);
  const tail =
    shift && shift.name === lead.fastest.name
      ? t.heading.shiftTail(shift.diff > 0, formatSharePct(Math.abs(shift.diff)).replace('%', ''))
      : '';
  return zhTW.insights.fastest(lead.fastest.name!, growthText(lead.fastest.growthPct!)) + tail;
}
