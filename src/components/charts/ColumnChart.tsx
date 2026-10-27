import { useState } from 'react';
import { useElementWidth } from './useElementWidth';

// 直條圖（純 SVG，不用圖表套件）。顏色用目前頁面代表色（fill-p-mid），強調的那一根用珊瑚色。

interface ColumnChartProps {
  /** 由舊到新 */
  values: number[];
  labels: string[];
  /** 強調哪一根（珊瑚色）；通常是最新一期 */
  highlight?: number;
  formatValue: (v: number) => string;
  height?: number;
  ariaLabel: string;
}

const TOP = 20;
const BOTTOM = 22;

/** 直接在圖上標數字：最高那根與強調那根；滑鼠移上去顯示該期數值 */
export function ColumnChart({ values, labels, highlight, formatValue, height = 130, ariaLabel }: ColumnChartProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  if (values.length === 0) return null;

  const max = Math.max(0, ...values);
  const min = Math.min(0, ...values);
  const span = max - min || 1;
  const plotH = height - TOP - BOTTOM;
  const y = (v: number) => TOP + ((max - v) / span) * plotH;
  const step = width / values.length;
  const barW = Math.min(40, step * 0.55);
  const maxIndex = values.indexOf(Math.max(...values));
  const shown = new Set([maxIndex, highlight, hover].filter((i): i is number => i != null));
  // 標籤太擠時只標部分月份（約每 40px 一個）
  const labelEvery = Math.max(1, Math.ceil(36 / Math.max(step, 1)));

  return (
    <div ref={ref} className="w-full">
      {width > 0 ? (
        <svg width={width} height={height} role="img" aria-label={ariaLabel} className="block overflow-visible">
          <line x1={0} x2={width} y1={y(0)} y2={y(0)} className="stroke-axis" />
          {values.map((v, i) => {
            const cx = step * i + step / 2;
            const top = Math.min(y(v), y(0));
            const h = Math.abs(y(v) - y(0));
            const strong = i === highlight;
            const r = Math.min(4, barW / 2, h);
            // 正值圓角在上，負值圓角在下
            const d =
              v >= 0
                ? `M${cx - barW / 2},${top + h}V${top + r}Q${cx - barW / 2},${top} ${cx - barW / 2 + r},${top}H${cx + barW / 2 - r}Q${cx + barW / 2},${top} ${cx + barW / 2},${top + r}V${top + h}Z`
                : `M${cx - barW / 2},${top}V${top + h - r}Q${cx - barW / 2},${top + h} ${cx - barW / 2 + r},${top + h}H${cx + barW / 2 - r}Q${cx + barW / 2},${top + h} ${cx + barW / 2},${top + h - r}V${top}Z`;
            return (
              <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                {/* 整欄都可滑過，細的柱子也容易指到 */}
                <rect x={step * i} y={0} width={step} height={height} fill="transparent" />
                {h > 0 ? <path d={d} className={strong ? 'fill-coral' : hover === i ? 'fill-p' : 'fill-p-mid'} /> : null}
                {shown.has(i) ? (
                  <text
                    x={cx}
                    y={v >= 0 ? top - 6 : top + h + 13}
                    textAnchor="middle"
                    fontSize={12}
                    className={strong ? 'fill-ink font-medium' : 'fill-ink2'}
                  >
                    {formatValue(v)}
                  </text>
                ) : null}
                {i % labelEvery === 0 || i === values.length - 1 ? (
                  <text x={cx} y={height - 5} textAnchor="middle" fontSize={11.5} className="fill-muted">
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
