import type { OverviewRow } from '../types/viewModel';

// 已審閱紀錄（競品研究，2026-10-20 經確認）：打開報告頁且成功顯示時記下該報告的產出日期，存在瀏覽器。
// 報告重新產出（日期改變）後視為未審閱。localStorage 可能被停用，讀寫皆以 try/catch 包住。

/** report_id → 審閱時的產出日期（缺漏時為空字串） */
export type ReviewedMap = Readonly<Record<string, string>>;

const KEY = 'gocardifweb.reviewed';
const EMPTY: ReviewedMap = {};
const listeners = new Set<() => void>();

// useSyncExternalStore 需要相同內容回傳同一個物件
let cachedRaw: string | null = null;
let cachedMap: ReviewedMap = EMPTY;

export function readReviewed(): ReviewedMap {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cachedRaw) return cachedMap;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw === null ? {} : JSON.parse(raw);
    cachedMap =
      typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
        ? Object.fromEntries(Object.entries(parsed).filter(([, v]) => typeof v === 'string'))
        : EMPTY;
  } catch {
    cachedMap = EMPTY;
  }
  return cachedMap;
}

export function markReviewed(reportId: string, generatedDate: string | null): void {
  const date = generatedDate ?? '';
  const map = readReviewed();
  if (map[reportId] === date) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...map, [reportId]: date }));
  } catch {
    // 無法寫入時忽略
  }
  listeners.forEach((l) => l());
}

/** 缺 report_id 的列無法打開，不算未審閱 */
export function isUnreviewed(row: OverviewRow, map: ReviewedMap): boolean {
  return row.reportId !== null && map[row.reportId] !== (row.generatedDate ?? '');
}

/** 給 useSyncExternalStore 使用；其他分頁修改時也會通知 */
export function subscribeReviewed(listener: () => void): () => void {
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
