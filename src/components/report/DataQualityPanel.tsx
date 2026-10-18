import type { DataQualityViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';

const t = zhTW.report;

/** 資料品質（D11）：疑似輸入錯誤一律醒目顯示；其他項目預設收合 */
export function DataQualityPanel({ dq }: { dq: DataQualityViewModel }) {
  const hasErrors = dq.suspectedInputErrors.length > 0;
  const hasMore = dq.moreGroups.length > 0;
  if (!hasErrors && !hasMore) return <p className="text-slate-600">{zhTW.common.none}</p>;

  return (
    <div className="space-y-3">
      {hasErrors ? (
        <div role="note" className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900">
          <p className="font-semibold">{t.suspectedInputErrors}</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {dq.suspectedInputErrors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasMore ? (
        <details className="group rounded border border-slate-200">
          <summary className="cursor-pointer px-3 py-2 text-slate-700 select-none hover:bg-slate-50">
            {t.moreDataQuality}
          </summary>
          <div className="space-y-3 border-t border-slate-200 px-3 py-2">
            {dq.moreGroups.map((g) => (
              <div key={g.key}>
                <h3 className="text-xs font-medium text-slate-500">{t.dataQualityGroups[g.key]}</h3>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-700">
                  {g.items.map((item, i) => (
                    <li key={i} className="break-words">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}
