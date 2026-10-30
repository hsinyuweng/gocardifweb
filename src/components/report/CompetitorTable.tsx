import type { CompetitorComparisonViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';
import { StorySection } from '../story/StorySection';
import { evidenceNote } from '../../lib/grade';
import { GradeNote } from '../common/GradeNote';

const t = zhTW.report.competitors;

/** 一句標題：直接競品幾項、類似商品幾項；沒有直接競品時照實寫 */
function heading(c: CompetitorComparisonViewModel): string {
  const direct = c.competitors.filter((x) => x.isDirect).length;
  const other = c.competitors.length - direct;
  return c.hasDirect && direct > 0 ? t.headingDirect(direct, other) : t.headingNone(c.competitors.length);
}

/**
 * 台灣競品比較（後端需求 M1，2026-10-31）：欄＝每項競品（名稱、發行公司、直接競品／類似商品、條款連結），
 * 列＝比較項目；下方差異分析依證據等級分段。表格太寬時只有表格本身左右捲動。
 */
export function CompetitorTable({ data: c, id }: { data: CompetitorComparisonViewModel; id?: string }) {
  const note = evidenceNote(c.gapAnalysis.map((g) => g.level));
  return (
    <StorySection id={id} heading={heading(c)}>
      {c.noCompetitorReason ? <p className="text-ink2">{c.noCompetitorReason}</p> : null}
      {c.competitors.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-[720px] table-fixed border-collapse text-[13.5px]">
            <colgroup>
              <col className="w-36" />
              {c.competitors.map((_, i) => (
                <col key={i} />
              ))}
            </colgroup>
            <thead className="bg-p-faint align-top">
              <tr>
                <th className="px-3 py-2.5 text-left text-[12.5px] font-normal text-ink2">{t.dimension}</th>
                {c.competitors.map((x, i) => (
                  <th key={i} className="border-l border-line px-3 py-2.5 text-left font-normal">
                    <div className="font-medium text-ink">{orDash(x.name)}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-ink2">
                      <span>{orDash(x.issuer)}</span>
                      <span className={`rounded px-1.5 py-px text-[11.5px] ${x.isDirect ? 'bg-p-pale text-ink' : 'bg-slate-100 text-ink2'}`}>
                        {x.isDirect ? t.direct : t.similar}
                      </span>
                      {x.sourceUrl ? (
                        <a href={x.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-ink2 hover:text-ink hover:underline print:hidden">
                          {t.source}
                        </a>
                      ) : null}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="align-top">
              {c.rows.map((row) => (
                <tr key={row.label} className="border-t border-line">
                  <th scope="row" className="px-3 py-2.5 text-left text-[12.5px] font-normal text-ink2">
                    {row.label}
                  </th>
                  {row.cells.map((cell, i) => (
                    <td key={i} className="border-l border-line px-3 py-2.5 leading-relaxed text-ink">
                      {orDash(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {c.gapAnalysis.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-[13px] text-ink2">{t.gapTitle}</h3>
          <ul className="space-y-2">
            {c.gapAnalysis.map((g, i) => (
              <li key={i} className="flex items-start gap-2">
                {g.level ? (
                  <span className="mt-0.5 shrink-0 rounded bg-navy-800/10 px-1.5 py-0.5 text-xs text-navy-800">{t.level(g.level)}</span>
                ) : null}
                <p className="leading-relaxed text-ink">{g.text}</p>
              </li>
            ))}
          </ul>
          <GradeNote>{note}</GradeNote>
        </div>
      ) : null}
    </StorySection>
  );
}
