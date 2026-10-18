import type { OverviewRow } from '../types/viewModel';
import { zhTW } from '../i18n/zh-TW';
import { countryLabel } from './country';
import { DEFAULT_FILTERS, DEFAULT_SORT_DIR, writeOverviewParams } from './overviewFilter';

// 我的追蹤清單（市場總覽，2026-10-18 經確認）：追蹤「險種＋市場」，存在瀏覽器。
// localStorage 可能被停用，讀寫皆以 try/catch 包住；讀不到時視為空清單。

/** null 表示「全部」；兩者不會同時為 null */
export interface WatchItem {
  category: string | null;
  country: string | null;
}

const KEY = 'gocardifweb.watchlist';
const EMPTY: WatchItem[] = [];
const listeners = new Set<() => void>();

// useSyncExternalStore 需要相同內容回傳同一個物件
let cachedRaw: string | null = null;
let cachedItems: WatchItem[] = EMPTY;

function isWatchItem(v: unknown): v is WatchItem {
  if (typeof v !== 'object' || v === null) return false;
  const { category, country } = v as Record<string, unknown>;
  const ok = (x: unknown) => x === null || (typeof x === 'string' && x !== '');
  return ok(category) && ok(country) && !(category === null && country === null);
}

export function readWatchlist(): WatchItem[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cachedRaw) return cachedItems;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw === null ? [] : JSON.parse(raw);
    cachedItems = Array.isArray(parsed) ? parsed.filter(isWatchItem) : EMPTY;
  } catch {
    cachedItems = EMPTY;
  }
  return cachedItems;
}

function writeWatchlist(items: WatchItem[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // 無法寫入時忽略
  }
  listeners.forEach((l) => l());
}

export function sameWatchItem(a: WatchItem, b: WatchItem): boolean {
  return a.category === b.category && a.country === b.country;
}

export function addWatchItem(item: WatchItem): void {
  const items = readWatchlist();
  if (!items.some((i) => sameWatchItem(i, item))) writeWatchlist([...items, item]);
}

export function removeWatchItem(item: WatchItem): void {
  writeWatchlist(readWatchlist().filter((i) => !sameWatchItem(i, item)));
}

/** 給 useSyncExternalStore 使用；其他分頁修改時也會通知 */
export function subscribeWatchlist(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function watchItemLabel(item: WatchItem): string {
  const t = zhTW.watchlist;
  return t.itemLabel(item.category ?? t.allCategories, countryLabel(item.country) ?? t.allCountries);
}

/** 連到案件總覽並帶好篩選 */
export function watchItemCasesPath(item: WatchItem): string {
  const params = writeOverviewParams({
    filters: { ...DEFAULT_FILTERS, category: item.category ?? '', country: item.country ?? '' },
    sortKey: 'generatedDate',
    sortDir: DEFAULT_SORT_DIR.generatedDate,
  });
  const qs = params.toString();
  return qs ? `/cases?${qs}` : '/cases';
}

export interface WatchMatch {
  count: number;
  /** 相符報告中最新的產出日期（YYYY-MM-DD）；沒有相符時為 null */
  latestDate: string | null;
}

export function matchWatchItem(item: WatchItem, rows: OverviewRow[]): WatchMatch {
  const matched = rows.filter(
    (r) =>
      (item.category === null || r.category === item.category) &&
      (item.country === null || r.countryCode === item.country),
  );
  const dates = matched.map((r) => r.generatedDate).filter((d): d is string => d !== null);
  return { count: matched.length, latestDate: dates.length > 0 ? dates.sort().at(-1)! : null };
}
