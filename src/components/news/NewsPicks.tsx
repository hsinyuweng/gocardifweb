import type { NewsPick } from '../../lib/newsPicks';
import { zhTW } from '../../i18n/zh-TW';
import { companyOf } from '../../lib/feedSummary';
import { relativeTimeText } from '../../lib/format';
import { FeedKindTag } from './FeedKindTag';

const t = zhTW.news;

/**
 * 重點新聞（2026-11-01 第二輪）：新聞頁最上面一張卡，列和法巴、候選商品最有關的幾則。
 * 每則：理由標籤＋〔新聞／法規〕標題（公司）＋時間＋原文 ↗，下一行 AI 摘要。下面全部動態裡同一則前面標 ★。
 */
export function NewsPicks({ picks }: { picks: NewsPick[] }) {
  if (picks.length === 0) return null;
  return (
    <section className="overflow-hidden rounded-xl border-2 border-p bg-white">
      <h2 className="flex items-baseline gap-2 border-b border-line bg-p-faint px-5 py-2.5">
        <span aria-hidden className="text-amber-500">★</span>
        <span className="text-[17px] font-medium text-ink">{t.pick.heading}</span>
        <span className="text-[12.5px] text-muted">{t.pick.note}</span>
      </h2>
      <ol className="divide-y divide-line">
        {picks.map(({ item, reasons }) => {
          const company = companyOf(item.source);
          return (
            <li key={item.id} className="px-5 py-3">
              <div className="mb-1 flex flex-wrap gap-1.5">
                {reasons.map((r) => (
                  <span key={r} className="rounded-md bg-p-pale px-2 py-px text-[12px] font-medium text-p-ink">
                    {r}
                  </span>
                ))}
              </div>
              <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                <FeedKindTag kind={item.kind} />
                <span className="min-w-0 text-[15px] font-medium text-ink">
                  {item.title ?? zhTW.common.dash}
                  {company ? <span className="font-normal text-ink2">{t.company(company)}</span> : null}
                </span>
                <span className="text-xs whitespace-nowrap text-muted">
                  {relativeTimeText(item.publishedTime, item.dateOnly, item.publishedAt)}
                </span>
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs whitespace-nowrap text-p-ink hover:underline">
                    {t.original}
                  </a>
                ) : null}
              </p>
              {item.summary ? <p className="mt-0.5 text-[13px] text-ink2">{item.summary}</p> : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
