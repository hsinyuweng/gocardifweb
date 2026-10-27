import type { OverviewRow } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';
import { MODULE_FIELDS, moduleSignals } from '../../lib/researchStory';
import { DOT_CLASS } from '../../lib/signalColor';

/** 三面向燈號表（2026-10-27 V6）：每個面向一列，「● 明確需求 4 · ● 有限需求 5」（燈號一律色點＋文字） */
export function ModuleSignalTable({ rows }: { rows: OverviewRow[] }) {
  const labels = zhTW.overview.columns;
  return (
    <table className="w-full text-[13.5px]">
      <tbody>
        {MODULE_FIELDS.map((f) => (
          <tr key={f} className="border-t border-line first:border-t-0">
            <th scope="row" className="w-28 py-2.5 pr-3 text-left font-normal whitespace-nowrap text-ink2">
              {labels[f]}
            </th>
            <td className="py-2.5">
              <span className="flex flex-wrap gap-x-4 gap-y-1">
                {moduleSignals(rows, f).map((s) => (
                  <span key={`${s.color}|${s.text}`} className="inline-flex items-center gap-1.5 whitespace-nowrap text-ink">
                    <span aria-hidden className={`size-2 rounded-full ${DOT_CLASS[s.color]}`} />
                    {orDash(s.text)}
                    <span className="tabular-nums text-ink2">{s.count}</span>
                  </span>
                ))}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
