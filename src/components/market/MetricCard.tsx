import type { PulseMetricViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { MAX_SERIES } from '../../lib/chartPalette';
import { formatPulseTick, formatPulseValue, orDash, pulseChangeText } from '../../lib/format';
import { LineChart, LineLegend } from '../charts/LineChart';
import { ShareBars } from '../charts/ShareBars';
import { Timeline } from '../charts/Timeline';

const t = zhTW.market;

/** 卡片底部：來源（新分頁）· 資料日期 */
function SourceLine({ m }: { m: PulseMetricViewModel }) {
  if (!m.source && !m.asOf) return null;
  return (
    <p className="mt-3 text-xs text-slate-500">
      {m.source ? (
        <>
          {t.source}
          {m.sourceUrl ? (
            <a href={m.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-navy-700 hover:underline">
              {m.source}
            </a>
          ) : (
            m.source
          )}
        </>
      ) : null}
      {m.source && m.asOf ? ' · ' : null}
      {m.asOf ? t.asOf(m.asOf) : null}
    </p>
  );
}

function Body({ m }: { m: PulseMetricViewModel }) {
  const fmt = (v: number) => formatPulseValue(v, m.unit);
  const tick = (v: number) => formatPulseTick(v, m.unit);
  const label = orDash(m.label);
  if (m.type === 'trend') {
    return (
      <>
        <p className="text-2xl font-semibold text-navy-800 tabular-nums">{formatPulseValue(m.latestValue, m.unit)}</p>
        <p className="mt-0.5 mb-3 flex items-baseline gap-2 text-sm">
          <span className="text-navy-800 tabular-nums">{pulseChangeText(m.change, m.changeUnit)}</span>
          {m.changeLabel ? <span className="text-xs text-slate-500">{m.changeLabel}</span> : null}
        </p>
        {m.points.length >= 2 ? (
          <LineChart lines={[{ name: label, points: m.points }]} formatValue={fmt} formatTick={tick} ariaLabel={label} />
        ) : (
          <p className="text-slate-500">{t.noChartData}</p>
        )}
      </>
    );
  }
  if (m.type === 'multi_line') {
    const lines = m.lines
      .filter((l) => l.points.length > 0)
      .slice(0, MAX_SERIES)
      .map((l, i) => ({ name: l.name ?? `${i + 1}`, points: l.points }));
    const hidden = m.lines.filter((l) => l.points.length > 0).length - lines.length;
    if (lines.length === 0) return <p className="text-slate-500">{t.noChartData}</p>;
    return (
      <div className="space-y-3">
        <LineLegend lines={lines} formatValue={fmt} />
        <LineChart lines={lines} formatValue={fmt} formatTick={tick} ariaLabel={label} />
        {hidden > 0 ? <p className="text-xs text-slate-500">{t.moreLines(hidden)}</p> : null}
      </div>
    );
  }
  if (m.type === 'share') return <ShareBars periods={m.periods} />;
  return <Timeline events={m.events} />;
}

/** 市場脈動頁的一個指標 */
export function MetricCard({ metric }: { metric: PulseMetricViewModel }) {
  return (
    <article className={`min-w-0 rounded-lg border border-slate-200 bg-white p-4 ${metric.type === 'timeline' ? 'sm:col-span-2' : ''}`}>
      <h3 className="mb-2 text-slate-600">{orDash(metric.label)}</h3>
      <Body m={metric} />
      <SourceLine m={metric} />
    </article>
  );
}
