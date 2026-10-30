import { useState } from 'react';
import type { PulsePointViewModel } from '../../types/viewModel';
import { SERIES_COLORS, SERIES_DASH } from '../../lib/chartPalette';
import { formatPulsePeriod } from '../../lib/format';
import { zhTW } from '../../i18n/zh-TW';
import { useElementWidth } from './useElementWidth';

// 市場脈動的折線圖（純 SVG，不用圖表套件）：單線或最多 4 條線，同一個 y 軸。
// 滑鼠移到圖上顯示垂直線與該期數值；多線時線尾直接標名稱。

export interface LineChartSeries {
  name: string;
  points: PulsePointViewModel[];
}

interface LineChartProps {
  lines: LineChartSeries[];
  formatValue: (v: number) => string;
  /** y 軸刻度文字；預設同 formatValue */
  formatTick?: (v: number) => string;
  height?: number;
  /** y 軸反向（名次：第 1 名在上） */
  invert?: boolean;
  /** 給螢幕閱讀器的說明 */
  ariaLabel: string;
  /**
   * 註記點（單線，2026-10-27 視覺改版 V2）：線用目前頁面代表色，標出最高點「2.02% 最高」，
   * 最新一點珊瑚色並標數值。
   */
  annotate?: boolean;
}

const FONT = 11;
const LABEL_GAP = 13;

/** 粗估文字寬度：中日韓字元算一個字寬，其他算 0.58 */
function textWidth(s: string): number {
  let w = 0;
  for (const ch of s) w += /[⺀-￿]/.test(ch) ? FONT : FONT * 0.58;
  return w;
}

/** 1、2、5 × 10^k 的刻度，約 3–5 個；頭尾刻度包住資料範圍 */
function niceTicks(min: number, max: number): number[] {
  const raw = (max - min) / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const ticks: number[] = [];
  const end = Math.ceil(max / step - 1e-9) * step;
  for (let v = Math.floor(min / step + 1e-9) * step; v <= end + step * 1e-9; v += step) ticks.push(Number(v.toPrecision(12)));
  return ticks;
}

/** 線尾標籤避免重疊：依 y 排序後至少相隔 LABEL_GAP */
function spreadLabels(ys: number[], top: number, bottom: number): number[] {
  const order = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  for (let k = 1; k < order.length; k++) order[k]!.y = Math.max(order[k]!.y, order[k - 1]!.y + LABEL_GAP);
  const overflow = order.length ? order[order.length - 1]!.y - bottom : 0;
  if (overflow > 0) for (const o of order) o.y -= overflow;
  for (let k = order.length - 2; k >= 0; k--) order[k]!.y = Math.min(order[k]!.y, order[k + 1]!.y - LABEL_GAP);
  const out = new Array<number>(ys.length);
  for (const o of order) out[o.i] = Math.max(top, o.y);
  return out;
}

