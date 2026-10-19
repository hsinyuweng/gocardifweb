import type { FeedItemViewModel } from '../../types/viewModel';
import { orDash } from '../../lib/format';

/** 動態標題：有原文網址時在新分頁開啟 */
export function FeedTitle({ item }: { item: FeedItemViewModel }) {
  const title = orDash(item.title);
  if (item.url === null) return <span className="text-slate-900">{title}</span>;
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-slate-900 hover:text-navy-800 hover:underline">
      {title}
    </a>
  );
}
