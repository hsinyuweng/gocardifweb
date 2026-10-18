import type { ReportDetailsViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';
import { DetailBlock } from './DetailBlock';
import { KeyPointList } from './KeyPointList';

const t = zhTW.report.details;
const c = t.pricingColumns;

/** E 區：發生率暨獲利 */
export function ActuarialDetail({ detail }: { detail: ReportDetailsViewModel['actuarial'] }) {
  return (
    <div className="space-y-5">
      <DetailBlock title={t.summary}>
        <p className="text-slate-800">{orDash(detail.summary)}</p>
      </DetailBlock>
      <DetailBlock title={t.keyPoints}>
        <KeyPointList points={detail.keyPoints} />
      </DetailBlock>
      <DetailBlock title={t.pricingFlags}>
        {detail.pricingFlags.length === 0 ? (
          <p className="text-slate-600">{zhTW.common.none}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-left">
              <thead className="border-b border-slate-200 text-slate-600">
                <tr className="h-10">
                  <th scope="col" className="px-3 font-medium">{c.topic}</th>
                  <th scope="col" className="px-3 font-medium">{c.direction}</th>
                  <th scope="col" className="w-24 px-3 font-medium">{c.sourceCount}</th>
                </tr>
              </thead>
              <tbody>
                {detail.pricingFlags.map((p, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-3 py-2 text-slate-900">{orDash(p.topic)}</td>
                    <td className="px-3 py-2">{orDash(p.direction)}</td>
                    <td className="px-3 py-2 tabular-nums">{orDash(p.sourceCount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DetailBlock>
    </div>
  );
}
