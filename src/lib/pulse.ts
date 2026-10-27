import type { PulseGroup, PulseMetricViewModel, PulseTrendViewModel } from '../types/viewModel';

/** 市場脈動五組的顯示順序 */
export const PULSE_GROUP_ORDER: readonly PulseGroup[] = ['growth', 'pricing', 'channel', 'health', 'brand'];

const HOME_LIMIT = 2;

/**
 * 百分比的小數位（2026-10-27 視覺改版，同一個指標全站一致）：
 * 定價環境（利率）、健康度、品牌與競爭（市占率）的差距小，用 2 位；其他（年增率等）用 1 位。
 * 變化值（百分點）跟著指標。占比一律 1 位（formatSharePct）。
 */
export function pulseDigits(group: PulseGroup): 1 | 2 {
  return group === 'pricing' || group === 'health' || group === 'brand' ? 2 : 1;
}

/**
 * 首頁顯示的指標（最多 2 個，只用單線趨勢）：
 * 有 featured 的照陣列順序；都沒有時取成長動能組的前 2 個。
 */
export function homeMetrics(metrics: PulseMetricViewModel[]): PulseTrendViewModel[] {
  const trends = metrics.filter((m): m is PulseTrendViewModel => m.type === 'trend');
  const featured = trends.filter((m) => m.featured);
  return (featured.length > 0 ? featured : trends.filter((m) => m.group === 'growth')).slice(0, HOME_LIMIT);
}

export function metricsByGroup(metrics: PulseMetricViewModel[]): Map<PulseGroup, PulseMetricViewModel[]> {
  const map = new Map<PulseGroup, PulseMetricViewModel[]>(PULSE_GROUP_ORDER.map((g) => [g, []]));
  for (const m of metrics) map.get(m.group)!.push(m);
  return map;
}
