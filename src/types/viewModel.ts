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

export type DataSourceLabel = 'static' | 'api';

/** 導覽列底部所需資訊 */
export interface AppMetaViewModel {
  generatedAt: string | null;
  dataSource: DataSourceLabel;
}
