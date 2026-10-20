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

function fixed(value: number, digits: number): string {
  return new Intl.NumberFormat('zh-TW', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);
}

/**
 * 市場脈動的變化：百分比「▲ 3.2%」（1 位小數）、百分點「▲ 0.05 個百分點」（2 位小數）；
 * 四捨五入後為 0 顯示「— 0%」「— 0 個百分點」；null 顯示「—」
 */
export function pulseChangeText(change: number | null, unit: 'pct' | 'pp' = 'pct'): string {
  const t = zhTW.market.change;
  if (change === null) return zhTW.common.dash;
  const digits = unit === 'pp' ? 2 : 1;
  if (Math.abs(change) < 0.5 * 10 ** -digits) return unit === 'pp' ? t.flatPp : t.flatPct;
  // 百分點去掉多餘的 0（1.5、0.05）；百分比固定 1 位（3.2、8.0）
  const abs =
    unit === 'pp'
      ? new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 2 }).format(Math.abs(change))
      : fixed(Math.abs(change), digits);
  if (unit === 'pp') return change > 0 ? t.upPp(abs) : t.downPp(abs);
  return change > 0 ? t.upPct(abs) : t.downPct(abs);
}

/** 有效位數：整數部分 ≥ 100 不留小數，≥ 10 留 1 位，其餘留 2 位（去掉多餘的 0） */
function compact(value: number): string {
  const abs = Math.abs(value);
  const digits = abs >= 100 ? 0 : abs >= 10 ? 1 : 2;
  return new Intl.NumberFormat('zh-TW', { maximumFractionDigits: digits }).format(value);
}

/**
/** 占比：固定 1 位小數「8.0%」 */
export function formatSharePct(value: number): string {
  return `${fixed(value, 1)}%`;
}

/**
 * 圖表 y 軸刻度：% 與新台幣元同 formatPulseValue，其他單位只顯示數字（單位已在圖例或數值上）
 */
export function formatPulseTick(value: number, unit: string | null): string {
  if (unit === '%' || unit === zhTW.units.ntd) return formatPulseValue(value, unit);
  return compact(value);
}

/**
 * 市場脈動的數值：
 * 新台幣元 → 1 億以上「418 億元」、1 萬以上「9,600 萬元」、其餘「500 元」；
 * % → 「1.72%」；其他單位 → 數字＋單位原文；沒有單位只顯示數字。
 */
export function formatPulseValue(value: number | null, unit: string | null): string {
  const u = zhTW.units;
  if (value === null) return zhTW.common.dash;
  if (unit === u.ntd) {
    const abs = Math.abs(value);
    if (abs >= 100_000_000) return `${compact(value / 100_000_000)} ${u.hundredMillion}`;
    if (abs >= 10_000) return `${compact(value / 10_000)} ${u.tenThousandNtd}`;
    return `${compact(value)} ${u.ntdShort}`;
  }
  if (unit === '%') return `${compact(value)}%`;
  return unit ? `${compact(value)} ${unit}` : compact(value);
}
