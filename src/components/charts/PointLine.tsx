import { shortPeriodLabels } from '../../lib/format';
import type { PulsePointViewModel } from '../../types/viewModel';
import { useElementWidth } from './useElementWidth';

// 單線折線圖（純 SVG，2026-11-01 法巴市占率過去五年）：點少（12 個以內）時每個點都標數字，
// 點多時只標最高與最新；最新一點實心、粗字。線用目前頁面代表色。

interface PointLineProps {
  /** 由舊到新 */
  points: PulsePointViewModel[];
  formatValue: (v: number) => string;
  height?: number;
  ariaLabel: string;
}

const LEFT = 44;
const RIGHT = 16;
const TOP = 26;
const BOTTOM = 24;
/** 頭尾各留一點空間，第一點的數字不會壓到 y 軸刻度 */
const PAD = 28;

/** 0.5、1、2、5 × 10^k 的刻度間距，約 4–5 格 */
function tickStep(span: number): number {
  const raw = span / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
}

export function PointLine({ points, formatValue, height = 220, ariaLabel }: PointLineProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  if (points.length < 2) return null;

  const vals = points.map((p) => p.value);
  const lo0 = Math.min(...vals);
  const hi0 = Math.max(...vals);
  const step = tickStep(hi0 - lo0 || Math.abs(hi0) || 1);
  const lo = Math.floor(lo0 / step - 0.5) * step;
  const hi = Math.ceil(hi0 / step + 0.5) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step * 1e-9; v += step) ticks.push(Number(v.toPrecision(10)));

  const pw = Math.max(40, width - LEFT - RIGHT);
  const ph = height - TOP - BOTTOM;
  const x = (i: number) => LEFT + PAD + (i * (pw - PAD * 2)) / (points.length - 1);
  const y = (v: number) => TOP + ((hi - v) * ph) / (hi - lo);
  const last = points.length - 1;
  const peak = vals.indexOf(hi0);
  const labelAll = points.length <= 12;
  const labels = shortPeriodLabels(points.map((p) => p.period));

  return (
    <div ref={ref} className="w-full">
      {width > 0 ? (
        <svg width={width} height={height} role="img" aria-label={ariaLabel} className="block overflow-visible">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={LEFT} x2={LEFT + pw} y1={y(t)} y2={y(t)} className="stroke-line" />
              <text x={LEFT - 6} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} className="fill-muted">
                {formatValue(t)}
              </text>
            </g>
          ))}
          <polyline
            points={points.map((p, i) => `${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ')}
            fill="none"
            className="stroke-p"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {points.map((p, i) => {
            const strong = i === last;
            const showValue = labelAll || i === last || i === peak;
            const showPeriod = labelAll || i === 0 || i === last || i === Math.round(last / 2);
            return (
              <g key={`${p.period ?? ''}-${i}`}>
                {labelAll || strong ? (
                  <circle cx={x(i)} cy={y(p.value)} r={strong ? 5.5 : 4} strokeWidth="2" className={`stroke-p-ink ${strong ? 'fill-p-ink' : 'fill-white'}`} />
                ) : null}
                {showValue ? (
                  <text
                    x={x(i)}
                    y={y(p.value) - 11}
                    textAnchor="middle"
                    fontSize={strong ? 13 : 12}
                    className={strong ? 'fill-p-ink font-semibold' : 'fill-ink2'}
                  >
                    {formatValue(p.value)}
                  </text>
                ) : null}
                {showPeriod ? (
                  <text x={x(i)} y={height - 5} textAnchor="middle" fontSize={11.5} className="fill-muted">
                    {labels[i]}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      ) : (
        <div style={{ height }} />
      )}
    </div>
  );
}
