// 動態清單 feed.json 原始型別（後端需求文件 S7；正式格式未定版，改格式時只改這裡、validate.ts、normalizeMarket.ts）

type Nullable<T> = T | null | undefined;

export interface RawFeedItem {
  id?: Nullable<string>;
  /** news、regulation（2026-10-20 新格式草案）；缺漏時由 category 推得 */
  kind?: Nullable<string>;
  /** product_channel、market_macro、regulation、claims_consumer、customer_brand（2026-10-20 新格式草案） */
  domain?: Nullable<string>;
  /** 舊格式：regulation、market、product、news */
  category?: Nullable<string>;
  title?: Nullable<string>;
  summary?: Nullable<string>;
  /** YYYY-MM-DD 或 ISO 8601 時間 */
  published_at?: Nullable<string>;
  source?: Nullable<string>;
  url?: Nullable<string>;
  region?: Nullable<string>;
  importance?: Nullable<string>;
  tags?: Nullable<string[]>;
  related_report_ids?: Nullable<string[]>;
  related_modules?: Nullable<string[]>;
  owner_hint?: Nullable<string>;
  /** 國家代碼，與報告 country 同一組值 */
  country?: Nullable<string>;
  /** 與報告險種同一組值 */
  product_category?: Nullable<string>;
}

export interface Feed {
  schema_version?: Nullable<string>;
  generated_at?: Nullable<string>;
  items: RawFeedItem[];
}
