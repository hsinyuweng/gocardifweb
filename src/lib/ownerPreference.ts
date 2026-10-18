// D7（2026-10-18 經確認調整）：記住使用者設定的「我的單位」，作為報告頁與我的待辦的預設負責單位。
// 只在導覽列「設定／更改」時寫入；頁面上的下拉切換只改網址，不改這裡。
// localStorage 可能被停用，讀寫皆以 try/catch 包住。沿用原本的 key，舊的記錄可繼續使用。

const KEY = 'gocardifweb.owner';

const listeners = new Set<() => void>();

export function readOwnerPreference(): string | null {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === null || v === '' ? null : v;
  } catch {
    return null;
  }
}

/** null 表示未設定，移除記錄 */
export function writeOwnerPreference(owner: string | null): void {
  try {
    if (owner === null) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, owner);
  } catch {
    // 無法寫入時忽略，篩選仍以網址為準
  }
  listeners.forEach((l) => l());
}

/** 給 useSyncExternalStore 使用；其他分頁修改時也會通知 */
export function subscribeOwnerPreference(listener: () => void): () => void {
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
