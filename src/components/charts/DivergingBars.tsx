// 正負橫條（純 CSS）：0 在左側，正值往右、負值往左；正負用同一個比例尺，太短的條至少 3px。
// 直接標數字；強調的那一列用珊瑚色，其他用目前頁面代表色深淺。

export interface DivergingRow {
  name: string;
  value: number;
  strong?: boolean;
}

interface DivergingBarsProps {
  rows: DivergingRow[];
  formatValue: (v: number) => string;
  ariaLabel: string;
  /** 精簡版（總覽卡片）：列高較小 */
  compact?: boolean;
}

/** 數字標籤預留的寬度（%） */
const LABEL_SPACE = 16;

export function DivergingBars({ rows, formatValue, ariaLabel, compact = false }: DivergingBarsProps) {
  if (rows.length === 0) return null;
  const maxPos = Math.max(0, ...rows.map((r) => r.value));
  const maxNeg = Math.max(0, ...rows.map((r) => -r.value));
  const span = maxPos + maxNeg || 1;
  // 負值區至少留一點空間放條；正值區扣掉標籤空間
  const usable = 100 - LABEL_SPACE;
  const zero = maxNeg > 0 ? Math.max(4, (maxNeg / span) * usable) : 0;
  const scale = (usable - zero) / (maxPos || 1);
  const negScale = maxNeg > 0 ? zero / maxNeg : 0;
  const unit = Math.min(scale, negScale || scale);

  return (
    <div role="img" aria-label={ariaLabel} className={`grid grid-cols-[auto_1fr] items-center gap-x-3 ${compact ? 'gap-y-1' : 'gap-y-2'}`}>
      {rows.map((r, i) => {
        const len = Math.abs(r.value) * unit;
        const color = r.strong ? 'bg-coral' : r.value >= 0 && i === rows.findIndex((x) => !x.strong && x.value >= 0) ? 'bg-p' : 'bg-p-mid';
        return (
          <div key={r.name} className="contents">
            <span className="text-[12.5px] whitespace-nowrap text-ink2">{r.name}</span>
            <div className={`relative ${compact ? 'h-[18px]' : 'h-6'}`} title={`${r.name}：${formatValue(r.value)}`}>
              <span aria-hidden className="absolute inset-y-0 w-px bg-axis" style={{ left: `${zero}%` }} />
              <span
                className={`absolute top-1/2 h-[60%] -translate-y-1/2 rounded ${color}`}
                style={
                  r.value >= 0
                    ? { left: `${zero}%`, width: `max(3px, ${len}%)` }
                    : { right: `${100 - zero}%`, width: `max(3px, ${len}%)` }
                }
              />
              <span
                className={`absolute top-1/2 -translate-y-1/2 pl-1.5 text-[12.5px] whitespace-nowrap tabular-nums ${
                  r.strong ? 'font-medium text-ink' : 'text-ink2'
                }`}
                style={{ left: `${r.value >= 0 ? zero + len : zero}%` }}
              >
                {formatValue(r.value)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
