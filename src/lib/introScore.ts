import type { IntroScore, OverviewRow } from '../types/viewModel';

// 引進分數（2026-11-01 使用者回饋第二輪：「有分數我就不用判斷」）。0–100，跟整體建議一致：
// 建議 50（推進 50、暫緩／未完成 20、不建議 0）＋阻斷 25（0 項 25，每項扣 5，最低 0）＋潛在市場 25（除以清單裡最大的）。
// 只用報告清單的欄位；後端之後若提供正式分數，改讀後端的。

export const SCORE_PARTS = { rec: 50, blocking: 25, market: 25 } as const;
export const BLOCKING_STEP = 5;

const REC_POINTS: Record<string, number> = {
  go: 50,
  conditional_go: 50,
  hold_missing_info: 20,
  hold_resolve_red_flag: 20,
  incomplete_review: 20,
  not_recommended: 0,
};

const blocking = (r: OverviewRow) => r.blockerCounts.critical + r.blockerCounts.blocking;
const market = (r: OverviewRow) => r.dimensionScores?.marketSize?.value ?? null;

/** 依整份清單算每列的分數（潛在市場要和清單裡最大的比） */
export function withIntroScores(rows: OverviewRow[]): OverviewRow[] {
  const max = Math.max(0, ...rows.map((r) => market(r) ?? 0));
  return rows.map((r) => ({ ...r, score: introScore(r, max) }));
}

function introScore(r: OverviewRow, maxMarket: number): IntroScore | null {
  const rec = r.recommendationKey !== null ? REC_POINTS[r.recommendationKey] : undefined;
  if (rec === undefined) return null;
  const b = Math.max(0, SCORE_PARTS.blocking - BLOCKING_STEP * blocking(r));
  const m = maxMarket > 0 ? (SCORE_PARTS.market * (market(r) ?? 0)) / maxMarket : 0;
  return { total: Math.round(rec + b + m), rec, blocking: b, market: Math.round(m) };
}

/** 排序用：沒有分數的排最後 */
export const scoreOf = (r: OverviewRow) => r.score?.total ?? -1;
