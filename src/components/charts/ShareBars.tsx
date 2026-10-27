import type { PulseSharePeriodViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { MAX_SERIES, OTHER_COLOR, SERIES_COLORS } from '../../lib/chartPalette';
import { formatPulsePeriod, formatSharePct, orDash, pulseChangeText } from '../../lib/format';

// 占比圖（純 CSS）：每一期一條 100% 橫條，下方表格列出最新一期的占比與成長率。
// 項目依最新一期的順序上色，超過 4 項時其餘合併為「其他」（顏色跟著項目，不跟著名次）。

const t = zhTW.market;
/** 期數少於此數時圖下註「資料累積中」 */
const FULL_PERIODS = 6;

interface Slot {
  name: string;
  color: string;
}

interface Row {
  name: string;
  color: string;
  sharePct: number;
  growthPct: number | null;
}

function foldPeriod(period: PulseSharePeriodViewModel, slots: Slot[]): Row[] {
  const byName = new Map(slots.map((s) => [s.name, s]));
  const rows: Row[] = [];
  let other = 0;
  for (const p of period.parts) {
    const slot = byName.get(p.name ?? '');
    if (slot) rows.push({ ...slot, sharePct: p.sharePct, growthPct: p.growthPct });
    else other += p.sharePct;
  }
  rows.sort((a, b) => slots.findIndex((s) => s.name === a.name) - slots.findIndex((s) => s.name === b.name));
  if (other > 0) rows.push({ name: t.other, color: OTHER_COLOR, sharePct: other, growthPct: null });
  return rows;
}

export function ShareBars({ periods }: { periods: PulseSharePeriodViewModel[] }) {
  const latest = periods[periods.length - 1];
  if (!latest || latest.parts.length === 0) return <p className="text-slate-500">{t.noChartData}</p>;

  const names = latest.parts.map((p) => p.name ?? zhTW.common.dash);
  const slots: Slot[] = names.slice(0, MAX_SERIES).map((name, i) => ({ name, color: SERIES_COLORS[i]! }));
  const rowsOf = periods.map((p) => ({ period: p.period, rows: foldPeriod(p, slots) }));
  const latestRows = rowsOf[rowsOf.length - 1]!.rows;
  const hasGrowth = latestRows.some((r) => r.growthPct !== null);

  return (
    <div className="space-y-3">
      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
        {latestRows.map((r) => (
          <li key={r.name} className="inline-flex items-center gap-1">
            <span aria-hidden className="inline-block size-2.5 rounded-sm" style={{ background: r.color }} />
            {r.name}
          </li>
        ))}
      </ul>
      <div className="space-y-1.5" aria-hidden>
        {rowsOf.map(({ period, rows }, i) => {
          const sum = rows.reduce((s, r) => s + r.sharePct, 0) || 1;
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="w-16 shrink-0 text-xs text-slate-500 tabular-nums">{period ? formatPulsePeriod(period) : orDash(period)}</span>
              {/* 段與段之間留 2px 白色間隔 */}
              <div className="flex h-3.5 min-w-0 flex-1 gap-0.5">
                {rows.map((r) => (
                  <div
                    key={r.name}
                    title={`${r.name} ${formatSharePct(r.sharePct)}`}
                    className="h-full first:rounded-l last:rounded-r"
                    style={{ width: `${(r.sharePct / sum) * 100}%`, background: r.color }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
            <th className="py-1 font-normal">{t.shareTable.name}</th>
            <th className="py-1 text-right font-normal">
              {latest.period ? t.shareLatest(formatPulsePeriod(latest.period)) : t.shareTable.share}
            </th>
            {hasGrowth ? <th className="py-1 text-right font-normal">{t.shareTable.growth}</th> : null}
          </tr>
        </thead>
        <tbody>
          {latestRows.map((r) => (
            <tr key={r.name} className="border-b border-slate-100 last:border-0">
              <td className="py-1 text-slate-700">
                <span aria-hidden className="mr-1.5 inline-block size-2 rounded-sm" style={{ background: r.color }} />
                {r.name}
              </td>
              <td className="py-1 text-right text-slate-800 tabular-nums">{formatSharePct(r.sharePct)}</td>
              {hasGrowth ? (
                <td className="py-1 text-right text-navy-800 tabular-nums">
                  {r.growthPct === null ? zhTW.common.dash : pulseChangeText(r.growthPct)}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
      {periods.length < FULL_PERIODS ? <p className="text-xs text-slate-500">{t.accumulating}</p> : null}
    </div>
  );
}
