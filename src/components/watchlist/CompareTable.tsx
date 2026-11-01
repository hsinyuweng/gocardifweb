import { Link } from 'react-router';
import type { OverviewRow } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';
import { legalText } from '../../lib/legal';
import { blockingOf, marketOf } from '../../lib/researchStory';
import { DOT_CLASS } from '../../lib/signalColor';
import { TONE_TEXT } from '../../lib/tone';
import { ScoreBar } from '../common/ScoreBar';

const t = zhTW.watchlist;
const c = zhTW.overview.columns;

interface CompareTableProps {
  /** 已依引進分數排好（lib/researchStory.ts 的 rankRows） */
  rows: OverviewRow[];
  onRemove: (id: string, name: string) => void;
  /** 進報告頁帶的 location.state（含上一份／下一份的順序） */
  linkState: unknown;
}

/** 潛在市場：長條在左、金額在右，長條依金額比例（2026-11-01 使用者回饋：0–100 分數全是 100，分不出差別） */
function MarketCell({ row, max }: { row: OverviewRow; max: number }) {
  const v = marketOf(row);
  const text = row.dimensionScores?.marketSize?.valueText;
  if (v < 0 || !text) return <span className="text-muted">{zhTW.common.dash}</span>;
  return (
    <span className="flex items-center gap-2.5">
      <span className="h-2 w-24 shrink-0 overflow-hidden rounded-full bg-p-faint">
        <span className="block h-full rounded-full bg-p-mid" style={{ width: `${Math.max(3, (v / max) * 100)}%` }} />
      </span>
      <span className="whitespace-nowrap tabular-nums text-ink">{text}</span>
    </span>
  );
}

/**
 * 追蹤清單比較表（2026-11-01 使用者回饋）：依引進分數排序（同分依建議 → 阻斷少 → 潛在市場大）。
 * 欄位與競品研究列表一致：引進分數、整體建議、法規（能不能引進）、潛在市場、阻斷、台灣競品。
 */
export function CompareTable({ rows, onRemove, linkState }: CompareTableProps) {
  const max = Math.max(1, ...rows.map(marketOf));
  return (
    <div className="relative overflow-x-auto rounded-xl border border-line bg-white">
      <table className="w-full min-w-[1060px] border-collapse text-left">
        <thead className="border-b border-line text-[13px] text-ink2">
          <tr className="h-11">
            <th scope="col" className="w-14 px-3 text-right font-medium">{t.compare.rank}</th>
            <th scope="col" className="px-3 font-medium">{t.compare.product}</th>
            <th scope="col" className="px-3 font-medium">{zhTW.score.column}</th>
            <th scope="col" className="px-3 font-medium">{c.recommendation}</th>
            <th scope="col" className="px-3 font-medium">{c.feasibility}</th>
            <th scope="col" className="px-3 font-medium">{c.market}</th>
            <th scope="col" className="px-3 font-medium">{c.blocking}</th>
            <th scope="col" className="px-3 font-medium">{c.competitors}</th>
            <th scope="col" className="px-3 font-medium">
              <span className="sr-only">{t.compare.actions}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const id = row.reportId as string;
            const legal = legalText(row.legal);
            const blocking = blockingOf(row);
            return (
              <tr key={id} className="border-b border-line align-middle last:border-b-0">
                <td className="px-3 py-3 text-right tabular-nums text-muted">{i + 1}</td>
                <td className="max-w-[16rem] px-3 py-3">
                  <Link
                    to={`/report/${encodeURIComponent(id)}`}
                    state={linkState}
                    title={row.name ?? undefined}
                    className="font-medium text-ink hover:underline"
                  >
                    {orDash(row.shortName)}
                  </Link>
                  <div className="truncate text-xs text-muted" title={row.issuer ?? undefined}>
                    {orDash(row.issuer)} · {orDash(row.countryLabel)}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <ScoreBar row={row} />
                </td>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] text-ink">
                    <span aria-hidden className={`inline-block size-2 rounded-full ${DOT_CLASS[row.recommendation.color]}`} />
                    {orDash(row.recommendation.text)}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-[13px]">
                  {legal ? <span className={legal.tone ? TONE_TEXT[legal.tone] : 'text-ink2'}>{legal.text}</span> : zhTW.common.dash}
                </td>
                <td className="px-3 py-3">
                  <MarketCell row={row} max={max} />
                </td>
                <td className="px-3 py-3">
                  <span className={`tabular-nums ${blocking > 0 ? 'text-ink' : 'text-muted'}`}>{zhTW.overview.blockingCount(blocking)}</span>
                  {row.topBlocker ? <div className="max-w-[220px] truncate text-xs text-muted" title={row.topBlocker}>{row.topBlocker}</div> : null}
                </td>
                <td className="px-3 py-3 whitespace-nowrap tabular-nums">
                  {row.directCompetitors !== null ? zhTW.overview.competitorCount(row.directCompetitors) : zhTW.common.dash}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onRemove(id, row.shortName ?? id)}
                    className="text-sm text-ink2 hover:text-ink hover:underline"
                  >
                    {t.remove}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
