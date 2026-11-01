import type { OverviewRow, PulseMetricViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { lineBarRows, lineGrowthRows, periodText, pickMetrics } from '../../lib/marketStory';
import { signedPct, signTone, TONE_TEXT } from '../../lib/tone';
import { LineBars } from '../charts/LineBars';

const t = zhTW.home;

/**
 * 市場脈動框（2026-11-01 第二輪：圖比文字一眼看得懂）：
 * 各險種新契約保費比去年同期的正負橫條（成長藍、衰退紅），有候選商品的險種實心並標件數；最下面一行整體成長。
 */
export function PulseList({ metrics, rows }: { metrics: PulseMetricViewModel[]; rows: OverviewRow[] }) {
  const lines = lineGrowthRows(metrics, rows);
  const yoy = pickMetrics(metrics).yoy;
  if (!lines && !yoy) return <p className="text-muted">{t.noMetrics}</p>;
  return (
    <>
      {lines ? (
        <div>
          <p className="mb-2 text-xs text-muted">{zhTW.market.heading.linesNote(periodText(lines.period))}</p>
          <LineBars rows={lineBarRows(lines.rows)} ariaLabel={zhTW.market.heading.lines} compact />
        </div>
      ) : null}
      {yoy && yoy.latestValue !== null ? (
        <p className="mt-auto text-[13px] text-ink2">
          {t.pulseOverallLine(periodText(yoy.points.at(-1)?.period ?? null))}
          <span className={`font-semibold ${TONE_TEXT[signTone(yoy.latestValue) ?? 'key']}`}>{signedPct(yoy.latestValue)}</span>
        </p>
      ) : null}
    </>
  );
}
