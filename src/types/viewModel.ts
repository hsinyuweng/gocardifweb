// 畫面用資料型別：元件只接收這裡定義的型別作為 props

/** 燈號顏色（第 9.2 節）；未列出的名稱一律轉為 gray */
export type SignalColor = 'green' | 'yellow' | 'orange' | 'red' | 'gray';

/** 色點＋文字 */
export interface SignalText {
  color: SignalColor;
  text: string | null;
}

export interface BlockerCounts {
  critical: number;
  blocking: number;
  warning: number;
}

export interface OverviewRow {
  /** 缺漏時該列不可點擊 */
  reportId: string | null;
  name: string | null;
  issuer: string | null;
  countryCode: string | null;
  countryLabel: string | null;
  category: string | null;
  marketDemand: SignalText;
  actuarial: SignalText;
  regulatory: SignalText;
  /** recommendation 原始鍵，用於建議分布列篩選；null 表示缺漏 */
  recommendationKey: string | null;
  recommendation: SignalText;
  blockerCounts: BlockerCounts;
  /** YYYY-MM-DD 原文，用於顯示與排序 */
  generatedDate: string | null;
}

export interface RecommendationGroup {
  /** 以 recommendation 原始鍵分組；缺漏者為 null */
  key: string | null;
  label: string | null;
  color: SignalColor;
  count: number;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface OverviewViewModel {
  /** 已格式化的資料更新時間（台北時間）；缺漏時為 null */
  generatedAt: string | null;
  rows: OverviewRow[];
  /** 依件數多到少 */
  recommendationGroups: RecommendationGroup[];
  countryOptions: FilterOption[];
  categoryOptions: FilterOption[];
}

// ───────── 報告頁 ─────────

export type ModuleKey = 'market_demand' | 'actuarial' | 'regulatory';

export interface ReviewDate {
  moduleLabel: string;
  date: string | null;
}

/** B 區決策摘要 */
export interface DecisionSummaryViewModel {
  name: string | null;
  issuer: string | null;
  countryLabel: string | null;
  category: string | null;
  currency: string | null;
  premiumMode: string | null;
  mechanismSummary: string | null;
  recommendation: SignalText;
  oneLineSummary: string | null;
  reasons: string[];
  generatedDate: string | null;
  reviewDates: ReviewDate[];
}

/** 分布條的一段（第 13 節） */
export interface DistributionSegment {
  key: string;
  label: string;
  color: SignalColor;
  count: number;
}

interface ScorecardBase {
  moduleLabel: string;
  /** status 為 provided 時為 true */
  provided: boolean;
  /** status 原值（不為 provided 時顯示） */
  rawStatus: string | null;
  /** 燈號＋主要判定文字 */
  signal: SignalText;
  summary: string | null;
}

export type ScorecardViewModel =
  | (ScorecardBase & { moduleKey: 'market_demand'; confidence: string | null })
  | (ScorecardBase & { moduleKey: 'actuarial'; comparability: string | null; pricingFlagCount: number | null })
  | (ScorecardBase & { moduleKey: 'regulatory'; distribution: DistributionSegment[] });

export interface BlockerViewModel {
  id: string | null;
  /** severity 原值，用於「我的待辦」計算重大件數 */
  severityKey: string | null;
  severity: SignalText;
  moduleLabel: string | null;
  title: string | null;
  /** owner 原文 */
  ownerText: string | null;
  /** 拆分後的單位（第 9.5 節），null 歸入「未指定」 */
  owners: string[];
  action: string | null;
}

export interface NextStepViewModel {
  id: string | null;
  priority: number | null;
  action: string | null;
  ownerText: string | null;
  owners: string[];
  sourceModuleLabel: string | null;
}

export type DataQualityGroupKey = 'conflicts' | 'evidence_mismatch' | 'missing_fields' | 'notes';

export interface DataQualityViewModel {
  suspectedInputErrors: string[];
  /** 依 conflicts、evidence_mismatch、missing_fields、notes 順序；空陣列已排除 */
  moreGroups: Array<{ key: DataQualityGroupKey; items: string[] }>;
}

export interface DataGapViewModel {
  moduleLabel: string;
  text: string;
}

// ───────── E 區各面向詳細內容 ─────────

export interface KeyPointViewModel {
  id: string | null;
  text: string | null;
  source: string | null;
  /** null 時不顯示證據等級標籤（第 9.4 節） */
  evidenceLevel: string | null;
}

export interface MarketEstimate {
  /** 原始數值，用於區間條定位 */
  value: number | null;
  /** 已格式化文字（第 9.3 節） */
  text: string | null;
}

export interface MarketSizingViewModel {
  methodology: string | null;
  /** 已格式化，例如「7,291,797 人」 */
  targetPopulation: string | null;
  low: MarketEstimate;
  mid: MarketEstimate;
  high: MarketEstimate;
  confidence: string | null;
}

export interface PricingFlagViewModel {
  topic: string | null;
  direction: string | null;
  sourceCount: number | null;
}

export interface FindingViewModel {
  itemId: string | null;
  title: string | null;
  /** light 原值，用於燈號篩選 */
  lightKey: string | null;
  light: SignalText;
  suspectedRed: boolean;
  law: string | null;
  remedy: string | null;
  owner: string | null;
}

export interface LightFilterOption {
  key: string;
  label: string;
  color: SignalColor;
  count: number;
}

export interface ReportDetailsViewModel {
  market_demand: {
    moduleLabel: string;
    summary: string | null;
    sizing: MarketSizingViewModel;
    keyPoints: KeyPointViewModel[];
  };
  actuarial: {
    moduleLabel: string;
    summary: string | null;
    keyPoints: KeyPointViewModel[];
    pricingFlags: PricingFlagViewModel[];
  };
  regulatory: {
    moduleLabel: string;
    summary: string | null;
    /** legend.light 各值；legend 缺漏時改用 findings 中出現的值 */
    lightOptions: LightFilterOption[];
    findings: FindingViewModel[];
    keyLaws: string[];
  };
}

export interface ReportViewModel {
  reportId: string;
  schemaVersionMismatch: boolean;
  /** 流程列：三面向中 status 為 provided 的數量 */
  analysisProvided: number;
  analysisTotal: number;
  summary: DecisionSummaryViewModel;
  /** 固定順序：market_demand、actuarial、regulatory */
  moduleCards: ScorecardViewModel[];
  /** 負責單位選項（不含「全部」），依出現順序，「未指定」放最後 */
  ownerOptions: string[];
  /** 已依嚴重度排序 */
  blockers: BlockerViewModel[];
  /** 已依 priority 排序 */
  nextSteps: NextStepViewModel[];
  dataQuality: DataQualityViewModel;
  dataGaps: DataGapViewModel[];
  details: ReportDetailsViewModel;
  disclaimer: string | null;
}

// ───────── 我的待辦（規格外功能，2026-10-18 經確認） ─────────

export interface OwnerCount {
  owner: string;
  /** 待解決事項＋建議下一步 */
  count: number;
}

/** 一件商品中屬於所選負責單位的項目 */
export interface TaskProductGroup {
  reportId: string;
  name: string | null;
  issuer: string | null;
  blockers: BlockerViewModel[];
  nextSteps: NextStepViewModel[];
  criticalCount: number;
}

export interface TaskSummary {
  blockerCount: number;
  criticalCount: number;
  nextStepCount: number;
  productCount: number;
}

// ───────── 市場總覽：動態清單與市場脈動 ─────────

export interface FeedItemViewModel {
  id: string;
  /** category 原值（news、market、product、regulation） */
  category: string | null;
  title: string | null;
  summary: string | null;
  source: string | null;
  /** 只接受 http(s) 網址，其餘為 null */
  url: string | null;
  /** published_at 原文 */
  publishedAt: string | null;
  /** 排序與相對時間用（毫秒）；無法解析時為 null */
  publishedTime: number | null;
  /** published_at 只有日期、沒有時間 */
  dateOnly: boolean;
  relatedReportIds: string[];
  country: string | null;
  productCategory: string | null;
}

export interface FeedViewModel {
  generatedAt: string | null;
  /** 新到舊；無法解析時間的排最後 */
  items: FeedItemViewModel[];
}

export interface PulseMetricViewModel {
  key: string;
  label: string | null;
  unit: string | null;
  latestValue: number | null;
  changePct: number | null;
  changeLabel: string | null;
  /** 由舊到新，已排除非數字 */
  series: number[];
  source: string | null;
  sourceUrl: string | null;
  asOf: string | null;
}

export interface MarketPulseViewModel {
  generatedAt: string | null;
  metrics: PulseMetricViewModel[];
}

export type DataSourceLabel = 'static' | 'api';

/** 導覽列底部所需資訊 */
export interface AppMetaViewModel {
  generatedAt: string | null;
  dataSource: DataSourceLabel;
}
