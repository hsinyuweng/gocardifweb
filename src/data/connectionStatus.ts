// api 模式的連線狀態：記錄最近一次讀取是否改用了離線資料（第 6.3 節 fallbackToStatic）
// 以簡單的訂閱方式提供給 pages/RootLayout（useSyncExternalStore）。

let offline = false;
const listeners = new Set<() => void>();

export function setOffline(value: boolean): void {
  if (offline === value) return;
  offline = value;
  listeners.forEach((l) => l());
}

export function isOffline(): boolean {
  return offline;
}

export function subscribeConnection(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
