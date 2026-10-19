// 市場脈動的趨勢小線圖（純 SVG，第 13、14 節：不使用圖表套件）。顏色用 currentColor，由外層決定。

interface SparklineProps {
  /** 由舊到新 */
  values: number[];
  width?: number;
  height?: number;
}

/** 少於 2 個點時不畫 */
export function Sparkline({ values, width = 120, height = 32 }: SparklineProps) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = 2;
  const x = (i: number) => pad + (i * (width - pad * 2)) / (values.length - 1);
  // 全部相同時畫在中間
  const y = (v: number) => (max === min ? height / 2 : pad + ((max - v) * (height - pad * 2)) / (max - min));
  const points = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const last = values.length - 1;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="shrink-0" aria-hidden>
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(last)} cy={y(values[last]!)} r="2.25" fill="currentColor" />
    </svg>
  );
}
