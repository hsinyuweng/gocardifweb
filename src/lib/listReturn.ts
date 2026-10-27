// 清單 ↔ 報告頁來回切換（2026-10-27 V3）：記住離開清單時的捲動位置，與最後看的報告（回清單時標亮那一列）。
// 存在 sessionStorage（只在這個分頁內有效）；讀寫失敗時當作沒有，不影響功能。

const SCROLL_KEY = 'gocardifweb.listScroll';
const LAST_KEY = 'gocardifweb.lastReport';

function read(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    // 無法存時忽略
  }
}

/** 離開清單前記住捲動位置（path 含查詢字串，篩選不同時不套用） */
export function saveListScroll(path: string, scrollY: number) {
  write(SCROLL_KEY, JSON.stringify({ path, scrollY }));
}

/** 取出並清除該清單的捲動位置；不是同一個清單時為 null */
export function takeListScroll(path: string): number | null {
  const raw = read(SCROLL_KEY);
  if (raw === null) return null;
  try {
    const v = JSON.parse(raw) as { path?: unknown; scrollY?: unknown };
    if (v.path !== path || typeof v.scrollY !== 'number') return null;
    write(SCROLL_KEY, null);
    return v.scrollY;
  } catch {
    return null;
  }
}

/** 報告頁顯示時記下最後看的報告 */
export function setLastReport(reportId: string) {
  write(LAST_KEY, reportId);
}

export function readLastReport(): string | null {
  return read(LAST_KEY);
}

/** 報告頁「上一份／下一份」的順序：由清單帶入 location.state.order（報告 id 陣列） */
export function readOrder(state: unknown): string[] | null {
  const order = (state as { order?: unknown } | null)?.order;
  return Array.isArray(order) && order.every((x) => typeof x === 'string') ? (order as string[]) : null;
}
