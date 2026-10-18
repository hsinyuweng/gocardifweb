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
}

export type DataSourceLabel = 'static' | 'api';

/** 導覽列底部所需資訊 */
export interface AppMetaViewModel {
  generatedAt: string | null;
  dataSource: DataSourceLabel;
}
