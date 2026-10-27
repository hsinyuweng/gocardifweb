import type { Weights } from './score';

// 追蹤清單「看重」預設（2026-10-27 V4，取代原本的權重拉桿）：存在瀏覽器，進報告頁再回來時不變。
// localStorage 可能被停用，讀寫皆以 try/catch 包住；讀不到時用「平均」。

export type WeightPreset = 'balanced' | 'regulatory' | 'market';

export const PRESETS: readonly WeightPreset[] = ['balanced', 'regulatory', 'market'];

/** 各預設的權重；品牌／通路契合度有資料時才會計入 */
export const PRESET_WEIGHTS: Record<WeightPreset, Weights> = {
  balanced: { feasibility: 1, marketSize: 1, marketGrowth: 1, brandFit: 1 },
  regulatory: { feasibility: 3, marketSize: 1, marketGrowth: 1, brandFit: 1 },
  market: { feasibility: 1, marketSize: 2, marketGrowth: 2, brandFit: 1 },
};

const KEY = 'gocardifweb.weightPreset';
/** 拉桿時代的權重，載入時刪除 */
const OLD_KEY = 'gocardifweb.weights';
const listeners = new Set<() => void>();

export function readPreset(): WeightPreset {
  try {
    window.localStorage.removeItem(OLD_KEY);
    const raw = window.localStorage.getItem(KEY);
    return PRESETS.includes(raw as WeightPreset) ? (raw as WeightPreset) : 'balanced';
  } catch {
    return 'balanced';
  }
}

export function setPreset(preset: WeightPreset): void {
  try {
    window.localStorage.setItem(KEY, preset);
  } catch {
    // 無法寫入時忽略
  }
  listeners.forEach((l) => l());
}

/** 給 useSyncExternalStore 使用；其他分頁修改時也會通知 */
export function subscribePreset(listener: () => void): () => void {
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
