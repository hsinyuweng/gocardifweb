// 橫條清單（純 CSS）：名稱、橫條、數字。第 1 名代表色深、第 2 名中、其他淡；
// strong 的那一列數字用珊瑚色（例如「監理法規 0」）。0 的列不畫條，只寫 0。

export interface HBarRow {
  key: string;
  name: string;
  value: number;
  strong?: boolean;
}

const BAR = ['bg-p', 'bg-p-mid', 'bg-p-pale'];

export function HBarList({ rows, ariaLabel, unit = '' }: { rows: HBarRow[]; ariaLabel: string; unit?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul aria-label={ariaLabel} className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 text-[12.5px]">
      {rows.map((r, i) => (
        <li key={r.key} className="contents" title={`${r.name}：${r.value}${unit}`}>
          <span className="max-w-[9rem] truncate text-ink2">{r.name}</span>
          <span className="flex min-w-0 items-center gap-1.5">
            {r.value > 0 ? (
              <span
                className={`h-2.5 shrink-0 rounded ${BAR[Math.min(i, BAR.length - 1)]}`}
                style={{ width: `calc((100% - 2.5rem) * ${r.value / max})`, minWidth: 4 }}
              />
            ) : null}
            <span className={`tabular-nums ${r.strong ? 'font-medium text-coral' : 'text-ink2'}`}>{r.value}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
