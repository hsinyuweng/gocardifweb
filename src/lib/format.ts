import { zhTW } from '../i18n/zh-TW';

/** null、undefined、空字串 → 「—」（第 0 節第 9 點） */
export function orDash(value: string | number | null | undefined): string {
  if (value == null || value === '') return zhTW.common.dash;
  return String(value);
}

/** 千分位整數 */
export function formatInteger(value: number): string {
  return new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 0 }).format(value);
}

/** 千分位原數字（保留小數） */
function formatRaw(value: number): string {
  return new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 20 }).format(value);
}

/** 第 9.3 節：target_population 千分位加「人」 */
export function formatPopulation(value: number | null): string | null {
  return value === null ? null : `${formatInteger(value)} ${zhTW.units.person}`;
}

/**
 * 第 9.3 節：estimate_*
 * reported_unit 為「新台幣元」→ 除以 1 億、四捨五入至整數、千分位加「億元」；
 * 其他單位 → 千分位原數字加 reported_unit 原文。
 */
export function formatMarketEstimate(value: number | null, unit: string | null): string | null {
  if (value === null) return null;
  if (unit === zhTW.units.ntd) return `${formatInteger(Math.round(value / 100_000_000))} ${zhTW.units.hundredMillion}`;
  return unit ? `${formatRaw(value)} ${unit}` : formatRaw(value);
}

/** 追蹤清單計分數值（S10）：「%」直接接在數字後；其他同 formatMarketEstimate */
export function formatScoreValue(value: number | null, unit: string | null): string | null {
  if (value !== null && unit === '%') return `${formatRaw(value)}%`;
  return formatMarketEstimate(value, unit);
}

const TAIPEI_PARTS = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Taipei',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** ISO 8601 → 台北時間「YYYY-MM-DD HH:mm」；無法解析時回傳原文 */
export function formatDateTimeTaipei(iso: string | null | undefined): string | null {
  if (iso == null || iso === '') return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const parts = Object.fromEntries(TAIPEI_PARTS.formatToParts(date).map((p) => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
}

const TAIPEI_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Taipei',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** 台北時間的今天（YYYY-MM-DD） */
export function todayTaipei(now: Date = new Date()): string {
  return TAIPEI_DATE.format(now);
}

/**
 * 「YYYY-MM-DD」距今天幾天（台北時間）；格式不對時回傳 null。
 * 未來的日期視為 0（今天）。
 */
export function daysAgo(date: string, now: Date = new Date()): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const t = /^(\d{4})-(\d{2})-(\d{2})$/.exec(todayTaipei(now));
  if (!m || !t) return null;
  const d = Date.UTC(+m[1]!, +m[2]! - 1, +m[3]!);
  const today = Date.UTC(+t[1]!, +t[2]! - 1, +t[3]!);
  return Math.max(0, Math.round((today - d) / 86_400_000));
}

/**
 * 動態的相對時間：有時間的顯示「N 分鐘前」「N 小時前」，超過一天或只有日期的顯示「今天」「昨天」「N 天前」；
 * 超過 30 天顯示日期；無法解析時顯示原文。未來的時間視為剛發布。
 */
export function relativeTimeText(time: number | null, dateOnly: boolean, raw: string | null, now: Date = new Date()): string {
  if (time === null) return orDash(raw);
  const t = zhTW.time;
  const diff = now.getTime() - time;
  if (!dateOnly && diff < 3_600_000) return t.minutesAgo(Math.max(1, Math.floor(diff / 60_000)));
  if (!dateOnly && diff < 86_400_000) return t.hoursAgo(Math.floor(diff / 3_600_000));
  const date = todayTaipei(new Date(time));
  const n = daysAgo(date, now);
  if (n === null || n > 30) return date;
  if (n === 0) return t.today;
  if (n === 1) return t.yesterday;
  return t.daysAgo(n);
}

/** 固定小數位；先四捨五入（加極小值，避免 41.15 這類浮點數被捨成 41.1） */
function fixed(value: number, digits: number): string {
  const f = 10 ** digits;
  const rounded = (Math.sign(value) * Math.round(Math.abs(value) * f + 1e-9)) / f;
  return new Intl.NumberFormat('zh-TW', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(rounded);
}

/**
 * 市場脈動的變化，拆成數字與單位（數字磚用）：{ value: '▼ 41.2', unit: '個百分點' }、{ value: '▲ 3.2%', unit: '' }。
 * 百分比 1 位小數；百分點跟著指標的小數位（digits，見 lib/pulse.ts 的 pulseDigits），沒給時最多 2 位並去掉多餘的 0。
 * 四捨五入後為 0 時 value 為「— 0」；null 時為「—」。
 */
export function pulseChangeParts(change: number | null, unit: 'pct' | 'pp' = 'pct', digits?: number): { value: string; unit: string } {
  const t = zhTW.market.change;
  const unitText = unit === 'pp' ? t.ppUnit : '';
  if (change === null) return { value: zhTW.common.dash, unit: '' };
  const d = unit === 'pp' ? (digits ?? 2) : 1;
  const pctSuffix = unit === 'pct' ? '%' : '';
  if (Math.abs(change) + 1e-9 < 0.5 * 10 ** -d) return { value: `${t.flat}${pctSuffix}`, unit: unitText };
  const abs =
    unit === 'pp' && digits === undefined
      ? new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 2 }).format(Math.abs(change))
      : fixed(Math.abs(change), d);
  return { value: `${change > 0 ? t.up : t.down} ${abs}${pctSuffix}`, unit: unitText };
}

