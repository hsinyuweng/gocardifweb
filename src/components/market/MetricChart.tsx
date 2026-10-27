import type { PulseMetricViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { MAX_SERIES } from '../../lib/chartPalette';
import { pulseDigits } from '../../lib/pulse';
import { formatPulseTick, formatPulseValue, orDash } from '../../lib/format';
import { LineChart, LineLegend } from '../charts/LineChart';
import { ShareBars } from '../charts/ShareBars';
import { Timeline } from '../charts/Timeline';

const t = zhTW.market;

/** 指標表「看圖 ▾」展開的圖（數值、來源已在表格列上）：單線折線、多線圖例＋折線、占比每期橫條＋表格、時程 */
export function MetricChart({ metric: m }: { metric: PulseMetricViewModel }) {
  const digits = pulseDigits(m.group);
  const fmt = (v: number) => formatPulseValue(v, m.unit, digits);
  // 2 位小數的指標（利率等）刻度也用 2 位，避免「2%」「2.05%」混用
  const tick = (v: number) => (m.unit === '%' && digits === 2 ? fmt(v) : formatPulseTick(v, m.unit));
  const label = orDash(m.label);
  if (m.type === 'trend') {
    if (m.points.length < 2) return <p className="text-muted">{t.noChartData}</p>;
    return (
      <LineChart
        lines={[{ name: label, points: m.points }]}
        formatValue={fmt}
        formatTick={tick}
        invert={m.unit === zhTW.units.rank}
        annotate
        ariaLabel={label}
      />
    );
  }
  if (m.type === 'multi_line') {
    const lines = m.lines
      .filter((l) => l.points.length > 0)
      .slice(0, MAX_SERIES)
      .map((l, i) => ({ name: l.name ?? `${i + 1}`, points: l.points }));
    const hidden = m.lines.filter((l) => l.points.length > 0).length - lines.length;
    if (lines.length === 0) return <p className="text-muted">{t.noChartData}</p>;
    return (
      <div className="space-y-3">
        <LineLegend lines={lines} formatValue={fmt} />
        <LineChart lines={lines} formatValue={fmt} formatTick={tick} invert={m.unit === zhTW.units.rank} ariaLabel={label} />
        {hidden > 0 ? <p className="text-xs text-muted">{t.moreLines(hidden)}</p> : null}
      </div>
    );
  }
  if (m.type === 'share') return <ShareBars periods={m.periods} />;
  return <Timeline events={m.events} />;
}
