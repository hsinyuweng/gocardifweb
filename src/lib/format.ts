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
