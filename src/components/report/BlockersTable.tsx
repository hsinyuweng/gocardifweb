import type { BlockerViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';
import { SignalLabel } from '../common/SignalLabel';

const c = zhTW.report.blockerColumns;

/**
 * 待解決事項表格（第 11.3 節 D）；傳入前已排序與篩選。
 * collapsed 的列畫面上不顯示、列印時顯示（2026-10-27 V4：預設只列重大與阻斷）。
 */
export function BlockersTable({ blockers, collapsed }: { blockers: BlockerViewModel[]; collapsed?: (b: BlockerViewModel) => boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead className="border-b border-line text-ink2">
          <tr className="h-10">
            <th scope="col" className="w-24 px-3 font-medium">{c.severity}</th>
            <th scope="col" className="w-32 px-3 font-medium">{c.module}</th>
            <th scope="col" className="px-3 font-medium">{c.title}</th>
            <th scope="col" className="w-28 px-3 font-medium">{c.owner}</th>
            <th scope="col" className="px-3 font-medium">{c.action}</th>
          </tr>
        </thead>
        <tbody>
          {blockers.map((b, i) => (
            <tr
              key={b.id ?? `bl-${i}`}
              className={`border-b border-line align-top last:border-b-0 ${collapsed?.(b) ? 'hidden print:table-row' : ''}`}
            >
              <td className="px-3 py-2"><SignalLabel signal={b.severity} /></td>
              <td className="px-3 py-2 text-ink2">{orDash(b.moduleLabel)}</td>
              <td className="px-3 py-2 text-ink">{orDash(b.title)}</td>
              <td className="px-3 py-2 whitespace-nowrap">{orDash(b.ownerText)}</td>
              <td className="px-3 py-2 text-ink">{orDash(b.action)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
