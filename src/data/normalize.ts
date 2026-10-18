// 原始 JSON → 畫面用 ViewModel（第 6.5 節）
// 全專案只有這個檔案讀取原始報告／清單欄位；未知欄位忽略，缺漏欄位轉為 null 或 0。

import type { AppConfig } from '../config/appConfig';
import type { RawReportIndexEntry, ReportIndex } from '../types/reportIndex';
import { MODULE_KEYS, type ModuleKey, type RawKeyPoint, type RawLegend, type Report } from '../types/report';
import type {
  AppMetaViewModel,
  BlockerViewModel,
  DataGapViewModel,
  DataQualityGroupKey,
  DataQualityViewModel,
  DecisionSummaryViewModel,
  DistributionSegment,
  FilterOption,
  FindingViewModel,
  KeyPointViewModel,
  LightFilterOption,
  NextStepViewModel,
  OverviewRow,
  OverviewViewModel,
  RecommendationGroup,
  ReportDetailsViewModel,
  ReportViewModel,
  ScorecardViewModel,
} from '../types/viewModel';
import { countryLabel } from '../lib/country';
import { formatDateTimeTaipei, formatMarketEstimate, formatPopulation } from '../lib/format';
import { legendColor, legendLabel } from '../lib/legend';
import { collectOwnerOptions, splitOwners } from '../lib/owner';
import { researchStatusLabel } from '../lib/researchStatus';
import { toSignalColor } from '../lib/signalColor';
import { isSchemaVersionSupported } from './validate';

function str(v: unknown): string | null {
  return typeof v === 'string' && v !== '' ? v : null;
}

function count(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}

function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/** 只保留非空字串 */
function strList(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string' && s !== '') : [];
}

