import type { PulseGroup, PulseMetricViewModel, PulseTrendViewModel } from '../types/viewModel';

/** 市場脈動五組的顯示順序 */
export const PULSE_GROUP_ORDER: readonly PulseGroup[] = ['growth', 'pricing', 'channel', 'health', 'brand'];

const HOME_LIMIT = 2;

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
