import { useState } from 'react';
import { Link } from 'react-router';
import type { FeedItemViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash, relativeTimeText } from '../../lib/format';
import { FeedTitle } from '../home/FeedItemLine';
import { FeedKindTag } from './FeedKindTag';

const t = zhTW.news;

type ProductLink = { id: string; name: string };

interface NewsItemProps {
  item: FeedItemViewModel;
  /** related_report_ids 中、在追蹤清單的商品（可能相關）；空陣列時不顯示 */
  affected: ProductLink[];
  /** 追蹤清單中與 affected_categories 同險種、但不在 affected 的商品；空陣列時不顯示 */
  sameCategory: ProductLink[];
  /** 進報告頁時帶的 location.state（麵包屑回到新聞與法規監控） */
  linkState: unknown;
}

/** 「可能相關…」「同險種…」的展開按鈕 */
function ToggleButton({ label, open, onClick }: { label: string; open: boolean; onClick: () => void }) {
  return (
    <>
      {' · '}
      <button type="button" aria-expanded={open} onClick={onClick} className="text-navy-700 underline-offset-2 hover:underline">
        {label} {open ? '▴' : '▾'}
      </button>
    </>
  );
}

/** 新聞與法規監控的一則：標籤＋標題、來源（業者自述）· 時間；法規可展開可能相關與同險種的追蹤商品 */
export function NewsItem({ item, affected, sameCategory, linkState }: NewsItemProps) {
  const [open, setOpen] = useState<'affected' | 'same' | null>(null);
  const toggle = (k: 'affected' | 'same') => setOpen(open === k ? null : k);
  const products = open === 'affected' ? affected : open === 'same' ? sameCategory : [];
  return (
    <li className="flex gap-2 px-4 py-3">
      <span className="mt-0.5 shrink-0">
        <FeedKindTag kind={item.kind} />
      </span>
      <div className="min-w-0">
        <FeedTitle item={item} />
        <p className="mt-0.5 text-xs text-slate-500">
          {orDash(item.source)}
          {item.selfReported ? (
            <span className="ml-1.5 inline-block rounded bg-slate-100 px-1 text-[11px] text-slate-500">{t.selfReported}</span>
          ) : null}
          {' · '}
          {relativeTimeText(item.publishedTime, item.dateOnly, item.publishedAt)}
          {affected.length > 0 ? (
            <ToggleButton label={t.affects(affected.length)} open={open === 'affected'} onClick={() => toggle('affected')} />
          ) : null}
          {sameCategory.length > 0 ? (
            <ToggleButton label={t.sameCategory(sameCategory.length)} open={open === 'same'} onClick={() => toggle('same')} />
          ) : null}
        </p>
        {products.length > 0 ? (
          <ul className="mt-1 space-y-0.5 border-l-2 border-slate-200 pl-3 text-sm">
            {products.map((p) => (
              <li key={p.id}>
                <Link to={`/report/${encodeURIComponent(p.id)}`} state={linkState} className="text-navy-700 hover:underline">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}
