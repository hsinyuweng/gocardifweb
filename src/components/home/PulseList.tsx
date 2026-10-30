import type { PulseMetricViewModel, PulseTrendViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { formatPulseValue, orDash, pulseChangeWithLabel, shortPeriodLabels } from '../../lib/format';
import { homeMetrics, pulseDigits } from '../../lib/pulse';
import { ColumnChart } from '../charts/ColumnChart';
import { StaleTag } from '../market/StaleTag';
import { KeyLine } from './HomeCard';

const COLUMN_LIMIT = 12;
const OTHERS_LIMIT = 3;

/**
 * 市場脈動框（2026-10-27 視覺改版）：首頁指標的最新值（珊瑚色）＋變化、每期直條圖（最新一期珊瑚色）；
 * 最下面一行列其他單線指標的最新值。
 */
export function PulseList({ metrics }: { metrics: PulseMetricViewModel[] }) {
  const main = homeMetrics(metrics)[0];
  if (!main) return <p className="text-muted">{zhTW.home.noMetrics}</p>;

  const digits = pulseDigits(main.group);
  const fmt = (v: number) => formatPulseValue(v, main.unit, digits);
  const points = main.points.slice(-COLUMN_LIMIT);
  const others = metrics
    .filter((m): m is PulseTrendViewModel => m.type === 'trend' && m !== main && m.latestValue !== null)
    .slice(0, OTHERS_LIMIT)
    .map((m) => `${orDash(m.label)} ${formatPulseValue(m.latestValue, m.unit, pulseDigits(m.group))}`)
    .join(zhTW.home.listSeparator);

  return (
    <>
      <KeyLine num={formatPulseValue(main.latestValue, main.unit, digits)} coral>
        {orDash(main.label)}
        {main.change !== null ? `，${pulseChangeWithLabel(main.change, main.changeUnit, digits, main.changeLabel)}` : null}
        {main.stale ? <StaleTag /> : null}
      </KeyLine>
      {points.length >= 2 ? (
        <ColumnChart
          values={points.map((p) => p.value)}
          labels={shortPeriodLabels(points.map((p) => p.period))}
          highlight={points.length - 1}
          formatValue={fmt}
          height={120}
          ariaLabel={orDash(main.label)}
        />
      ) : null}
      {others ? (
        <p className="mt-auto truncate text-[13px] text-ink2" title={others}>
          {others}
        </p>
      ) : null}
    </>
  );
}
