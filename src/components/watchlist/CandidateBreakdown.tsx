import type { ReactNode } from 'react';
import { formulaText, type CandidateScore, type DimensionScore } from '../../lib/score';
import { zhTW } from '../../i18n/zh-TW';
import { SignalLabel } from '../common/SignalLabel';

const t = zhTW.watchlist;
const c = t.breakdownColumns;

/** 「依據」欄：品牌有後端分數時顯示「後端評分」；市場成長用備援數字時顯示「市場脈動（備援）」 */
function basisText(d: DimensionScore): string {
  if (d.key === 'brandFit' && d.scoreSource === 'backend') return t.basisBrandFitBackend;
  if (d.key === 'marketGrowth' && d.backend?.basis === 'market_pulse') return t.basisMarketPulse;
  return t.basis[d.key];
}

/** 「說明」欄第二行：數值 · 資料日期 · 來源（有連結可點）；都沒有時為 null */
function DetailLine({ d }: { d: DimensionScore }) {
  const b = d.backend;
  if (!b) return null;
  const parts: ReactNode[] = [];
  if (b.valueText) parts.push(t.detailValue(b.valueText));
  if (b.source?.asOf) parts.push(t.detailAsOf(b.source.asOf));
  if (b.source?.name || b.source?.url) {
    const label = b.source.name ?? b.source.url;
    parts.push(
      <>
        {t.detailSource}
        {b.source.url ? (
          <a href={b.source.url} target="_blank" rel="noreferrer" className="break-all text-navy-700 hover:underline">
            {label}
          </a>
        ) : (
          <span className="break-all">{label}</span>
        )}
      </>,
    );
  }
  if (parts.length === 0) return null;
  return (
    <span className="block text-xs text-slate-500">
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 ? ' · ' : null}
          {p}
        </span>
      ))}
    </span>
  );
}

/** 計算明細（比較表展開的那一列）：各面向的依據、燈號、分數、權重、說明，以及實際算式 */
export function CandidateBreakdown({ score }: { score: CandidateScore }) {
  const formula = formulaText(score);
  return (
    <div className="min-w-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead className="border-b border-line text-ink2">
            <tr className="h-8">
              <th scope="col" className="pr-3 font-medium">{c.dimension}</th>
              <th scope="col" className="pr-3 font-medium">{c.basis}</th>
              <th scope="col" className="pr-3 font-medium">{c.signal}</th>
              <th scope="col" className="pr-3 font-medium">{c.score}</th>
              <th scope="col" className="pr-3 font-medium">{c.weight}</th>
              <th scope="col" className="font-medium">{c.rationale}</th>
            </tr>
          </thead>
          <tbody>
            {score.dims.map((d) => (
              <tr key={d.key} className="h-8 border-b border-line last:border-b-0">
                <td className="pr-3 text-ink">{t.dimensions[d.key]}</td>
                <td className="pr-3">{basisText(d)}</td>
                <td className="pr-3">{d.signal ? <SignalLabel signal={d.signal} /> : zhTW.common.dash}</td>
                <td className="pr-3 whitespace-nowrap tabular-nums">
                  {d.score === null ? t.notCounted : d.score}
                  {d.score !== null && d.backend?.level != null ? t.level(d.backend.level) : null}
                  {d.scoreSource === 'signal' ? <span className="ml-1.5 text-xs text-muted">{t.signalConverted}</span> : null}
                </td>
                <td className="pr-3 tabular-nums">{d.weight}</td>
                <td className="py-1 text-ink2">
                  {d.backend?.rationale ?? zhTW.common.dash}
                  {d.backend?.confidence ? t.confidence(d.backend.confidence) : null}
                  <DetailLine d={d} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted">
        {formula ? <span className="mr-2 tabular-nums text-ink2">{formula}</span> : null}
        {t.formula}
      </p>
    </div>
  );
}
