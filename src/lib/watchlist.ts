// 追蹤清單（2026-10-20 新規劃）：候選商品的 report_id，依加入順序存在瀏覽器。
// localStorage 可能被停用，讀寫皆以 try/catch 包住；讀不到時視為空清單。

const KEY = 'gocardifweb.candidates';
/** 舊版「險種＋市場」追蹤清單（已停用，2026-10-20 經確認），載入時清除 */
const LEGACY_KEY = 'gocardifweb.watchlist';
try {
  window.localStorage.removeItem(LEGACY_KEY);
} catch {
  // 無法存取時忽略
}

const EMPTY: readonly string[] = [];
const listeners = new Set<() => void>();

// useSyncExternalStore 需要相同內容回傳同一個陣列
let cachedRaw: string | null = null;
let cachedIds: readonly string[] = EMPTY;

export function readWatchlist(): readonly string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cachedRaw) return cachedIds;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw === null ? [] : JSON.parse(raw);
    cachedIds = Array.isArray(parsed)
      ? [...new Set(parsed.filter((v): v is string => typeof v === 'string' && v !== ''))]
      : EMPTY;
  } catch {
    cachedIds = EMPTY;
  }
  return cachedIds;
}

function writeWatchlist(ids: readonly string[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // 無法寫入時忽略
  }
  listeners.forEach((l) => l());
}

/** index 有值時插回原位置（復原移出用），否則加在最後 */
export function addToWatchlist(reportId: string, index?: number): void {
  const ids = readWatchlist();
  if (ids.includes(reportId)) return;
  const next = [...ids];
  next.splice(index ?? next.length, 0, reportId);
  writeWatchlist(next);
}

export function removeFromWatchlist(reportId: string): void {
  writeWatchlist(readWatchlist().filter((id) => id !== reportId));
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
