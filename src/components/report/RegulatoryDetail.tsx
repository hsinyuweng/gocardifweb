import { useState } from 'react';
import type { FindingViewModel, ReportDetailsViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';
import { DOT_CLASS } from '../../lib/signalColor';
import { SignalLabel } from '../common/SignalLabel';
import { DetailBlock } from './DetailBlock';

const t = zhTW.report.details;
const c = t.findingColumns;

function FindingsTable({ findings }: { findings: FindingViewModel[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] border-collapse text-left">
        <thead className="border-b border-slate-200 text-slate-600">
          <tr className="h-10">
            <th scope="col" className="w-24 px-3 font-medium">{c.itemId}</th>
            <th scope="col" className="px-3 font-medium">{c.title}</th>
            <th scope="col" className="w-24 px-3 font-medium">{c.light}</th>
            <th scope="col" className="px-3 font-medium">{c.law}</th>
            <th scope="col" className="px-3 font-medium">{c.remedy}</th>
            <th scope="col" className="w-28 px-3 font-medium">{c.owner}</th>
          </tr>
        </thead>
        <tbody>
          {findings.map((f, i) => (
            <tr key={f.itemId ?? `f-${i}`} className="border-b border-slate-100 align-top last:border-b-0">
              <td className="px-3 py-2 whitespace-nowrap text-slate-600 tabular-nums">{orDash(f.itemId)}</td>
              <td className="px-3 py-2 text-slate-900">
                {orDash(f.title)}
                {f.suspectedRed ? (
                  <span className="ml-2 inline-block rounded bg-red-50 px-1.5 py-0.5 text-xs font-semibold text-red-700 ring-1 ring-red-200">
                    {t.suspectedRed}
                  </span>
                ) : null}
              </td>
              <td className="px-3 py-2"><SignalLabel signal={f.light} /></td>
              <td className="px-3 py-2 text-slate-700">{orDash(f.law)}</td>
              <td className="px-3 py-2 text-slate-700">{orDash(f.remedy)}</td>
              <td className="px-3 py-2 whitespace-nowrap">{orDash(f.owner)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const chip = 'inline-flex h-7 items-center gap-1.5 rounded-full px-3 ring-1 transition-colors';
const on = 'bg-navy-800 text-white ring-navy-800';
const off = 'bg-white text-slate-700 ring-slate-300 hover:ring-slate-400';

/** E 區：法規適用。燈號篩選只影響畫面；列印時一律印出全部 findings */
export function RegulatoryDetail({ detail }: { detail: ReportDetailsViewModel['regulatory'] }) {
  const [light, setLight] = useState<string | null>(null);
  const filtered = light === null ? detail.findings : detail.findings.filter((f) => f.lightKey === light);

  return (
    <div className="space-y-5">
      <DetailBlock title={t.summary}>
        <p className="text-slate-800">{orDash(detail.summary)}</p>
      </DetailBlock>

      <div>
        {detail.findings.length === 0 ? (
          <p className="text-slate-600">{zhTW.common.none}</p>
        ) : (
          <>
            <div className="mb-2 flex flex-wrap items-center gap-2 print:hidden">
              <button type="button" className={`${chip} ${light === null ? on : off}`} onClick={() => setLight(null)}>
                {t.lightAll} <span className={light === null ? 'text-white/80' : 'text-slate-500'}>{detail.findings.length}</span>
              </button>
              {detail.lightOptions.map((o) => {
                const active = light === o.key;
                return (
                  <button
                    key={o.key}
                    type="button"
                    aria-pressed={active}
                    className={`${chip} ${active ? on : off}`}
                    onClick={() => setLight(active ? null : o.key)}
                  >
                    <span aria-hidden className={`inline-block size-2 rounded-full ${DOT_CLASS[o.color]}`} />
                    {o.label} <span className={active ? 'text-white/80' : 'text-slate-500'}>{o.count}</span>
                  </button>
                );
              })}
            </div>
            <div className="print:hidden">
              {filtered.length > 0 ? (
                <FindingsTable findings={filtered} />
              ) : (
                <p className="text-slate-600">{t.noLightMatch}</p>
              )}
            </div>
            <div className="hidden print:block">
              <FindingsTable findings={detail.findings} />
            </div>
          </>
        )}
      </div>

      <DetailBlock title={t.keyLaws}>
        {detail.keyLaws.length === 0 ? (
          <p className="text-slate-600">{zhTW.common.none}</p>
        ) : (
          <ul className="list-disc space-y-0.5 pl-5 text-slate-800">
            {detail.keyLaws.map((law, i) => (
              <li key={i}>{law}</li>
            ))}
          </ul>
        )}
      </DetailBlock>
    </div>
  );
}
