import type { FilterOption } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';

const t = zhTW.overview;

interface OverviewToolbarProps {
  search: string;
  country: string;
  category: string;
  countryOptions: FilterOption[];
  categoryOptions: FilterOption[];
  onSearchChange: (v: string) => void;
  onCountryChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
}

const field =
  'h-9 rounded border border-slate-300 bg-white px-3 text-slate-800 focus:border-navy-600 focus:outline-none focus:ring-1 focus:ring-navy-600';

/** 工具列（第 11.2 節第 3 點）：只有搜尋、國家、險種三個篩選 */
export function OverviewToolbar(props: OverviewToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="search"
        value={props.search}
        onChange={(e) => props.onSearchChange(e.target.value)}
        placeholder={t.searchPlaceholder}
        aria-label={t.searchPlaceholder}
        className={`${field} w-full sm:w-72`}
      />
      <select
        value={props.country}
        onChange={(e) => props.onCountryChange(e.target.value)}
        aria-label={t.columns.country}
        className={field}
      >
        <option value="">{t.allCountries}</option>
        {props.countryOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <select
        value={props.category}
        onChange={(e) => props.onCategoryChange(e.target.value)}
        aria-label={t.columns.category}
        className={field}
      >
        <option value="">{t.allCategories}</option>
        {props.categoryOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
