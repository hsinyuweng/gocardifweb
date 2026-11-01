import { signedPct } from '../../lib/tone';

// 正負橫條（純 CSS，2026-11-01 第二輪）：成長往右藍色、衰退往左珊瑚紅，0 的位置依資料決定。
// 要標出的列（例如有候選商品的險種）實心、名稱粗體並加小標籤；其他列淡色。

export interface LineBarRow {
  name: string;
  value: number;
  strong?: boolean;
  /** 名稱旁的小標籤，例如「7 件候選」 */
  tag?: string | null;
}

export function LineBars({ rows, ariaLabel, compact = false }: { rows: LineBarRow[]; ariaLabel: string; compact?: boolean }) {
  if (rows.length === 0) return null;
  const pos = Math.max(0, ...rows.map((r) => r.value));
  const neg = Math.max(0, ...rows.map((r) => -r.value));
  const span = pos + neg || 1;
  const zero = (neg / span) * 100;
  return (
    <ul
      aria-label={ariaLabel}
      className={`grid grid-cols-[auto_1fr_auto] items-center gap-x-3 ${compact ? 'gap-y-1.5 text-[13px]' : 'gap-y-2.5 text-[14px]'}`}
    >
      {rows.map((r) => {
        const up = r.value >= 0;
        const w = (Math.abs(r.value) / span) * 100;
        const color = up ? (r.strong ? 'bg-good' : 'bg-good/30') : r.strong ? 'bg-coral' : 'bg-coral/35';
        return (
          <li key={r.name} className="contents" title={`${r.name}：${signedPct(r.value)}`}>
            <span className={`flex items-center gap-1.5 whitespace-nowrap ${r.strong ? 'font-medium text-ink' : 'text-ink2'}`}>
              {r.name}
              {r.tag ? <span className="rounded bg-p-pale px-1.5 py-px text-[11px] font-normal text-p-ink">{r.tag}</span> : null}
            </span>
            <span className={`relative ${compact ? 'h-2.5' : 'h-3.5'}`}>
              {neg > 0 ? <span aria-hidden className="absolute -inset-y-1 w-px bg-axis" style={{ left: `${zero}%` }} /> : null}
              <span
                className={`absolute inset-y-0 ${color} ${up ? 'rounded-r-md' : 'rounded-l-md'}`}
                style={up ? { left: `${zero}%`, width: `max(${w}%, 3px)` } : { right: `${100 - zero}%`, width: `max(${w}%, 3px)` }}
              />
            </span>
            <span
              className={`w-14 text-right tabular-nums ${up ? 'text-good' : 'text-coral'} ${r.strong ? 'font-semibold' : 'opacity-80'}`}
            >
              {signedPct(r.value)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
