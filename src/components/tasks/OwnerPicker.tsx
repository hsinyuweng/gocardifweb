import type { OwnerCount } from '../../types/viewModel';

interface OwnerPickerProps {
  counts: OwnerCount[];
  onSelect: (owner: string) => void;
}

// 樣式與首頁建議分布列一致；窄螢幕時自動換行
const base =
  'inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-3 text-slate-700 ring-1 ring-slate-300 transition-colors hover:ring-navy-600 hover:text-navy-800';

/** 尚未選擇負責單位時：各單位件數按鈕，點擊即選擇 */
export function OwnerPicker({ counts, onSelect }: OwnerPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {counts.map((c) => (
        <button key={c.owner} type="button" className={base} onClick={() => onSelect(c.owner)}>
          <span>{c.owner}</span>
          <span className="text-slate-500">{c.count}</span>
        </button>
      ))}
    </div>
  );
}
