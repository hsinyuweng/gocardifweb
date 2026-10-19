// 市場脈動 market-pulse.json 原始型別（後端需求文件 M5；正式格式未定版，改格式時只改這裡、validate.ts、normalizeMarket.ts）

type Nullable<T> = T | null | undefined;

export interface RawPulsePoint {
  period?: Nullable<string>;
  value?: Nullable<number>;
}

export interface RawPulseMetric {
  key?: Nullable<string>;
  label?: Nullable<string>;
  unit?: Nullable<string>;
  latest_value?: Nullable<number>;
  /** 相對上一期的百分比，3.2 表示 +3.2% */
  change_pct?: Nullable<number>;
  /** 比較期間文字，例如「本週」 */
  change_label?: Nullable<string>;
  /** 由舊到新 */
  series?: Nullable<RawPulsePoint[]>;
  source?: Nullable<string>;
  source_url?: Nullable<string>;
  as_of?: Nullable<string>;
}

export interface MarketPulse {
  schema_version?: Nullable<string>;
  generated_at?: Nullable<string>;
  metrics: RawPulseMetric[];
}
