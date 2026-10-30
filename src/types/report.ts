// 原始報告 JSON 型別（第 8 節，schema_version 1.x）
// 所有欄位都可能為 null 或缺漏；只有 data/normalize.ts 可以讀取這些欄位。

export type ModuleKey = 'market_demand' | 'actuarial' | 'regulatory';

export const MODULE_KEYS: readonly ModuleKey[] = ['market_demand', 'actuarial', 'regulatory'];

type Nullable<T> = T | null | undefined;

export interface RawSourceFile {
  status?: Nullable<string>;
  file?: Nullable<string>;
  review_date?: Nullable<string>;
  /** 刻意不跑模組時的原因（後端需求 R1-B） */
  skip_reason?: Nullable<string>;
}

/** 來源（後端需求 R4、S12） */
export interface RawSourceRef {
  name?: Nullable<string>;
  url?: Nullable<string>;
  as_of?: Nullable<string>;
}

/** 單一維度的數值分數（後端需求 S10） */
export interface RawDimensionScore {
  /** 0–100 整數；null 表示無資料 */
  score?: Nullable<number>;
  /** 1–5 級；score ＝（級數 − 1）× 25 */
  level?: Nullable<number>;
  /** regulatory／market_demand／market_pulse（市場成長的備援數字） */
  basis?: Nullable<string>;
  rationale?: Nullable<string>;
  confidence?: Nullable<string>;
  /** 計分用的原始數值與單位（「新台幣元」或「%」） */
  value?: Nullable<number>;
  unit?: Nullable<string>;
  source?: Nullable<string>;
  source_url?: Nullable<string>;
  as_of?: Nullable<string>;
}

export interface RawDimensionScores {
  method_version?: Nullable<string>;
  feasibility?: Nullable<RawDimensionScore>;
  market_size?: Nullable<RawDimensionScore>;
  market_growth?: Nullable<RawDimensionScore>;
  brand_fit?: Nullable<RawDimensionScore>;
  /** 本版評分方法固定為 null，網站不讀 */
  profitability?: Nullable<RawDimensionScore>;
  saturation?: Nullable<RawDimensionScore>;
}

export interface RawReportMeta {
  schema_version?: Nullable<string>;
  generated_date?: Nullable<string>;
  /** 完成時間（ISO 8601 含時區，後端需求 S11） */
  generated_at?: Nullable<string>;
  report_id: string;
  source_files?: Nullable<Partial<Record<ModuleKey, Nullable<RawSourceFile>>>>;
}

export interface RawProductSnapshot {
  name?: Nullable<string>;
  issuer?: Nullable<string>;
  country?: Nullable<string>;
  category?: Nullable<string>;
  currency?: Nullable<string>;
  premium_mode?: Nullable<string>;
  mechanism_summary?: Nullable<string>;
  /** 商品原始資料（官方新聞稿、說明書等）；目前由 import-agentdata 從 1.json 補上 */
  source_documents?: Nullable<RawSourceDocument[]>;
}

export interface RawSourceDocument {
  title?: Nullable<string>;
  type?: Nullable<string>;
  url?: Nullable<string>;
  publication_date?: Nullable<string>;
}

/** 台灣競品一項（後端需求 M1；組員 enrich_reports.py 由 2a.json 轉換） */
export interface RawCompetitor {
  id?: Nullable<string>;
  name?: Nullable<string>;
  issuer?: Nullable<string>;
  market?: Nullable<string>;
  is_direct?: Nullable<boolean>;
  currency?: Nullable<string>;
  premium_mode?: Nullable<string>;
  /** 比較維度名稱 → 內容 */
  attributes?: Nullable<Record<string, Nullable<string>>>;
  difference?: Nullable<string>;
  source?: Nullable<string>;
  source_url?: Nullable<string>;
  as_of?: Nullable<string>;
}

export interface RawCompetitorComparison {
  has_direct_competitor?: Nullable<boolean>;
  no_competitor_reason?: Nullable<string>;
  comparison_dimensions?: Nullable<string[]>;
  competitors?: Nullable<RawCompetitor[]>;
  /** 差異分析；可能以「A級：…B級：…」分段 */
  gap_analysis?: Nullable<string>;
}

export interface RawHeadline {
  recommendation?: Nullable<string>;
  label?: Nullable<string>;
  signal_color?: Nullable<string>;
  matched_rule?: Nullable<number>;
  one_line_summary?: Nullable<string>;
  reasons?: Nullable<string[]>;
  /** 品牌定位／異業合作一句話（後端需求 S12） */
  brand_note?: Nullable<string>;
  brand_note_source?: Nullable<RawSourceRef>;
}