/** 只保留物件元素 */
function objList<T>(v: T[] | null | undefined): T[] {
  return Array.isArray(v) ? v.filter((x) => typeof x === 'object' && x !== null) : [];
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

// ───────── 報告頁 ─────────

const PROVIDED = 'provided';

function moduleLabel(legend: RawLegend | null | undefined, key: ModuleKey): string {
  return legendLabel(legend, 'module', key) ?? key;
}

function normalizeSummary(r: Report): DecisionSummaryViewModel {
  const snap = r.product_snapshot;
  const head = r.headline;
  const sources = r.report_meta.source_files;
  return {
    name: str(snap?.name),
    issuer: str(snap?.issuer),
    countryLabel: countryLabel(str(snap?.country)),
    category: str(snap?.category),
    currency: str(snap?.currency),
    premiumMode: str(snap?.premium_mode),
    mechanismSummary: str(snap?.mechanism_summary),
    recommendation: { color: toSignalColor(head.signal_color), text: str(head.label) },
    oneLineSummary: str(head.one_line_summary),
    reasons: strList(head.reasons),
    generatedDate: str(r.report_meta.generated_date),
    reviewDates: MODULE_KEYS.map((k) => ({
      moduleLabel: moduleLabel(r.legend, k),
      date: str(sources?.[k]?.review_date),
    })),
  };
}

// 法規燈號分布條的順序與 counts 欄位一致
const LIGHT_KEYS = ['red', 'yellow', 'green', 'pending', 'not_applicable'] as const;

function normalizeScorecards(r: Report): ScorecardViewModel[] {
  const sc = r.scorecard;
  const sec = r.sections;
  const legend = r.legend;

  const md = sc?.market_demand;
  const ac = sc?.actuarial;
  const rg = sc?.regulatory;
  const base = (key: ModuleKey, status: unknown, summary: unknown) => ({
    moduleLabel: moduleLabel(legend, key),
    provided: status === PROVIDED,
    rawStatus: str(status),
    summary: str(summary),
  });

  const distribution: DistributionSegment[] = LIGHT_KEYS.map((k) => ({
    key: k,
    label: legendLabel(legend, 'light', k) ?? k,
    color: legendColor(legend, 'light', k),
    count: count(rg?.counts?.[k]),
  }));

  return [
    {
      ...base('market_demand', md?.status, sec?.market_demand?.summary),
      moduleKey: 'market_demand',
      signal: {
        color: toSignalColor(md?.signal),
        text: legendLabel(legend, 'demand_level', str(md?.level)) ?? str(md?.label),
      },
      confidence: str(md?.confidence),
    },
    {
      ...base('actuarial', ac?.status, sec?.actuarial?.summary),
      moduleKey: 'actuarial',
      signal: { color: toSignalColor(ac?.signal), text: researchStatusLabel(str(ac?.research_status), legend) },
      comparability: str(ac?.comparability),
      pricingFlagCount: num(ac?.pricing_flag_count),
    },
    {
      ...base('regulatory', rg?.status, sec?.regulatory?.summary),
      moduleKey: 'regulatory',
      signal: { color: toSignalColor(rg?.signal), text: str(rg?.overall_verdict) },
      distribution,
    },
  ];
}

const SEVERITY_ORDER: Record<string, number> = { critical: 0, blocking: 1, warning: 2 };

function normalizeBlockers(r: Report): BlockerViewModel[] {
  const legend = r.legend;
  return objList(r.blockers)
    .map((b) => {
      const severity = str(b.severity);
      const ownerText = str(b.owner);
      return {
        order: severity !== null && severity in SEVERITY_ORDER ? SEVERITY_ORDER[severity]! : 3,
        vm: {
          id: str(b.id),
          severity: { color: legendColor(legend, 'severity', severity), text: legendLabel(legend, 'severity', severity) },
          moduleLabel: legendLabel(legend, 'module', str(b.module)),
          title: str(b.title),
          ownerText,
          owners: splitOwners(ownerText),
          action: str(b.action),
        },
      };
    })
    .sort((a, b) => a.order - b.order) // Array.sort 為穩定排序，同級保持原順序
    .map((x) => x.vm);
}

function normalizeNextSteps(r: Report): NextStepViewModel[] {
  return objList(r.next_steps)
    .map((s) => {
      const ownerText = str(s.owner);
      return {
        id: str(s.id),
        priority: num(s.priority),
        action: str(s.action),
        ownerText,
        owners: splitOwners(ownerText),
        sourceModuleLabel: legendLabel(r.legend, 'module', str(s.source_module)),
      };
    })
    .sort((a, b) => {
      if (a.priority === b.priority) return 0;
      if (a.priority === null) return 1;
      if (b.priority === null) return -1;
      return a.priority - b.priority;
    });
}

const MORE_DQ_KEYS: readonly DataQualityGroupKey[] = ['conflicts', 'evidence_mismatch', 'missing_fields', 'notes'];

function normalizeDataQuality(r: Report): DataQualityViewModel {
  const dq = r.data_quality;
  return {
    suspectedInputErrors: strList(dq?.suspected_input_errors),
    moreGroups: MORE_DQ_KEYS.map((key) => ({ key, items: strList(dq?.[key]) })).filter((g) => g.items.length > 0),
  };
}

function normalizeDataGaps(r: Report): DataGapViewModel[] {
  const md = moduleLabel(r.legend, 'market_demand');
  const ac = moduleLabel(r.legend, 'actuarial');
  return [
    ...strList(r.sections?.market_demand?.data_gaps).map((text) => ({ moduleLabel: md, text })),
    ...strList(r.sections?.actuarial?.evidence_gaps).map((text) => ({ moduleLabel: ac, text })),
  ];
}

function normalizeKeyPoints(list: RawKeyPoint[] | null | undefined): KeyPointViewModel[] {
  // 不同 evidence_scheme 不得一起排序或比較（第 9.4 節）：保持原順序
  return objList(list).map((k) => ({
    id: str(k.id),
    text: str(k.text),
    source: str(k.source),
    evidenceLevel: str(k.evidence_level),
  }));
}

function normalizeDetails(r: Report): ReportDetailsViewModel {
  const legend = r.legend;
  const md = r.sections?.market_demand;
  const ac = r.sections?.actuarial;
  const rg = r.sections?.regulatory;
  const ms = md?.market_sizing;
  const unit = str(ms?.reported_unit);
  const estimate = (v: unknown) => {
    const value = num(v);
    return { value, text: formatMarketEstimate(value, unit) };
  };

  const findings: FindingViewModel[] = objList(rg?.findings).map((f) => {
    const lightKey = str(f.light);
    return {
      itemId: str(f.item_id),
      title: str(f.title),
      lightKey,
      light: { color: legendColor(legend, 'light', lightKey), text: legendLabel(legend, 'light', lightKey) },
      suspectedRed: f.suspected_red === true,
      law: str(f.law),
      remedy: str(f.remedy),
      owner: str(f.owner),
    };
  });

  // 燈號篩選選項：legend.light 各值；legend 缺漏時改用 findings 中出現的值
  const legendLights = legend?.light ? Object.keys(legend.light) : [];
  const lightKeys =
    legendLights.length > 0
      ? legendLights
      : [...new Set(findings.map((f) => f.lightKey).filter((k): k is string => k !== null))];
  const lightOptions: LightFilterOption[] = lightKeys.map((key) => ({
    key,
    label: legendLabel(legend, 'light', key) ?? key,
    color: legendColor(legend, 'light', key),
    count: findings.filter((f) => f.lightKey === key).length,
  }));

  return {
    market_demand: {
      moduleLabel: moduleLabel(legend, 'market_demand'),
      summary: str(md?.summary),
      sizing: {
        methodology: str(ms?.methodology),
        targetPopulation: formatPopulation(num(ms?.target_population)),
        low: estimate(ms?.estimate_low),
        mid: estimate(ms?.estimate_mid),
        high: estimate(ms?.estimate_high),
        confidence: str(ms?.confidence),
      },
      keyPoints: normalizeKeyPoints(md?.key_points),
    },
    actuarial: {
      moduleLabel: moduleLabel(legend, 'actuarial'),
      summary: str(ac?.summary),
      keyPoints: normalizeKeyPoints(ac?.key_points),
      pricingFlags: objList(ac?.pricing_flags).map((p) => ({
        topic: str(p.topic),
        direction: str(p.direction),
        sourceCount: num(p.source_count),
      })),
    },
    regulatory: {
      moduleLabel: moduleLabel(legend, 'regulatory'),
      summary: str(rg?.summary),
      lightOptions,
      findings,
      keyLaws: strList(rg?.key_laws),
    },
  };
}

export function normalizeReport(r: Report): ReportViewModel {
  const sources = r.report_meta.source_files;
  const blockers = normalizeBlockers(r);
  const nextSteps = normalizeNextSteps(r);
  return {
    reportId: r.report_meta.report_id,
    schemaVersionMismatch: !isSchemaVersionSupported(r.report_meta.schema_version),
    analysisProvided: MODULE_KEYS.filter((k) => sources?.[k]?.status === PROVIDED).length,
    analysisTotal: MODULE_KEYS.length,
    summary: normalizeSummary(r),
    moduleCards: normalizeScorecards(r),
    ownerOptions: collectOwnerOptions([...blockers.map((b) => b.owners), ...nextSteps.map((s) => s.owners)]),
    blockers,
    nextSteps,
    dataQuality: normalizeDataQuality(r),
    dataGaps: normalizeDataGaps(r),
    details: normalizeDetails(r),
    disclaimer: str(r.disclaimer),
  };
}

/** 導覽列底部資訊；清單讀取失敗時 index 為 null */
export function normalizeAppMeta(index: ReportIndex | null, config: AppConfig): AppMetaViewModel {
  return {
    generatedAt: formatDateTimeTaipei(str(index?.generated_at)),
    dataSource: config.dataSource,
  };
}
