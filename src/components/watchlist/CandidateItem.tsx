import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { formulaText, type Candidate, type DimensionScore } from '../../lib/score';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';
import { SignalLabel } from '../common/SignalLabel';

const t = zhTW.watchlist;
const c = t.breakdownColumns;

const linkButton = 'text-sm text-navy-700 hover:underline';

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

interface CandidateItemProps {
  rank: number;
  candidate: Candidate;
  expanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
  /** 進報告頁時帶的 location.state（麵包屑回到追蹤清單） */
  linkState: unknown;
}

/** 追蹤清單一列：名次、商品、綜合分數、計算明細、移出 */
export function CandidateItem({ rank, candidate, expanded, onToggle, onRemove, linkState }: CandidateItemProps) {
  const { row, score } = candidate;
  const formula = formulaText(score);
  return (
    <li className="px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="w-6 shrink-0 text-right tabular-nums text-slate-500">{rank}</span>
        <div className="min-w-0 flex-1">
          <Link
            to={`/report/${encodeURIComponent(row.reportId as string)}`}
            state={linkState}
            className="font-semibold text-slate-900 hover:text-navy-800 hover:underline"
          >
            {orDash(row.name)}
          </Link>
          <div className="text-xs text-slate-500">
            {orDash(row.issuer)} · {orDash(row.countryLabel)}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <span className="text-right">
            <span className="block text-[11px] text-slate-500">{t.scoreLabel}</span>
            <span className="text-2xl font-semibold tabular-nums text-navy-800">{orDash(score.total)}</span>
            {score.missing.length > 0 ? (
              <span className="block text-[11px] text-slate-500">
                {t.missingDims(score.missing.map((k) => t.dimensions[k]).join('、'))}
              </span>
            ) : null}
          </span>
          <button type="button" aria-expanded={expanded} onClick={onToggle} className={linkButton}>
            {t.breakdown} {expanded ? '▴' : '▾'}
          </button>
          <button type="button" onClick={onRemove} className={linkButton}>
            {t.remove}
          </button>
        </div>
      </div>
      {expanded ? (
        <div className="mt-3 ml-10 min-w-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-600">
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
                  <tr key={d.key} className="h-8 border-b border-slate-100 last:border-b-0">
                    <td className="pr-3 text-slate-900">{t.dimensions[d.key]}</td>
                    <td className="pr-3">{basisText(d)}</td>
                    <td className="pr-3">{d.signal ? <SignalLabel signal={d.signal} /> : zhTW.common.dash}</td>
                    <td className="pr-3 whitespace-nowrap tabular-nums">
                      {d.score === null ? t.notCounted : d.score}
                      {d.score !== null && d.backend?.level != null ? t.level(d.backend.level) : null}
                      {d.scoreSource === 'signal' ? <span className="ml-1.5 text-xs text-slate-500">{t.signalConverted}</span> : null}
                    </td>
                    <td className="pr-3 tabular-nums">{d.weight}</td>
                    <td className="py-1 text-slate-600">
                      {d.backend?.rationale ?? zhTW.common.dash}
                      {d.backend?.confidence ? t.confidence(d.backend.confidence) : null}
                      <DetailLine d={d} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {formula ? <span className="mr-2 tabular-nums text-slate-700">{formula}</span> : null}
            {t.formula}
          </p>
        </div>
      ) : null}
    </li>
  );
}
