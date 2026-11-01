import type { NextStepViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';

/**
 * 建議下一步（第 11.3 節 D）：編號為 priority 原值，篩選後保留。
 * limit 之後的項目畫面上不顯示、列印時顯示（2026-11-01：先列 3 項，不列負責單位與來源）。
 */
export function NextStepsList({ steps, limit }: { steps: NextStepViewModel[]; limit?: number }) {
  return (
    <ol className="divide-y divide-line">
      {steps.map((s, i) => (
        <li key={s.id ?? `ns-${i}`} className={`gap-3 py-2 ${limit !== undefined && i >= limit ? 'hidden print:flex' : 'flex'}`}>
          <span className="w-6 shrink-0 text-right font-medium text-ink tabular-nums">
            {s.priority !== null ? `${s.priority}.` : zhTW.common.dash}
          </span>
          <p className="min-w-0 text-ink">{orDash(s.action)}</p>
        </li>
      ))}
    </ol>
  );
}
