// 原始 JSON → 畫面用 ViewModel（第 6.5 節）
// 全專案只有這個檔案讀取原始報告／清單欄位；未知欄位忽略，缺漏欄位轉為 null 或 0。

import type { AppConfig } from '../config/appConfig';
import type { RawReportIndexEntry, ReportIndex } from '../types/reportIndex';
import type {
  AppMetaViewModel,
  FilterOption,
  OverviewRow,
  OverviewViewModel,
  RecommendationGroup,
} from '../types/viewModel';
import { countryLabel } from '../lib/country';
import { formatDateTimeTaipei } from '../lib/format';
import { researchStatusLabel } from '../lib/researchStatus';
import { toSignalColor } from '../lib/signalColor';

function str(v: unknown): string | null {
  return typeof v === 'string' && v !== '' ? v : null;
}

function count(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}

function normalizeIndexEntry(entry: RawReportIndexEntry): OverviewRow {
  const ms = entry.module_summary;
  const bc = entry.blocker_counts;
  const country = str(entry.country);
  return {
    reportId: str(entry.report_id),
    name: str(entry.name),
    issuer: str(entry.issuer),
    countryCode: country,
    countryLabel: countryLabel(country),
    category: str(entry.category),
    marketDemand: {
      color: toSignalColor(ms?.market_demand?.signal),
      text: str(ms?.market_demand?.text),
    },
    actuarial: {
      color: toSignalColor(ms?.actuarial?.signal),
      // 清單不含 legend，直接使用第 9.1 節固定表
      text: researchStatusLabel(str(ms?.actuarial?.research_status)),
    },
    regulatory: {
      color: toSignalColor(ms?.regulatory?.signal),
      text: str(ms?.regulatory?.overall_verdict),
    },
    recommendationKey: str(entry.recommendation),
    recommendation: {
      color: toSignalColor(entry.signal_color),
      text: str(entry.label),
    },
    blockerCounts: {
      critical: count(bc?.critical),
      blocking: count(bc?.blocking),
      warning: count(bc?.warning),
    },
    generatedDate: str(entry.generated_date),
  };
}

function groupRecommendations(rows: OverviewRow[]): RecommendationGroup[] {
  const groups = new Map<string | null, RecommendationGroup>();
  for (const row of rows) {
    const g = groups.get(row.recommendationKey);
    if (g) {
      g.count += 1;
    } else {
      groups.set(row.recommendationKey, {
        key: row.recommendationKey,
        label: row.recommendation.text,
        color: row.recommendation.color,
        count: 1,
      });
    }
  }
  return [...groups.values()].sort((a, b) => b.count - a.count);
}

function uniqueOptions(pairs: Array<[string | null, string | null]>): FilterOption[] {
  const map = new Map<string, string>();
  for (const [value, label] of pairs) {
    if (value !== null && !map.has(value)) map.set(value, label ?? value);
  }
  return [...map.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'zh-Hant-TW'));
}

export function normalizeReportIndex(index: ReportIndex): OverviewViewModel {
  const rows = index.reports
    .filter((e): e is RawReportIndexEntry => typeof e === 'object' && e !== null)
    .map(normalizeIndexEntry);
  return {
    generatedAt: formatDateTimeTaipei(str(index.generated_at)),
    rows,
    recommendationGroups: groupRecommendations(rows),
    countryOptions: uniqueOptions(rows.map((r) => [r.countryCode, r.countryLabel])),
    categoryOptions: uniqueOptions(rows.map((r) => [r.category, r.category])),
  };
}

/** 導覽列底部資訊；清單讀取失敗時 index 為 null */
export function normalizeAppMeta(index: ReportIndex | null, config: AppConfig): AppMetaViewModel {
  return {
    generatedAt: formatDateTimeTaipei(str(index?.generated_at)),
    dataSource: config.dataSource,
  };
}
