import { useEffect, useRef, useState } from 'react';
import type { DataQualityViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';

const t = zhTW.report;

/** 列印前自動展開收合區，印完恢復使用者原本的狀態（第 12 節） */
function useOpenWhilePrinting() {
  const [open, setOpen] = useState(false);
  const before = useRef(false);
  useEffect(() => {
    const onBefore = () => {
      setOpen((prev) => {
        before.current = prev;
        return true;
      });
    };
    const onAfter = () => setOpen(before.current);
    window.addEventListener('beforeprint', onBefore);
    window.addEventListener('afterprint', onAfter);
    return () => {
      window.removeEventListener('beforeprint', onBefore);
      window.removeEventListener('afterprint', onAfter);
    };
  }, []);
  return [open, setOpen] as const;
}

/** 資料品質（D11）：疑似輸入錯誤一律醒目顯示；其他項目預設收合 */
export function DataQualityPanel({ dq }: { dq: DataQualityViewModel }) {
  const [open, setOpen] = useOpenWhilePrinting();
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
        <details
          open={open}
          onToggle={(e) => setOpen(e.currentTarget.open)}
          className="group rounded border border-slate-200"
        >
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
