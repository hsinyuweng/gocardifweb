import { useState } from 'react';
import { Link } from 'react-router';
import type { FilterOption } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { updatedText } from '../../lib/format';
import { sameWatchItem, watchItemCasesPath, watchItemLabel, type WatchItem, type WatchMatch } from '../../lib/watchlist';
import { HomeCard } from './HomeCard';

const t = zhTW.watchlist;

interface WatchlistCardProps {
  items: Array<{ item: WatchItem; match: WatchMatch }>;
  categoryOptions: FilterOption[];
  countryOptions: FilterOption[];
  onAdd: (item: WatchItem) => void;
  onRemove: (item: WatchItem) => void;
}

const selectClass =
  'h-9 min-w-0 rounded border border-slate-300 bg-white px-2 text-slate-800 focus:border-navy-600 focus:outline-none focus:ring-1 focus:ring-navy-600';

/** 新增追蹤：險種＋市場下拉，加入／取消 */
function AddForm({
  existing,
  categoryOptions,
  countryOptions,
  onAdd,
  onClose,
}: {
  existing: WatchItem[];
  categoryOptions: FilterOption[];
  countryOptions: FilterOption[];
  onAdd: (item: WatchItem) => void;
  onClose: () => void;
}) {
  const [category, setCategory] = useState('');
  const [country, setCountry] = useState('');
  const item: WatchItem = { category: category || null, country: country || null };
  const bothAll = item.category === null && item.country === null;
  const duplicate = !bothAll && existing.some((i) => sameWatchItem(i, item));

  return (
    <div className="space-y-2 rounded border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap gap-2">
        <select aria-label={t.categoryLabel} value={category} onChange={(e) => setCategory(e.target.value)} className={`${selectClass} flex-1`}>
          <option value="">{t.allCategories}</option>
          {categoryOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select aria-label={t.countryLabel} value={country} onChange={(e) => setCountry(e.target.value)} className={selectClass}>
          <option value="">{t.allCountries}</option>
          {countryOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={bothAll || duplicate}
          onClick={() => {
            onAdd(item);
            onClose();
          }}
          className="h-8 rounded bg-navy-800 px-3 text-white hover:bg-navy-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {t.confirmAdd}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="h-8 rounded border border-slate-300 bg-white px-3 text-slate-700 hover:border-navy-600 hover:text-navy-800"
        >
          {t.cancel}
        </button>
        {duplicate ? <span className="text-xs text-slate-500">{t.duplicate}</span> : null}
      </div>
    </div>
  );
}

/** 我的追蹤清單卡片：每列連到案件總覽並帶好篩選 */
export function WatchlistCard({ items, categoryOptions, countryOptions, onAdd, onRemove }: WatchlistCardProps) {
  const [adding, setAdding] = useState(false);

  return (
    <HomeCard icon="watchlist" title={zhTW.home.cards.watchlist}>
      {items.length === 0 ? <p className="mb-3 text-slate-500">{t.empty}</p> : null}
      {items.length > 0 ? (
        <ul className="mb-3 divide-y divide-slate-100">
          {items.map(({ item, match }) => (
            <li key={`${item.category ?? ''}|${item.country ?? ''}`} className="flex items-center gap-2">
              <Link
                to={watchItemCasesPath(item)}
                state={{ from: '/' }}
                className="group flex min-w-0 flex-1 items-center justify-between gap-3 py-2.5"
              >
                <span className="min-w-0">
                  <span className="block text-slate-900 group-hover:text-navy-800 group-hover:underline">
                    {watchItemLabel(item)}
                  </span>
                  {match.count > 0 ? <span className="text-xs text-slate-500">{t.productCount(match.count)}</span> : null}
                </span>
                <span className="shrink-0 text-right text-xs text-slate-500">
                  {match.latestDate !== null ? updatedText(match.latestDate) : t.noMatch}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => onRemove(item)}
                title={t.remove}
                aria-label={`${t.remove}：${watchItemLabel(item)}`}
                className="shrink-0 rounded px-1.5 py-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {adding ? (
        <AddForm
          existing={items.map((i) => i.item)}
          categoryOptions={categoryOptions}
          countryOptions={countryOptions}
          onAdd={onAdd}
          onClose={() => setAdding(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="h-10 w-full rounded border border-slate-300 bg-white text-slate-700 hover:border-navy-600 hover:text-navy-800"
        >
          {t.add}
        </button>
      )}
    </HomeCard>
  );
}
