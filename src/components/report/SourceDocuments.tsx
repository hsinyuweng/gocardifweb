import type { SourceDocumentViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';
import { StorySection } from '../story/StorySection';

const t = zhTW.report.sourceDocs;

/** 商品原始資料（2026-10-31）：類型、標題（新分頁）、發布日期。列印時附網址 */
export function SourceDocuments({ docs, id, onBack }: { docs: SourceDocumentViewModel[]; id?: string; onBack: () => void }) {
  return (
    <StorySection
      id={id}
      heading={
        <span className="flex flex-wrap items-baseline justify-between gap-2">
          <span>{t.title(docs.length)}</span>
          <button type="button" onClick={onBack} className="text-[13px] font-normal text-ink2 hover:text-ink hover:underline print:hidden">
            {t.back}
          </button>
        </span>
      }
    >
      <p className="-mt-2 text-[13px] text-ink2">{t.note}</p>
      <ul className="divide-y divide-line">
        {docs.map((d, i) => (
          <li key={i} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2">
            {d.type ? <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-ink2">{d.type}</span> : null}
            <a href={d.url} target="_blank" rel="noopener noreferrer" className="min-w-0 text-ink hover:underline">
              {orDash(d.title)} ↗
            </a>
            {d.date ? <span className="text-xs text-muted tabular-nums">{d.date}</span> : null}
            <span className="hidden w-full text-xs break-all text-muted print:block">{d.url}</span>
          </li>
        ))}
      </ul>
    </StorySection>
  );
}
