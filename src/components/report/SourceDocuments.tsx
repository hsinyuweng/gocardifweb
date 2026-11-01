import type { SourceDocumentViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';

const t = zhTW.report.sourceDocs;

/** 商品原始資料（2026-11-01 收成一行，點開才列）：類型、標題（新分頁）、發布日期。列印時附網址 */
export function SourceDocuments({ docs, id }: { docs: SourceDocumentViewModel[]; id?: string }) {
  return (
    <details id={id} className="scroll-mt-28 rounded-xl border border-line bg-white px-7 py-4">
      <summary className="cursor-pointer text-[15px] text-ink marker:text-muted">{zhTW.report.sourceDocsToggle(docs.length)}</summary>
      <p className="mt-2 text-[13px] text-ink2">{t.note}</p>
      <ul className="divide-y divide-line">
        {docs.map((d, i) => (
          <li key={i} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2">
            {d.type ? <span className="shrink-0 rounded-md bg-line px-1.5 py-0.5 text-xs text-ink2">{d.type}</span> : null}
            <a href={d.url} target="_blank" rel="noopener noreferrer" className="min-w-0 text-ink hover:underline">
              {orDash(d.title)} ↗
            </a>
            {d.date ? <span className="text-xs text-muted tabular-nums">{d.date}</span> : null}
            <span className="hidden w-full text-xs break-all text-muted print:block">{d.url}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="mt-1 text-[13px] text-ink2 hover:text-ink hover:underline print:hidden"
      >
        {t.back}
      </button>
    </details>
  );
}