export function LineChart({ lines, formatValue, formatTick = formatValue, height = 168, invert = false, ariaLabel, annotate = false }: LineChartProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  // x 軸：各線期間的聯集，依字串排序（2026-05、2026-W42 皆可直接比較）；沒有期間的點用序號
  const keyOf = (p: PulsePointViewModel, i: number) => p.period ?? `#${String(i).padStart(4, '0')}`;
  const periods = [...new Set(lines.flatMap((l) => l.points.map(keyOf)))].sort();
  const values = lines.flatMap((l) => l.points.map((p) => p.value));
  const enough = periods.length >= 2 && values.length >= 2;

  let body = null;
  if (enough && width > 0) {
    let lo = Math.min(...values);
    let hi = Math.max(...values);
    if (lo === hi) {
      lo -= Math.abs(lo) * 0.1 || 1;
      hi += Math.abs(hi) * 0.1 || 1;
    }
    // 有負數時 y 軸一定包含 0（例如淨流入），並加深 0 的格線
    if (lo < 0) hi = Math.max(hi, 0);
    const ticks = niceTicks(lo, hi);
    const yMin = ticks[0]!;
    const yMax = ticks[ticks.length - 1]!;

    const multi = lines.length > 1;
    const notes = annotate && !multi;
    const left = Math.ceil(Math.max(...ticks.map((t) => textWidth(formatTick(t))))) + 8;
    const right = multi ? Math.ceil(Math.max(...lines.map((l) => textWidth(l.name)))) + 12 : notes ? 52 : 10;
    const top = notes ? 18 : 8;
    const bottom = 22;
    const plotW = Math.max(40, width - left - right);
    const plotH = height - top - bottom;
    const x = (i: number) => left + (periods.length === 1 ? plotW / 2 : (i * plotW) / (periods.length - 1));
    const y = (v: number) => top + ((invert ? v - yMin : yMax - v) * plotH) / (yMax - yMin);
    const indexOf = new Map(periods.map((p, i) => [p, i]));

    const drawn = lines.map((l) => l.points.map((p, i) => ({ i: indexOf.get(keyOf(p, i))!, v: p.value })));
    const lastPts = drawn.map((pts) => pts[pts.length - 1]);
    const labelYs = multi ? spreadLabels(lastPts.map((p) => (p ? y(p.v) : top)), top + 4, top + plotH) : [];

    // x 軸標籤：頭尾，寬度夠時加中間
    const xLabels = [0, periods.length - 1];
    if (plotW > 320 && periods.length > 4) xLabels.splice(1, 0, Math.round((periods.length - 1) / 2));
    const periodText = (k: string) => (k.startsWith('#') ? '' : formatPulsePeriod(k));

    const onMove = (e: React.PointerEvent<SVGRectElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const rel = ((e.clientX - rect.left) / rect.width) * (periods.length - 1);
      setHover(Math.max(0, Math.min(periods.length - 1, Math.round(rel))));
    };
    const hoverRows =
      hover === null
        ? []
        : lines.flatMap((l, li) => {
            const p = drawn[li]!.find((d) => d.i === hover);
            return p ? [{ li, name: l.name, v: p.v }] : [];
          });
    const tipLeft = hover === null ? 0 : x(hover);

    body = (
      <>
        <svg width={width} height={height} className="block overflow-visible" role="img" aria-label={ariaLabel}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={left} x2={left + plotW} y1={y(t)} y2={y(t)} stroke={t === 0 && yMin < 0 ? '#94a3b8' : '#e2e8f0'} strokeWidth="1" />
              <text x={left - 6} y={y(t)} dy="0.32em" textAnchor="end" fontSize={FONT} fill="#64748b">
                {formatTick(t)}
              </text>
            </g>
          ))}
          {xLabels.map((i, k) => (
            <text
              key={i}
              x={x(i)}
              y={height - 6}
              textAnchor={k === 0 ? 'start' : k === xLabels.length - 1 ? 'end' : 'middle'}
              fontSize={FONT}
              fill="#64748b"
            >
              {periodText(periods[i]!)}
            </text>
          ))}
          {hover !== null ? (
            <line x1={x(hover)} x2={x(hover)} y1={top} y2={top + plotH} stroke="#94a3b8" strokeWidth="1" />
          ) : null}
          {drawn.map((pts, li) => (
            <g key={li}>
              <polyline
                points={pts.map((p) => `${x(p.i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ')}
                fill="none"
                stroke={notes ? undefined : SERIES_COLORS[li]}
                className={notes ? 'stroke-p' : undefined}
                strokeWidth="2"
                strokeDasharray={SERIES_DASH[li]}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {notes && pts.length > 1
                ? (() => {
                    const peak = pts.reduce((a, b) => ((invert ? b.v < a.v : b.v > a.v) ? b : a));
                    // 最高點與最新值顯示成同一個數字時只標最新值（日資料常見），避免兩個標籤疊在一起
                    const last = lastPts[li];
                    return peak !== last && (!last || formatValue(peak.v) !== formatValue(last.v)) ? (
                      <g>
                        <circle cx={x(peak.i)} cy={y(peak.v)} r="4" fill="#fff" className="stroke-p" strokeWidth="2" />
                        <text x={x(peak.i)} y={y(peak.v) - 9} textAnchor="middle" fontSize={12} className="fill-ink2">
                          {`${formatValue(peak.v)} ${zhTW.market.highest}`}
                        </text>
                      </g>
                    ) : null;
                  })()
                : null}
              {lastPts[li] ? (
                notes ? (
                  <g>
                    <circle cx={x(lastPts[li].i)} cy={y(lastPts[li].v)} r="4.5" className="fill-coral" stroke="#fff" strokeWidth="1.5" />
                    <text x={x(lastPts[li].i) + 9} y={y(lastPts[li].v)} dy="0.32em" fontSize={12} className="fill-ink font-medium">
                      {formatValue(lastPts[li].v)}
                    </text>
                  </g>
                ) : (
                  <circle cx={x(lastPts[li].i)} cy={y(lastPts[li].v)} r="4" fill={SERIES_COLORS[li]} stroke="#fff" strokeWidth="2" />
                )
              ) : null}
              {multi && lastPts[li] ? (
                <text x={left + plotW + 8} y={labelYs[li]} dy="0.32em" fontSize={FONT} fill="#334155">
                  {lines[li]!.name}
                </text>
              ) : null}
            </g>
          ))}
          {hoverRows.map((r) => (
            <circle key={r.li} cx={x(hover!)} cy={y(r.v)} r="4" fill={SERIES_COLORS[r.li]} stroke="#fff" strokeWidth="2" />
          ))}
          {/* 感應區比線大：整個繪圖區 */}
          <rect
            x={left}
            y={0}
            width={plotW}
            height={top + plotH}
            fill="transparent"
            onPointerMove={onMove}
            onPointerDown={onMove}
            onPointerLeave={() => setHover(null)}
          />
        </svg>
        {hover !== null && hoverRows.length > 0 ? (
          <div
            className="pointer-events-none absolute top-0 z-10 rounded-md border border-line bg-white px-2.5 py-1.5 text-xs shadow-sm"
            style={
              tipLeft > width / 2
                ? { right: width - tipLeft + 10 }
                : { left: tipLeft + 10 }
            }
          >
            <div className="text-muted">{periodText(periods[hover]!)}</div>
            {hoverRows.map((r) => (
              <div key={r.li} className="flex items-center gap-1.5 whitespace-nowrap text-ink">
                {multi ? (
                  <span aria-hidden className="inline-block h-0.5 w-3" style={{ background: SERIES_COLORS[r.li] }} />
                ) : null}
                {multi ? <span className="text-ink2">{r.name}</span> : null}
                <span className="font-medium tabular-nums">{formatValue(r.v)}</span>
              </div>
            ))}
          </div>
        ) : null}
      </>
    );
  }

  return (
    <div ref={ref} className="relative w-full" style={{ minHeight: enough ? height : undefined }}>
      {body}
    </div>
  );
}

/** 多線圖的圖例：線條樣式＋名稱＋最新值 */
export function LineLegend({ lines, formatValue }: { lines: LineChartSeries[]; formatValue: (v: number) => string }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink2">
      {lines.map((l, i) => {
        const last = l.points[l.points.length - 1];
        return (
          <li key={i} className="inline-flex items-center gap-1.5">
            <svg width="18" height="6" aria-hidden className="shrink-0">
              <line x1="1" x2="17" y1="3" y2="3" stroke={SERIES_COLORS[i]} strokeWidth="2" strokeDasharray={SERIES_DASH[i]} strokeLinecap="round" />
            </svg>
            {l.name}
            {last ? <span className="font-medium text-ink tabular-nums">{formatValue(last.value)}</span> : null}
          </li>
        );
      })}
    </ul>
  );
}