/** 市場脈動的變化一整句：「▲ 3.2%」「▼ 41.2 個百分點」「— 0 個百分點」；null 顯示「—」 */
export function pulseChangeText(change: number | null, unit: 'pct' | 'pp' = 'pct', digits?: number): string {
  const p = pulseChangeParts(change, unit, digits);
  return p.unit ? `${p.value} ${p.unit}` : p.value;
}

/** 有效位數：整數部分 ≥ 100 不留小數，≥ 10 留 1 位，其餘留 2 位（去掉多餘的 0） */
function compact(value: number): string {
  const abs = Math.abs(value);
  const digits = abs >= 100 ? 0 : abs >= 10 ? 1 : 2;
  return new Intl.NumberFormat('zh-TW', { maximumFractionDigits: digits }).format(value);
}

/** 占比：固定 1 位小數「8.0%」 */
export function formatSharePct(value: number): string {
  return `${fixed(value, 1)}%`;
}

/**
 * 圖表 y 軸刻度：新台幣元同 formatPulseValue；%「50%」（不補小數）；名次只標整數；其他單位只顯示數字
 */
export function formatPulseTick(value: number, unit: string | null): string {
  const u = zhTW.units;
  if (unit === u.ntd) return formatPulseValue(value, unit);
  if (unit === '%') return `${compact(value)}%`;
  if (unit === u.rank) return Number.isInteger(value) ? formatInteger(value) : '';
  return compact(value);
}

/**
 * 市場脈動的數值：
 * 新台幣元 → 1 億以上「418 億元」、1 萬以上「9,600 萬元」、其餘「500 元」（可為負數）；
 * % → 固定 digits 位小數（預設 2；依指標組別見 lib/pulse.ts 的 pulseDigits）「68.5%」「2.00%」；
 * 萬分比 →「0.19（每萬件簽單）」；名 →「第 18 名」；其他單位 → 數字＋單位原文；沒有單位只顯示數字。
 */
export function formatPulseValue(value: number | null, unit: string | null, digits = 2): string {
  const u = zhTW.units;
  if (value === null) return zhTW.common.dash;
  if (unit === u.ntd) {
    const abs = Math.abs(value);
    if (abs >= 100_000_000) return `${compact(value / 100_000_000)} ${u.hundredMillion}`;
    if (abs >= 10_000) return `${compact(value / 10_000)} ${u.tenThousandNtd}`;
    return `${compact(value)} ${u.ntdShort}`;
  }
  if (unit === '%') return `${fixed(value, digits)}%`;
  if (unit === u.perTenThousand) return zhTW.market.perTenThousand(compact(value));
  if (unit === u.rank) return zhTW.market.rank(formatInteger(value));
  return unit ? `${compact(value)} ${unit}` : compact(value);
}

/** ISO 週「2026-W43」→ 該週星期一「10/19」；不是週格式時為 null */
function weekMonday(period: string): string | null {
  const m = /^(\d{4})-W(\d{2})$/.exec(period);
  if (!m) return null;
  // ISO 週：1 月 4 日所在的那週是第 1 週
  const jan4 = new Date(Date.UTC(+m[1]!, 0, 4));
  const monday = new Date(jan4.getTime() + ((+m[2]! - 1) * 7 - ((jan4.getUTCDay() + 6) % 7)) * 86_400_000);
  return `${monday.getUTCMonth() + 1}/${monday.getUTCDate()}`;
}

/** 市場脈動的期間：週「2026-W43」→ 該週星期一「10/19 當週」；其他照原文 */
export function formatPulsePeriod(period: string): string {
  const md = weekMonday(period);
  return md === null ? period : zhTW.market.weekOf(md);
}

/**
 * 直條圖 x 軸的短期間：月「2026-08」→「8月」（跨年時每年第一個寫「26/1」）；週 →「10/19」；其他照原文。
 */
export function shortPeriodLabels(periods: (string | null)[]): string[] {
  const years = new Set(periods.map((p) => /^(\d{4})-\d{2}$/.exec(p ?? '')?.[1]).filter(Boolean));
  let lastYear: string | null = null;
  return periods.map((p) => {
    if (p === null) return '';
    const m = /^(\d{4})-(\d{2})$/.exec(p);
    if (m) {
      const label = years.size > 1 && m[1] !== lastYear ? `${m[1]!.slice(2)}/${+m[2]!}` : zhTW.market.monthShort(+m[2]!);
      lastYear = m[1]!;
      return label;
    }
    return weekMonday(p) ?? p;
  });
}
