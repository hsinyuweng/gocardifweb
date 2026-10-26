import type { BackendDimensionScore, DimensionKey, OverviewRow, SignalColor, SignalText } from '../types/viewModel';

// 追蹤清單綜合分數（2026-10-20 經確認；2026-10-26 改為法規可行性、市場規模、市場成長）：
// 報告有後端數值分數（dimension_scores，後端需求 S10）的維度用它；沒有時只有法規可行性用法規燈號換算，
// 市場規模、市場成長沒有對應燈號，視為無資料。
// 綜合分數 ＝ Σ(分數 × 權重) ÷ Σ 權重；無資料（灰燈、缺漏、後端標 null）或權重為 0 的維度不計入。

export type { DimensionKey };

/** 顯示與滑桿順序 */
export const DIMENSIONS: readonly DimensionKey[] = ['feasibility', 'marketSize', 'marketGrowth', 'brandFit'];

export type Weights = Readonly<Record<DimensionKey, number>>;

export const DEFAULT_WEIGHTS: Weights = { feasibility: 3, marketSize: 3, marketGrowth: 3, brandFit: 0 };
export const MAX_WEIGHT = 5;

const SIGNAL_SCORE: Partial<Record<SignalColor, number>> = { green: 100, yellow: 67, orange: 33, red: 0 };

/** 只有法規可行性有對應燈號（法規） */
function basisSignal(row: OverviewRow, key: DimensionKey): SignalText | null {
  return key === 'feasibility' ? row.regulatory : null;
}

export interface DimensionScore {
  key: DimensionKey;
  /** 依據的燈號；null 表示此維度沒有燈號 */
  signal: SignalText | null;
  /** null 表示無資料，不計入 */
  score: number | null;
  /** backend：後端數值分數；signal：燈號換算；null：無資料 */
  scoreSource: 'backend' | 'signal' | null;
  /** 後端分數的級數、說明、可信度、原始數值與來源；燈號換算或無資料時為 null */
  backend: BackendDimensionScore | null;
  weight: number;
}

export interface CandidateScore {
  dims: DimensionScore[];
  /** 可計算的權重全為 0 或全無資料時為 null */
  total: number | null;
  /** 有任何計入的維度是燈號換算 */
  usesSignal: boolean;
  /** 權重大於 0 但無資料、未計入的維度 */
  missing: DimensionKey[];
}

export function scoreRow(row: OverviewRow, weights: Weights): CandidateScore {
  const dims = DIMENSIONS.map((key): DimensionScore => {
    const signal = basisSignal(row, key);
    const backend = row.dimensionScores?.[key];
    const weight = weights[key];
    if (backend) {
      return {
        key,
        signal,
        score: backend.score,
        scoreSource: backend.score === null ? null : 'backend',
        backend,
        weight,
      };
    }
    const score = signal ? (SIGNAL_SCORE[signal.color] ?? null) : null;
    return { key, signal, score, scoreSource: score === null ? null : 'signal', backend: null, weight };
  });
  const counted = dims.filter((d) => d.score !== null && d.weight > 0);
  const sumW = counted.reduce((s, d) => s + d.weight, 0);
  const total = sumW > 0 ? Math.round(counted.reduce((s, d) => s + d.score! * d.weight, 0) / sumW) : null;
  return {
    dims,
    total,
    usesSignal: counted.some((d) => d.scoreSource === 'signal'),
    missing: dims.filter((d) => d.score === null && d.weight > 0).map((d) => d.key),
  };
}

/** 是否有任何候選商品有品牌／通路契合度的後端分數 */
export function anyBrandFitScore(rows: OverviewRow[]): boolean {
  return rows.some((r) => typeof r.dimensionScores?.brandFit?.score === 'number');
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
