// 報告清單型別（docs/spec/api-contract.md 第 2.1 節）

type Nullable<T> = T | null | undefined;

export interface RawReportIndexEntry {
  report_id?: Nullable<string>;
  name?: Nullable<string>;
  issuer?: Nullable<string>;
  country?: Nullable<string>;
  category?: Nullable<string>;
  recommendation?: Nullable<string>;
  label?: Nullable<string>;
  signal_color?: Nullable<string>;
  generated_date?: Nullable<string>;
  module_summary?: Nullable<{
    market_demand?: Nullable<{ signal?: Nullable<string>; text?: Nullable<string> }>;
    actuarial?: Nullable<{ signal?: Nullable<string>; research_status?: Nullable<string> }>;
    regulatory?: Nullable<{ signal?: Nullable<string>; overall_verdict?: Nullable<string> }>;
  }>;
  blocker_counts?: Nullable<{
    critical?: Nullable<number>;
    blocking?: Nullable<number>;
    warning?: Nullable<number>;
  }>;
}

export interface ReportIndex {
  generated_at?: Nullable<string>;
  reports: RawReportIndexEntry[];
}
