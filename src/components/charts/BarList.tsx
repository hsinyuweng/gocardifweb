// 占比橫條清單（純 CSS，2026-11-01 第二輪）：名稱｜橫條｜數字。要標出的那一列代表色實心、粗字，其他淡色。
// 橫條長度以列出的最大值為 100%。

export interface BarListRow {
  key: string;
  name: string;
  value: number;
  text: string;
  strong?: boolean;
}

export function BarList({ rows, ariaLabel }: { rows: BarListRow[]; ariaLabel: string }) {
  const max = Math.max(0, ...rows.map((r) => r.value)) || 1;
  return (
    <ul aria-label={ariaLabel} className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-2 text-[13.5px]">
      {rows.map((r) => (
        <li key={r.key} className="contents" title={`${r.name}：${r.text}`}>
          <span className={`max-w-[11rem] truncate ${r.strong ? 'font-medium text-p-ink' : 'text-ink2'}`}>{r.name}</span>
          <span className="h-3">
            <span className={`block h-full rounded-md ${r.strong ? 'bg-p' : 'bg-p-pale'}`} style={{ width: `max(${(r.value / max) * 100}%, 3px)` }} />
          </span>
          <span className={`text-right tabular-nums ${r.strong ? 'font-semibold text-p-ink' : 'text-ink2'}`}>{r.text}</span>
        </li>
      ))}
    </ul>
  );
}
