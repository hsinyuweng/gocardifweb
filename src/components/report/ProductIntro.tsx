import type { ProductIntroViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';

const t = zhTW.report.intro;

/**
 * 報告頁最上面的商品概要（2026-11-01 使用者回饋）：左欄機制說明 → 目標客群、給付條件 → 保證項目與附約；
 * 右欄重點條件（承保年齡、繳費、保障期間、給付、上市）。險種已寫在頁首，這裡不重複。
 * 讀者是保險專業人員，照原文用專業詞；不用表格。
 */
export function ProductIntro({ intro }: { intro: ProductIntroViewModel }) {
  const lines = [
    { label: t.forWhom as string, text: intro.forWhom },
    { label: t.trigger as string, text: intro.trigger },
  ].flatMap((l) => (l.text !== null ? [{ label: l.label, text: l.text }] : []));
  const hasTags = intro.guarantees.length > 0 || intro.riders.length > 0;

  return (
    <section aria-label={t.title} className="grid gap-x-8 gap-y-4 rounded-xl border border-line bg-white px-6 pt-4 pb-5 lg:grid-cols-[minmax(0,1fr)_17rem]">
      <div className="min-w-0">
        <h2 className="mb-2 text-[13px] font-medium tracking-wide text-p-ink">{t.title}</h2>
        <p className="text-[16px] leading-relaxed text-ink">{intro.mechanism}</p>

        {lines.length > 0 ? (
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[14px]">
            {lines.map((l) => (
              <div key={l.label} className="contents">
                <dt className="pt-px text-[13px] whitespace-nowrap text-muted">{l.label}</dt>
                <dd className="leading-relaxed text-ink2">{l.text}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {hasTags ? (
          <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-[13px]">
            {intro.guarantees.map((g) => (
              <span key={g.feature} className="rounded-md bg-p-faint px-2 py-0.5 text-ink2 ring-1 ring-p-pale">
                {g.feature} <span className="font-medium text-ink">{g.value}</span>
              </span>
            ))}
            {intro.riders.length > 0 ? (
              <span className="text-ink2">
                <span className="mr-1.5 ml-1 text-muted">{t.riders}</span>
                {intro.riders.join('、')}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* 重點條件：寬螢幕放右欄（左邊細線分隔），窄螢幕接在下面 */}
      {intro.facts.length > 0 ? (
        <dl className="grid grid-cols-2 content-start gap-x-4 gap-y-2.5 border-t border-line pt-3 text-[13.5px] lg:grid-cols-1 lg:border-t-0 lg:border-l lg:pt-1 lg:pl-6">
          {intro.facts.map((f) => (
            <div key={f.label}>
              <dt className="text-xs text-muted">{f.label}</dt>
              <dd className="leading-snug font-medium text-ink">{f.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}
