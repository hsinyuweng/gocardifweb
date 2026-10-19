import type { OverviewRow, SignalColor, SignalText } from '../types/viewModel';

// 追蹤清單綜合分數（2026-10-20 經確認）：後端尚未提供數值分數，暫用三面向燈號換算。
// 綜合分數 ＝ Σ(分數 × 權重) ÷ Σ 權重；無資料（灰燈、缺漏）或權重為 0 的維度不計入。

export type DimensionKey = 'feasibility' | 'profitability' | 'saturation' | 'brandFit';

/** 顯示與滑桿順序 */
export const DIMENSIONS: readonly DimensionKey[] = ['feasibility', 'profitability', 'saturation', 'brandFit'];

export type Weights = Readonly<Record<DimensionKey, number>>;

export const DEFAULT_WEIGHTS: Weights = { feasibility: 3, profitability: 3, saturation: 3, brandFit: 0 };
export const MAX_WEIGHT = 5;

const SIGNAL_SCORE: Partial<Record<SignalColor, number>> = { green: 100, yellow: 67, orange: 33, red: 0 };

/** 各維度依據的燈號：可行性＝法規、獲利性＝發生率暨獲利、市場飽和度＝市場需求；品牌／通路契合度尚無資料 */
function basisSignal(row: OverviewRow, key: DimensionKey): SignalText | null {
  if (key === 'feasibility') return row.regulatory;
  if (key === 'profitability') return row.actuarial;
  if (key === 'saturation') return row.marketDemand;
  return null;
}

export interface DimensionScore {
  key: DimensionKey;
  /** 依據的燈號；null 表示此維度尚無資料 */
  signal: SignalText | null;
  /** null 表示無資料，不計入 */
  score: number | null;
  weight: number;
}

export interface CandidateScore {
  dims: DimensionScore[];
  /** 可計算的權重全為 0 或全無資料時為 null */
  total: number | null;
}

export function scoreRow(row: OverviewRow, weights: Weights): CandidateScore {
  const dims = DIMENSIONS.map((key) => {
    const signal = basisSignal(row, key);
    return { key, signal, score: signal ? (SIGNAL_SCORE[signal.color] ?? null) : null, weight: weights[key] };
  });
  const counted = dims.filter((d) => d.score !== null && d.weight > 0);
  const sumW = counted.reduce((s, d) => s + d.weight, 0);
  const total = sumW > 0 ? Math.round(counted.reduce((s, d) => s + d.score! * d.weight, 0) / sumW) : null;
  return { dims, total };
}

/** 計算過程文字，例如「(67×3 + 0×3 + 100×3) ÷ 9 ＝ 56」；無法計算時為 null */
export function formulaText(score: CandidateScore): string | null {
  const counted = score.dims.filter((d) => d.score !== null && d.weight > 0);
  if (score.total === null || counted.length === 0) return null;
  const sumW = counted.reduce((s, d) => s + d.weight, 0);
  return `(${counted.map((d) => `${d.score}×${d.weight}`).join(' + ')}) ÷ ${sumW} ＝ ${score.total}`;
}

export interface Candidate {
  row: OverviewRow;
  score: CandidateScore;
}

export interface CandidateList {
  /** 依綜合分數高到低；同分依商品名稱；無法計算的排最後 */
  ranked: Candidate[];
  /** 報告清單中找不到的 report_id */
  missing: string[];
}

export function buildCandidates(ids: readonly string[], rows: OverviewRow[], weights: Weights): CandidateList {
  const byId = new Map(rows.flatMap((r) => (r.reportId ? [[r.reportId, r] as const] : [])));
  const ranked: Candidate[] = [];
  const missing: string[] = [];
  for (const id of ids) {
    const row = byId.get(id);
    if (row) ranked.push({ row, score: scoreRow(row, weights) });
    else missing.push(id);
  }
  ranked.sort((a, b) => {
    const ta = a.score.total;
    const tb = b.score.total;
    if (ta !== tb) {
      if (ta === null) return 1;
      if (tb === null) return -1;
      return tb - ta;
    }
    return (a.row.name ?? '').localeCompare(b.row.name ?? '', 'zh-Hant-TW');
  });
  return { ranked, missing };
}
