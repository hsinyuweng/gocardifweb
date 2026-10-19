import type { ReactNode } from 'react';
import type { FeedItemViewModel } from '../../types/viewModel';
import { orDash, relativeTimeText } from '../../lib/format';

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

/** 第二行小字：來源 · 相對時間（＋額外內容） */
export function FeedMeta({ item, children }: { item: FeedItemViewModel; children?: ReactNode }) {
  return (
    <p className="mt-0.5 text-xs text-slate-500">
      {orDash(item.source)} · {relativeTimeText(item.publishedTime, item.dateOnly, item.publishedAt)}
      {children}
    </p>
  );
}
