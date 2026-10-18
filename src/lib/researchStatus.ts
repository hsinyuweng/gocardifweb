import type { RawLegend } from '../types/report';
import { zhTW } from '../i18n/zh-TW';

// 第 9.1 節：research_status 標籤
// 先查 legend.research_status → 再查固定表 → 仍查不到則顯示原值
export function researchStatusLabel(
  value: string | null | undefined,
  legend?: RawLegend | null,
): string | null {
  if (value == null || value === '') return null;
  const fromLegend = legend?.research_status?.[value]?.label;
  if (fromLegend) return fromLegend;
  const fixed = zhTW.researchStatus as Record<string, string>;
  return fixed[value] ?? value;
}
