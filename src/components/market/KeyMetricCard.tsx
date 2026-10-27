import type { PulseTrendViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { formatPulseTick, orDash, pulseChangeText, shortPeriodLabels } from '../../lib/format';
import { isRank, periodLong, trendDigits, trendValue } from '../../lib/marketStory';
import { ColumnChart } from '../charts/ColumnChart';
import { LineChart } from '../charts/LineChart';
import { StaleTag } from './StaleTag';

const t = zhTW.market;
const CHART_H = 150;

/**
 * 市場脈動總覽的重點指標卡（2026-10-27 視覺改版 V5，參考 TradingView 重點指標）：
 * 名稱、最新值與期間、變化、大走勢圖（月資料直條、週資料與名次折線；最新一點珊瑚色、最高點標數字）。
 * 不連到分頁：市場脈動只用最上方的頁籤切換分頁（2026-10-27 使用者要求）。
 */
export function KeyMetricCard({ metric: m, coral }: { metric: PulseTrendViewModel; coral: boolean }) {
  const fmt = (v: number) => trendValue(m, v);
  const last = m.points.at(-1)?.period ?? null;
  const monthly = !!last && /^\d{4}-\d{2}$/.test(last);
  const change = m.change !== null ? pulseChangeText(m.change, m.changeUnit, trendDigits(m)) : null;
  return (
    <section className="flex min-w-0 flex-col gap-1 rounded-xl border border-line bg-white px-5 pt-3.5 pb-3">
      <h2 className="text-[13px] text-ink2">
        {orDash(m.label)}
        {m.stale ? <StaleTag /> : null}
      </h2>
      <p className={`text-[30px] leading-tight font-medium tabular-nums ${coral ? 'text-coral' : 'text-ink'}`}>{trendValue(m, m.latestValue)}</p>
      <p className="text-[12.5px] text-ink2">
        {periodLong(last)}
        {change ? (
          <>
            {' · '}
            <span className="tabular-nums">{change}</span>
            {m.changeLabel ? `，${m.changeLabel}` : null}
          </>
        ) : null}
      </p>
      <div className="mt-2">
        {m.points.length < 2 ? (
          <p
            className="flex items-center justify-center rounded-lg bg-p-faint text-[12.5px] text-muted"
            style={{ height: CHART_H }}
          >
            {t.onePeriod}
          </p>
        ) : monthly && !isRank(m) ? (
          <ColumnChart
            values={m.points.map((p) => p.value)}
            labels={shortPeriodLabels(m.points.map((p) => p.period))}
            highlight={m.points.length - 1}
            formatValue={fmt}
            height={CHART_H}
            ariaLabel={orDash(m.label)}
          />
        ) : (
          <LineChart
            lines={[{ name: orDash(m.label), points: m.points }]}
            formatValue={fmt}
            formatTick={(v) => (isRank(m) ? formatPulseTick(v, m.unit) : fmt(v))}
            height={CHART_H}
            invert={isRank(m)}
            annotate
            ariaLabel={orDash(m.label)}
          />
        )}
      </div>
    </section>
  );
}
