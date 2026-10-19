import { DEFAULT_WEIGHTS, DIMENSIONS, MAX_WEIGHT, type DimensionKey, type Weights } from './score';

// 追蹤清單權重（2026-10-20 經確認）：存在瀏覽器，進報告頁再回來時不變。
// localStorage 可能被停用，讀寫皆以 try/catch 包住；讀不到時用預設值。

const KEY = 'gocardifweb.weights';
const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedWeights: Weights = DEFAULT_WEIGHTS;

function clampWeight(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= MAX_WEIGHT ? v : fallback;
}

export function readWeights(): Weights {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return DEFAULT_WEIGHTS;
  }
  if (raw === cachedRaw) return cachedWeights;
  cachedRaw = raw;
  try {
    const parsed = (raw === null ? {} : JSON.parse(raw)) as Partial<Record<DimensionKey, unknown>> | null;
    cachedWeights =
      raw === null || typeof parsed !== 'object' || parsed === null
        ? DEFAULT_WEIGHTS
        : (Object.fromEntries(DIMENSIONS.map((k) => [k, clampWeight(parsed[k], DEFAULT_WEIGHTS[k])])) as Weights);
  } catch {
    cachedWeights = DEFAULT_WEIGHTS;
  }
  return cachedWeights;
}

function writeWeights(weights: Weights | null): void {
  try {
    if (weights === null) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, JSON.stringify(weights));
  } catch {
    // 無法寫入時忽略
  }
  listeners.forEach((l) => l());
}

export function setWeight(key: DimensionKey, value: number): void {
  writeWeights({ ...readWeights(), [key]: clampWeight(value, DEFAULT_WEIGHTS[key]) });
}

export function resetWeights(): void {
  writeWeights(null);
}

/** 給 useSyncExternalStore 使用；其他分頁修改時也會通知 */
export function subscribeWeights(listener: () => void): () => void {
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
