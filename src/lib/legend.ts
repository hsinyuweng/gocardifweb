import type { RawLegend } from '../types/report';
import type { SignalColor } from '../types/viewModel';
import { toSignalColor } from './signalColor';

// 第 9.1、9.2 節：legend 查詢。legend 整段缺漏時也能運作。

/** legend[group][key].label；查不到時回傳 key 原文（key 為空時回傳 null） */
export function legendLabel(legend: RawLegend | null | undefined, group: string, key: string | null): string | null {
  if (key == null || key === '') return null;
  const label = legend?.[group]?.[key]?.label;
  return typeof label === 'string' && label !== '' ? label : key;
}

/** legend[group][key].color → 燈號顏色；查不到時為 gray */
export function legendColor(legend: RawLegend | null | undefined, group: string, key: string | null): SignalColor {
  if (key == null) return 'gray';
  return toSignalColor(legend?.[group]?.[key]?.color);
}
