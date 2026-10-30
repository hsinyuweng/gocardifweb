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
  /** 完成時間「YYYY-MM-DD HH:mm」（台北）；後端未提供時為 null */
  generatedAt: string | null;
  /** 完成時間毫秒，用於排序；無法解析時為 null */
  generatedTime: number | null;
  /** 後端數值分數（S10）；報告沒有 dimension_scores 時為 null */
  dimensionScores: BackendDimensionScores | null;
}

/** 追蹤清單維度（顯示與滑桿順序見 lib/score.ts） */
export type DimensionKey = 'feasibility' | 'marketSize' | 'marketGrowth' | 'brandFit';

export interface BackendDimensionScore {
  /** 0–100；null 表示後端標示無資料 */
  score: number | null;
  /** 1–5 級 */
  level: number | null;
  /** 後端的依據；市場成長用備援數字時為 market_pulse */
  basis: string | null;
  rationale: string | null;
  confidence: string | null;
  /** 原始數值（已加單位，例如「960 億元」「113.5%」） */
  valueText: string | null;
  source: SourceRefViewModel | null;
}

/** 缺少的維度（鍵不存在）改用燈號換算 */
export type BackendDimensionScores = Partial<Record<DimensionKey, BackendDimensionScore>>;

/** 來源（名稱、連結、資料日期） */
export interface SourceRefViewModel {
  name: string | null;
  url: string | null;
  asOf: string | null;
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
  /** 品牌定位一句話（S12）；沒有時為 null */
  brandNote: { text: string; source: SourceRefViewModel | null } | null;
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
  /** 刻意不跑模組的原因（R1-B） */
  skipReason: string | null;
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
  sourceUrl: string | null;
  asOf: string | null;
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
  /** R4：來源；沒有時為空陣列 */
  sources: SourceRefViewModel[];
  evidenceLevel: string | null;
  /** 證據等級說明，取自 legend.evidence_<scheme> */
  evidenceLabel: string | null;
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

/** 競品比較表的一列（比較維度）；cells 依 competitors 順序 */
export interface CompetitorRowViewModel {
  label: string;
  cells: (string | null)[];
}

export interface CompetitorViewModel {
  name: string | null;
  issuer: string | null;
  isDirect: boolean;
  sourceUrl: string | null;
}

export interface CompetitorComparisonViewModel {
  /** 後端判斷是否有直接競品；沒填時依各競品的 is_direct */
  hasDirect: boolean;
  noCompetitorReason: string | null;
  competitors: CompetitorViewModel[];
  rows: CompetitorRowViewModel[];
  /** 差異分析，依證據等級分段（沒有分段時 level 為 null） */
  gapAnalysis: { level: string | null; text: string }[];
}

export interface SourceDocumentViewModel {
  title: string | null;
  type: string | null;
  url: string;
  date: string | null;
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
  /** 台灣競品比較；後端沒提供時為 null */
  competitors: CompetitorComparisonViewModel | null;
  /** 商品原始資料（有網址的才列） */
  sourceDocuments: SourceDocumentViewModel[];
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

/** 新聞與法規監控的 5 個領域（頁籤「全部」以外） */
export type FeedDomain = 'product_channel' | 'market_macro' | 'regulation' | 'claims_consumer' | 'customer_brand';

export interface FeedItemViewModel {
  id: string;
  /** 新聞或法規；原始 kind 缺漏時，category 為 regulation 視為法規，其餘視為新聞 */
  kind: 'news' | 'regulation';
  /** 不在 5 個領域內時為 null（只出現在「全部」頁籤） */
  domain: FeedDomain | null;
  title: string | null;
  summary: string | null;
  source: string | null;
  /** 業者自行發布的新聞稿 */
  selfReported: boolean;
  /** 只接受 http(s) 網址，其餘為 null */
  url: string | null;
  /** published_at 原文 */
  publishedAt: string | null;
  /** 排序與相對時間用（毫秒）；無法解析時為 null */
  publishedTime: number | null;
  /** published_at 只有日期、沒有時間 */
  dateOnly: boolean;
  relatedReportIds: string[];
  /** 法規相關險種（與報告 category 比對「同險種」） */
  affectedCategories: string[];
  country: string | null;
  productCategory: string | null;
}

export interface FeedViewModel {
  generatedAt: string | null;
  /** 資料更新時間毫秒（「近 30 天」從這裡往前算）；無法解析時為 null */
  generatedTime: number | null;
  /** 新到舊；無法解析時間的排最後 */
  items: FeedItemViewModel[];
}

/** 市場脈動五組（顯示順序） */
export type PulseGroup = 'growth' | 'pricing' | 'channel' | 'health' | 'brand';

export interface PulsePointViewModel {
  period: string | null;
  value: number;
}

export interface PulseLineViewModel {
  name: string | null;
  /** 由舊到新，已排除非數字 */
  points: PulsePointViewModel[];
}

export interface PulsePartViewModel {
  name: string | null;
  sharePct: number;
  growthPct: number | null;
  /** 金額（新台幣元）；沒有時為 null */
  amountNtd: number | null;
}

export interface PulseSharePeriodViewModel {
  period: string | null;
  parts: PulsePartViewModel[];
}

export interface PulseEventViewModel {
  date: string | null;
  title: string | null;
  /** upcoming：預計；其他一律視為已發生 */
  upcoming: boolean;
  note: string | null;
}

interface PulseMetricBase {
  key: string;
  group: PulseGroup;
  featured: boolean;
  label: string | null;
  unit: string | null;
  source: string | null;
  sourceUrl: string | null;
  asOf: string | null;
  /** 資料較舊（後端判斷） */
  stale: boolean;
}

export interface PulseTrendViewModel extends PulseMetricBase {
  type: 'trend';
  latestValue: number | null;
  change: number | null;
  /** pp：百分點；pct：百分比 */
  changeUnit: 'pct' | 'pp';
  changeLabel: string | null;
  points: PulsePointViewModel[];
}

export interface PulseMultiLineViewModel extends PulseMetricBase {
  type: 'multi_line';
  lines: PulseLineViewModel[];
}

export interface PulseShareViewModel extends PulseMetricBase {
  type: 'share';
  /** 由舊到新 */
  periods: PulseSharePeriodViewModel[];
}

export interface PulseTimelineViewModel extends PulseMetricBase {
  type: 'timeline';
  /** 依日期由舊到新 */
  events: PulseEventViewModel[];
}

export interface PulseRankRowViewModel {
  name: string | null;
  value: number;
  rank: number;
  /** 自家公司（法巴） */
  isSelf: boolean;
}

export interface PulseRankingViewModel extends PulseMetricBase {
  type: 'ranking';
  period: string | null;
  /** 依名次由前到後 */
  rows: PulseRankRowViewModel[];
}

export type PulseMetricViewModel =
  | PulseTrendViewModel
  | PulseMultiLineViewModel
  | PulseShareViewModel
  | PulseTimelineViewModel
  | PulseRankingViewModel;

export interface MarketPulseViewModel {
  generatedAt: string | null;
  focus: { text: string; asOf: string | null } | null;
  metrics: PulseMetricViewModel[];
}

export type DataSourceLabel = 'static' | 'api';

/** 導覽列底部所需資訊 */
export interface AppMetaViewModel {
  generatedAt: string | null;
  dataSource: DataSourceLabel;
}
