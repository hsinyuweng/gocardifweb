import type { ReactNode } from 'react';
import type { DecisionSummaryViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';
import { DOT_CLASS, SOFT_BADGE_CLASS } from '../../lib/signalColor';

const t = zhTW.report;

// 報告頁 B 區（第 11.3 節 B；2026-10-27 V4 照閱讀路徑拆成三段）：
// ① 頁首（商品名、基本資料、流程一行字、列印、日期）② 一句結論（整體建議＋摘要）④ 判斷理由（理由、品牌定位、商品機制）

/** ① 頁首：商品名、發行公司 · 國家 · 險種 · 幣別 · 繳費；流程一行字；右側列印與產出、審閱日期 */
export function ReportHeader({ summary: s, flow }: { summary: DecisionSummaryViewModel; flow: ReactNode }) {
  const meta = [s.issuer, s.countryLabel, s.category, s.currency, s.premiumMode].map(orDash).join(' · ');
  return (
    <header className="flex flex-col gap-3 border-b border-p-pale pb-3.5 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
      <div className="min-w-0">
        <h1 className="text-[24px] leading-tight font-semibold text-ink">{orDash(s.name)}</h1>
        <p className="mt-1 text-[13px] text-ink2">{meta}</p>
        <div className="mt-1">{flow}</div>
      </div>
      <div className="flex shrink-0 flex-col items-start gap-1.5 lg:items-end">
        <button
          type="button"
          onClick={() => window.print()}
          className="h-8 rounded-full border border-line bg-white px-3.5 text-[13px] text-ink hover:border-p print:hidden"
        >
          {t.print}
        </button>
        <div className="text-xs text-muted lg:text-right">
          <div>{t.generatedDate(orDash(s.generatedDate))}</div>
          <div>
            {t.reviewDates}
            {s.reviewDates.map((d) => `${d.moduleLabel} ${orDash(d.date)}`).join(' · ')}
          </div>
        </div>
      </div>
    </header>
  );
}

/** ② 一句結論：整體建議標籤（色點＋文字）＋一句摘要（本頁最大的字） */
export function ReportLead({ summary: s }: { summary: DecisionSummaryViewModel }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <span
        className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-1 text-[15px] font-medium ring-1 ${
          SOFT_BADGE_CLASS[s.recommendation.color]
        }`}
      >
        <span aria-hidden className={`inline-block size-2.5 rounded-full ${DOT_CLASS[s.recommendation.color]}`} />
        {orDash(s.recommendation.text)}
      </span>
      <p className="min-w-0 flex-1 text-[24px] leading-snug font-medium text-balance text-ink">{orDash(s.oneLineSummary)}</p>
    </div>
  );
}

/** ④ 判斷理由：理由清單、品牌定位、商品機制 */
export function ReportReasons({ summary: s }: { summary: DecisionSummaryViewModel }) {
  return (
    <div className="space-y-3">
      {s.reasons.length > 0 ? (
        <ul className="list-disc space-y-1 pl-5 text-ink">
          {s.reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      ) : (
        <p className="text-ink2">{zhTW.common.none}</p>
      )}
      {s.brandNote ? (
        <p className="text-sm text-ink2">
          {t.brandNote}
          {s.brandNote.text}
          {s.brandNote.source?.url ? (
            <>
              {'（'}
              <a href={s.brandNote.source.url} target="_blank" rel="noopener noreferrer" className="text-ink underline-offset-2 hover:underline">
                {t.brandNoteSource}
              </a>
              {'）'}
            </>
          ) : null}
        </p>
      ) : null}
      <p className="border-t border-line pt-2.5 text-[13px] text-ink2">
        <span className="font-medium text-ink">{t.mechanism}：</span>
        {orDash(s.mechanismSummary)}
      </p>
    </div>
  );
}
