import type { NextStepViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';

const t = zhTW.report;

/** 建議下一步（第 11.3 節 D）：編號為 priority 原值，篩選後保留 */
export function NextStepsList({ steps }: { steps: NextStepViewModel[] }) {
  return (
    <ol className="divide-y divide-slate-100">
      {steps.map((s, i) => (
        <li key={s.id ?? `ns-${i}`} className="flex gap-3 py-2">
          <span className="w-6 shrink-0 text-right font-semibold text-navy-800 tabular-nums">
            {s.priority !== null ? `${s.priority}.` : zhTW.common.dash}
          </span>
          <div className="min-w-0">
            <p className="text-slate-900">{orDash(s.action)}</p>
            <p className="text-xs text-slate-500">
              {t.nextStepOwner}
              {orDash(s.ownerText)} · {t.nextStepSource}
              {orDash(s.sourceModuleLabel)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
