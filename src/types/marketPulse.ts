// 市場脈動 market-pulse.json 原始型別（schema 2.1：2.0 加 stale；後端需求文件 M5）
// 改格式時只改這裡、validate.ts、normalizeMarket.ts

type Nullable<T> = T | null | undefined;

export interface RawPulsePoint {
  period?: Nullable<string>;
  value?: Nullable<number>;
}

export interface RawPulseLine {
  name?: Nullable<string>;
  /** 由舊到新 */
  series?: Nullable<RawPulsePoint[]>;
}

export interface RawPulsePart {
  name?: Nullable<string>;
  /** 占比，35.2 表示 35.2% */
  share_pct?: Nullable<number>;
  /** 成長率（可省略），4.1 表示 +4.1% */
  growth_pct?: Nullable<number>;
}

export interface RawPulseSharePeriod {
  period?: Nullable<string>;
  parts?: Nullable<RawPulsePart[]>;
}

export interface RawPulseEvent {
  date?: Nullable<string>;
  title?: Nullable<string>;
  /** done：已發生；upcoming：預計 */
  status?: Nullable<string>;
  note?: Nullable<string>;
}

export interface RawPulseMetric {
  key?: Nullable<string>;
  /** growth、pricing、channel、health、brand；缺漏或其他值當作 growth */
  group?: Nullable<string>;
  /** trend、multi_line、share、timeline；缺漏或其他值當作 trend */
  type?: Nullable<string>;
  /** true 時顯示在首頁（最多 2 個） */
  featured?: Nullable<boolean>;
  label?: Nullable<string>;
  unit?: Nullable<string>;
  // trend
  latest_value?: Nullable<number>;
  /** 相對上一期的變化，3.2 表示 +3.2（單位見 change_unit） */
  change_pct?: Nullable<number>;
  /** pct：百分比（預設）；pp：百分點 */
  change_unit?: Nullable<string>;
  /** 比較期間文字，例如「本週」 */
  change_label?: Nullable<string>;
  /** 由舊到新 */
  series?: Nullable<RawPulsePoint[]>;
  // multi_line
  lines?: Nullable<RawPulseLine[]>;
  // share
  periods?: Nullable<RawPulseSharePeriod[]>;
  // timeline
  events?: Nullable<RawPulseEvent[]>;
  source?: Nullable<string>;
  source_url?: Nullable<string>;
  as_of?: Nullable<string>;
  /** true＝資料較舊（schema 2.1，後端依 as_of 與頻率判斷，前端不自己算） */
  stale?: Nullable<boolean>;
}

export interface RawFocusSummary {
  text?: Nullable<string>;
  as_of?: Nullable<string>;
}

export interface MarketPulse {
  schema_version?: Nullable<string>;
  generated_at?: Nullable<string>;
  /** 本月焦點；也接受純字串 */
  focus_summary?: Nullable<RawFocusSummary | string>;
  metrics: RawPulseMetric[];
}
