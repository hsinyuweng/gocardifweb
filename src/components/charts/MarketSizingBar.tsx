import type { MarketEstimate } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';

const t = zhTW.report.details;

interface MarketSizingBarProps {
  low: MarketEstimate;
  mid: MarketEstimate;
  high: MarketEstimate;
}

function TextList({ low, mid, high }: MarketSizingBarProps) {
  return (
    <p className="text-slate-800">
      {t.low} {orDash(low.text)} · {t.mid} {orDash(mid.text)} · {t.high} {orDash(high.text)}
    </p>
  );
}

/**
 * 市場規模區間條（第 13 節，純 CSS）
 * 刻度從 0 到高估；低估到高估之間塗色，中估標一個點。任一值為 null 時改為純文字列出。
 */
export function MarketSizingBar(props: MarketSizingBarProps) {
  const { low, mid, high } = props;
  if (low.value === null || mid.value === null || high.value === null || high.value <= 0) {
    return <TextList {...props} />;
  }
  const pct = (v: number) => Math.min(100, Math.max(0, (v / high.value!) * 100));
  const lowPct = pct(low.value);
  const midPct = pct(mid.value);

  return (
    <div className="max-w-xl">
      <div className="relative h-3 rounded-full bg-slate-100" aria-hidden>
        <div
          className="absolute inset-y-0 rounded-full bg-navy-600/35"
          style={{ left: `${lowPct}%`, width: `${100 - lowPct}%` }}
        />
        <div className="absolute inset-y-0 w-0.5 bg-navy-700" style={{ left: `${lowPct}%` }} />
        <div className="absolute inset-y-0 right-0 w-0.5 bg-navy-700" />
        <div
          className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-navy-800"
          style={{ left: `${midPct}%` }}
        />
      </div>
      <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
        {[
          { label: t.low, e: low },
          { label: t.mid, e: mid },
          { label: t.high, e: high },
        ].map(({ label, e }) => (
          <div key={label}>
            <dt className="text-slate-500">{label}</dt>
            <dd className="text-sm font-semibold text-slate-900 tabular-nums">{e.text}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