export interface RawRegulatoryCounts {
  red?: Nullable<number>;
  yellow?: Nullable<number>;
  green?: Nullable<number>;
  pending?: Nullable<number>;
  not_applicable?: Nullable<number>;
}

export interface RawScorecard {
  market_demand?: Nullable<{
    status?: Nullable<string>;
    level?: Nullable<string>;
    label?: Nullable<string>;
    confidence?: Nullable<string>;
    signal?: Nullable<string>;
  }>;
  actuarial?: Nullable<{
    status?: Nullable<string>;
    research_status?: Nullable<string>;
    comparability?: Nullable<string>;
    pricing_flag_count?: Nullable<number>;
    signal?: Nullable<string>;
  }>;
  regulatory?: Nullable<{
    status?: Nullable<string>;
    overall_verdict?: Nullable<string>;
    counts?: Nullable<RawRegulatoryCounts>;
    signal?: Nullable<string>;
  }>;
}

export interface RawKeyPoint {
  id?: Nullable<string>;
  text?: Nullable<string>;
  evidence_scheme?: Nullable<string>;
  evidence_level?: Nullable<string>;
  source?: Nullable<string>;
  /** 後端需求 A2 */
  source_url?: Nullable<string>;
  as_of?: Nullable<string>;
  source_ref?: Nullable<string>;
}

export interface RawMarketSizing {
  methodology?: Nullable<string>;
  target_population?: Nullable<number>;
  estimate_low?: Nullable<number>;
  estimate_mid?: Nullable<number>;
  estimate_high?: Nullable<number>;
  reported_unit?: Nullable<string>;
  confidence?: Nullable<string>;
}

export interface RawPricingFlag {
  topic?: Nullable<string>;
  direction?: Nullable<string>;
  source_count?: Nullable<number>;
}

export interface RawFinding {
  item_id?: Nullable<string>;
  title?: Nullable<string>;
  light?: Nullable<string>;
  suspected_red?: Nullable<boolean>;
  law?: Nullable<string>;
  remedy?: Nullable<string>;
  owner?: Nullable<string>;
  source_ref?: Nullable<string>;
  /** 後端需求 R4 */
  evidence_scheme?: Nullable<string>;
  evidence_level?: Nullable<string>;
  sources?: Nullable<RawSourceRef[]>;
}

export interface RawSections {
  market_demand?: Nullable<{
    summary?: Nullable<string>;
    market_sizing?: Nullable<RawMarketSizing>;
    key_points?: Nullable<RawKeyPoint[]>;
    data_gaps?: Nullable<string[]>;
    competitor_comparison?: Nullable<RawCompetitorComparison>;
  }>;
  actuarial?: Nullable<{
    summary?: Nullable<string>;
    key_points?: Nullable<RawKeyPoint[]>;
    pricing_flags?: Nullable<RawPricingFlag[]>;
    evidence_gaps?: Nullable<string[]>;
  }>;
  regulatory?: Nullable<{
    summary?: Nullable<string>;
    findings?: Nullable<RawFinding[]>;
    key_laws?: Nullable<string[]>;
  }>;
}

export interface RawBlocker {
  id?: Nullable<string>;
  module?: Nullable<string>;
  title?: Nullable<string>;
  severity?: Nullable<string>;
  owner?: Nullable<string>;
  action?: Nullable<string>;
  source_ref?: Nullable<string>;
}

export interface RawNextStep {
  id?: Nullable<string>;
  priority?: Nullable<number>;
  action?: Nullable<string>;
  owner?: Nullable<string>;
  source_module?: Nullable<string>;
  source_ref?: Nullable<string>;
}

export interface RawDataQuality {
  conflicts?: Nullable<string[]>;
  suspected_input_errors?: Nullable<string[]>;
  evidence_mismatch?: Nullable<string[]>;
  missing_fields?: Nullable<string[]>;
  notes?: Nullable<string[]>;
}

export interface RawLegendEntry {
  label?: Nullable<string>;
  color?: Nullable<string>;
}

/** legend 的群組：recommendation、severity、light、module、demand_level，以及未來可能新增的 research_status 等 */
export type RawLegend = Record<string, Nullable<Record<string, Nullable<RawLegendEntry>>>>;

export interface Report {
  report_meta: RawReportMeta;
  product_snapshot?: Nullable<RawProductSnapshot>;
  headline: RawHeadline;
  scorecard?: Nullable<RawScorecard>;
  sections?: Nullable<RawSections>;
  blockers?: Nullable<RawBlocker[]>;
  next_steps?: Nullable<RawNextStep[]>;
  data_quality?: Nullable<RawDataQuality>;
  legend?: Nullable<RawLegend>;
  disclaimer?: Nullable<string>;
  /** 追蹤清單四個維度的數值分數（後端需求 S10） */
  dimension_scores?: Nullable<RawDimensionScores>;
}
