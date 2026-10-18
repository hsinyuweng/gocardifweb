// 原始報告 JSON 型別（第 8 節，schema_version 1.x）
// 所有欄位都可能為 null 或缺漏；只有 data/normalize.ts 可以讀取這些欄位。

export type ModuleKey = 'market_demand' | 'actuarial' | 'regulatory';

export const MODULE_KEYS: readonly ModuleKey[] = ['market_demand', 'actuarial', 'regulatory'];

type Nullable<T> = T | null | undefined;

export interface RawSourceFile {
  status?: Nullable<string>;
  file?: Nullable<string>;
  review_date?: Nullable<string>;
}

export interface RawReportMeta {
  schema_version?: Nullable<string>;
  generated_date?: Nullable<string>;
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
}

export interface RawHeadline {
  recommendation?: Nullable<string>;
  label?: Nullable<string>;
  signal_color?: Nullable<string>;
  matched_rule?: Nullable<number>;
  one_line_summary?: Nullable<string>;
  reasons?: Nullable<string[]>;
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
}

export interface RawSections {
  market_demand?: Nullable<{
    summary?: Nullable<string>;
    market_sizing?: Nullable<RawMarketSizing>;
    key_points?: Nullable<RawKeyPoint[]>;
    data_gaps?: Nullable<string[]>;
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
}
