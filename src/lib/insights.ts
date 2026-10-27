import type { MarketPulseViewModel, PulseGroup, PulseMetricViewModel, PulseShareViewModel } from '../types/viewModel';
import { zhTW } from '../i18n/zh-TW';
import { formatPulsePeriod, formatPulseValue, formatSharePct } from './format';
import { homeMetrics, pulseDigits } from './pulse';
import type { RecentFeed } from './feedSummary';

// 一句結論（閱讀路徑 ②，2026-10-27 視覺改版）：只用資料裡的數字，單位與小數位照 lib/format.ts。
// 之後後端若給 headline，優先用後端的句子。

/** 一句結論的片段；strong 的片段用珊瑚色（本頁最重要的一點） */
export interface HeadlinePart {
  text: string;
  strong?: boolean;
}

const t = zhTW.insights;

/** 期間的口語寫法：「2026-08」→「8 月」；週「2026-W43」→「10/19 當週」；其他照原文 */
export function periodText(period: string | null): string | null {
  if (period === null) return null;
  const m = /^\d{4}-(\d{2})$/.exec(period);
  if (m) return t.month(+m[1]!);
  return formatPulsePeriod(period);
}

/** 占比變化最大的項目（最近兩期，依名稱比對）；變化不到 0.05 個百分點時為 null */
function biggestShareShift(metrics: PulseMetricViewModel[], group: PulseGroup) {
  const shares = metrics.filter((m): m is PulseShareViewModel => m.type === 'share' && m.periods.length >= 2);
  const share = shares.find((m) => m.group === group) ?? shares[0];
  if (!share) return null;
  const [prev, last] = share.periods.slice(-2) as [PulseShareViewModel['periods'][number], PulseShareViewModel['periods'][number]];
  let best: { name: string; sharePct: number; diff: number } | null = null;
  for (const part of last.parts) {
    const before = prev.parts.find((p) => p.name === part.name);
    if (!part.name || !before) continue;
    const diff = part.sharePct - before.sharePct;
    if (best === null || Math.abs(diff) > Math.abs(best.diff)) best = { name: part.name, sharePct: part.sharePct, diff };
  }
  return best !== null && Math.abs(best.diff) >= 0.05 ? best : null;
}

/**
 * 首頁結論：首頁指標「8 月新契約保費年增率 68.5%」＋占比變化最大的項目「，年金保險占比回落到 33.6%」；
 * 沒有市場資料時用新聞「近 30 天 34 則動態，法規 0 則」；都沒有時為 null（不顯示）。
 */
export function homeHeadline(pulse: MarketPulseViewModel | null, news: RecentFeed | null): HeadlinePart[] | null {
  const m = pulse ? homeMetrics(pulse.metrics)[0] : undefined;
  if (pulse && m && m.label && m.latestValue !== null) {
    const period = periodText(m.points.at(-1)?.period ?? null);
    const parts: HeadlinePart[] = [
      { text: t.lead(period, m.label) },
      { text: formatPulseValue(m.latestValue, m.unit, pulseDigits(m.group)), strong: true },
    ];
    const shift = biggestShareShift(pulse.metrics, m.group);
    if (shift) {
      const v = formatSharePct(shift.sharePct);
      parts.push({ text: shift.diff > 0 ? t.shareUp(shift.name, v) : t.shareDown(shift.name, v) });
    }
    return parts;
  }
  if (news && news.items.length > 0) return [{ text: t.news(news.items.length, news.regulation) }];
  return null;
}
