import type { DataGapViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';

/** 資料缺口：合併市場需求 data_gaps 與發生率暨獲利 evidence_gaps，每項前標面向名稱 */
export function DataGapsPanel({ gaps }: { gaps: DataGapViewModel[] }) {
  if (gaps.length === 0) return <p className="text-ink2">{zhTW.common.none}</p>;
  return (
    <ul className="space-y-2">
      {gaps.map((g, i) => (
        <li key={i} className="flex gap-2">
          <span className="h-fit shrink-0 rounded-md bg-line px-1.5 py-0.5 text-xs text-ink2">{g.moduleLabel}</span>
          <span className="text-ink">{g.text}</span>
        </li>
      ))}
    </ul>
  );
}
