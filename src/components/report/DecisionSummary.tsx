import type { DecisionSummaryViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';
import { DOT_CLASS, SOFT_BADGE_CLASS } from '../../lib/signalColor';

const t = zhTW.report;

/** B 區決策摘要（第 11.3 節 B） */
export function DecisionSummary({ summary: s }: { summary: DecisionSummaryViewModel }) {
  const meta = [s.issuer, s.countryLabel, s.category, s.currency, s.premiumMode].map(orDash).join(' · ');

  return (
    <section className="rounded border border-slate-200 bg-white px-5 py-4">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-slate-900">{orDash(s.name)}</h1>
          <p className="mt-1 text-xs text-slate-500">{meta}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="h-8 rounded border border-slate-300 bg-white px-3 text-slate-700 hover:border-navy-600 hover:text-navy-800"
          >
            {t.print}
          </button>
          <div className="text-right text-xs text-slate-500">
            <div>{t.generatedDate(orDash(s.generatedDate))}</div>
            <div>
              {t.reviewDates}
              {s.reviewDates.map((d) => `${d.moduleLabel} ${orDash(d.date)}`).join(' · ')}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center gap-2 rounded px-3 py-1 text-base font-semibold ring-1 ${
            SOFT_BADGE_CLASS[s.recommendation.color]
          }`}
        >
          <span aria-hidden className={`inline-block size-2.5 rounded-full ${DOT_CLASS[s.recommendation.color]}`} />
          {orDash(s.recommendation.text)}
        </span>
        <p className="text-base text-slate-800">{orDash(s.oneLineSummary)}</p>
      </div>

      <div className="mt-3">
        <h2 className="text-xs font-medium text-slate-500">{t.reasons}</h2>
        {s.reasons.length > 0 ? (
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-slate-700">
            {s.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-slate-700">{zhTW.common.none}</p>
        )}
      </div>

      <p className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-500">
        <span className="font-medium">{t.mechanism}：</span>
        {orDash(s.mechanismSummary)}
      </p>
    </section>
  );
}
