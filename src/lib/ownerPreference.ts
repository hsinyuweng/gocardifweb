// D7：記住使用者上次選擇的負責單位。localStorage 可能被停用，讀寫皆以 try/catch 包住。

const KEY = 'gocardifweb.owner';

export function readOwnerPreference(): string | null {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === null || v === '' ? null : v;
  } catch {
    return null;
  }
}

/** null 表示「全部」，移除記錄 */
export function writeOwnerPreference(owner: string | null): void {
  try {
    if (owner === null) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, owner);
  } catch {
    // 無法寫入時忽略，篩選仍以網址為準
  }
}
