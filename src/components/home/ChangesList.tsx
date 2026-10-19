import { useState } from 'react';
import { Link } from 'react-router';
import type { FeedItemViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { FeedMeta, FeedTitle } from './FeedItemLine';

const t = zhTW.home;

interface ChangesListProps {
  items: FeedItemViewModel[];
  /** report_id → 商品名稱；查不到時顯示 report_id */
  reportNames: Map<string, string>;
}

/** 競品與法規異動卡片內容：類別標籤＋標題；有相關報告時可展開 */
export function ChangesList({ items, reportNames }: ChangesListProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  if (items.length === 0) return <p className="text-slate-500">{t.noFeedItems}</p>;

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const tag = item.category !== null ? t.changeTags[item.category] : undefined;
        const open = openId === item.id;
        const n = item.relatedReportIds.length;
        return (
          <li key={item.id} className="flex gap-2">
            {tag ? (
              <span className="mt-0.5 h-fit shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-navy-700 ring-1 ring-slate-200">
                {tag}
              </span>
            ) : null}
            <div className="min-w-0">
              <FeedTitle item={item} />
              <FeedMeta item={item}>
                {n > 0 ? (
                  <>
                    {' · '}
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenId(open ? null : item.id)}
                      className="text-navy-700 underline-offset-2 hover:underline"
                    >
                      {t.affects(n)}
                    </button>
                  </>
                ) : null}
              </FeedMeta>
              {open ? (
                <ul className="mt-1 space-y-0.5 border-l-2 border-slate-200 pl-3 text-sm">
                  {item.relatedReportIds.map((id) => (
                    <li key={id}>
                      <Link
                        to={`/report/${encodeURIComponent(id)}`}
                        state={{ from: '/' }}
                        className="text-navy-700 hover:underline"
                      >
                        {reportNames.get(id) ?? id}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
