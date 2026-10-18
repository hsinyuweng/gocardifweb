// 報告頁與我的待辦共用的負責單位網址參數規則
// - ?owner=<單位>：指定單位
// - ?owner=（空值）：明確選「全部」，不套用「我的單位」
// - 沒有 owner 參數：套用「我的單位」

export const OWNER_PARAM = 'owner';

/** 回傳想要的單位；null 表示全部 */
export function requestedOwner(urlOwner: string | null, myUnit: string | null): string | null {
  if (urlOwner === null) return myUnit;
  return urlOwner === '' ? null : urlOwner;
}

/** 寫入網址的值：全部寫成空值，避免重新整理後又套用「我的單位」 */
export function ownerParamValue(owner: string | null): string {
  return owner ?? '';
}

/** 來源頁面（location.state.from）；只接受站內路徑 */
export function readFromPath(state: unknown): string | null {
  const from = (state as { from?: unknown } | null)?.from;
  return typeof from === 'string' && from.startsWith('/') ? from : null;
}

/** 來源頁面本身的 location.state（fromState），返回時一併帶回 */
export function readFromState(state: unknown): unknown {
  return (state as { fromState?: unknown } | null)?.fromState ?? null;
}
