import { zhTW } from '../../i18n/zh-TW';

interface OwnerFilterProps {
  options: string[];
  /** null 表示「全部」 */
  selected: string | null;
  onChange: (owner: string | null) => void;
}

/** 負責單位篩選（D7） */
export function OwnerFilter({ options, selected, onChange }: OwnerFilterProps) {
  return (
    <label className="inline-flex items-center gap-2 text-slate-600">
      {zhTW.report.ownerFilter}
      <select
        value={selected ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
        className="h-8 rounded border border-slate-300 bg-white px-2 text-slate-800 focus:border-navy-600 focus:outline-none focus:ring-1 focus:ring-navy-600"
      >
        <option value="">{zhTW.report.ownerAll}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
