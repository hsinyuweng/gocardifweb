import type { PulseMetricViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { formatPulseValue, formatSharePct, orDash } from '../../lib/format';
import { growthLeaders, periodText, shareMetrics } from '../../lib/marketStory';
import { homeMetrics, pulseDigits } from '../../lib/pulse';
import { KeyLine } from './HomeCard';

const t = zhTW.home;

/**
 * 市場脈動框（2026-11-01 顯示資料整理）：只留一個結論——哪個險種新契約保費年增最快（對應商品的險種），
 * 下面一行列整體年增率。不放圖。
 */
export function PulseList({ metrics }: { metrics: PulseMetricViewModel[] }) {
  const share = shareMetrics(metrics)[0];
  const lead = share ? growthLeaders(share) : null;
  const main = homeMetrics(metrics)[0];
  if (!lead && !main) return <p className="text-muted">{t.noMetrics}</p>;
  const period = periodText(share?.periods.at(-1)?.period ?? null);
  const others = lead
    ? (share!.periods.at(-1)?.parts ?? [])
        .filter((p) => p.name && p.name !== lead.fastest.name && p.growthPct !== null)
        .sort((a, b) => b.growthPct! - a.growthPct!)
        .map((p) => `${p.name} ${formatSharePct(p.growthPct!)}`)
        .join(t.listSeparator)
    : null;
  return (
    <>
      {lead ? (
        <KeyLine num={formatSharePct(lead.fastest.growthPct!)}>{t.pulseFastest(period, orDash(lead.fastest.name))}</KeyLine>
      ) : null}
      {others ? <p className="text-[13px] text-ink2">{t.pulseOthers(others)}</p> : null}
      {main && main.latestValue !== null ? (
        <p className="mt-auto text-[13px] text-ink2">
          {t.pulseOverall(orDash(main.label), formatPulseValue(main.latestValue, main.unit, pulseDigits(main.group)))}
        </p>
      ) : null}
    </>
  );
}
