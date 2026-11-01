import { Fragment, useState } from 'react';
import type { PulseMetricViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { pulseTableRows } from '../../lib/pulseTable';
import { MetricChart } from './MetricChart';
import { StaleTag } from './StaleTag';

const t = zhTW.market.table;
const COLS = 5;

/**
 * 市場脈動指標表（2026-10-27 視覺改版 V5；2026-11-01 拿掉頻率與來源欄）：指標｜最新｜上期｜變化｜資料期間，來源列在表格下方一行。
 * 占比與多線的項目縮排列在指標下方；「看圖 ▾」在該列下方展開原本的圖，一次只展開一個。
 */
export function MetricTable({ metrics }: { metrics: PulseMetricViewModel[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const rows = pulseTableRows(metrics);
  const byKey = new Map(metrics.map((m) => [m.key, m]));
  const th = 'px-3 py-2 text-left font-normal whitespace-nowrap';
  // 來源（同名只列一次）
  const sources = [...new Map(rows.flatMap((r) => (r.level === 'metric' && r.source?.name ? [[r.source.name, r.source] as const] : []))).values()];
  return (
    <div className="space-y-2">
    <div className="overflow-x-auto rounded-xl border border-line bg-white">
      <table className="w-full min-w-[640px] text-[13.5px]">
        <thead className="border-b border-line bg-p-faint text-[12.5px] text-ink2">
          <tr>
            <th className={`${th} pl-5`}>{t.cols.label}</th>
            <th className={`${th} text-right`}>{t.cols.latest}</th>
            <th className={`${th} text-right`}>{t.cols.prev}</th>
            <th className={`${th} text-right`}>{t.cols.change}</th>
            <th className={`${th} pr-5`}>{t.cols.period}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const isOpen = open === r.metricKey && r.level === 'metric';
            const item = r.level === 'item';
            const metric = byKey.get(r.metricKey);
            return (
              <Fragment key={r.key}>
                <tr className={item ? 'text-ink2' : 'border-t border-line text-ink'}>
                  <td className={`py-2 pr-3 ${item ? 'pl-10' : 'pl-5'}`}>
                    <span className="inline-flex flex-wrap items-baseline gap-x-2">
                      <span className={item ? '' : 'font-medium'}>{r.label}</span>
                      {r.stale ? <StaleTag /> : null}
                      {r.chart ? (
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => setOpen(isOpen ? null : r.metricKey)}
                          className="text-[12.5px] whitespace-nowrap text-p hover:underline print:hidden"
                        >
                          {isOpen ? t.hideChart : t.showChart}
                        </button>
                      ) : null}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap tabular-nums">{r.latest}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap text-ink2 tabular-nums">{r.prev}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap tabular-nums">{r.change}</td>
                  <td className="py-2 pr-5 pl-3 whitespace-nowrap text-ink2">{r.period}</td>
                </tr>
                {isOpen && metric ? (
                  <tr>
                    <td colSpan={COLS} className="px-5 pt-1 pb-4">
                      <div className="rounded-lg bg-p-faint px-4 py-3">
                        <MetricChart metric={metric} />
                        {metric.asOf ? <p className="mt-2 text-xs text-muted">{zhTW.market.asOf(metric.asOf)}</p> : null}
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
      {sources.length > 0 ? (
        <p className="px-1 text-xs text-muted">
          {t.sources}
          {sources.map((src, i) => (
            <span key={src.name}>
              {i > 0 ? '、' : null}
              {src.url ? (
                <a href={src.url} target="_blank" rel="noopener noreferrer" className="hover:text-ink hover:underline">
                  {src.name}
                </a>
              ) : (
                src.name
              )}
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}
