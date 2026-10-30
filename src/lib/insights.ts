import type { MarketPulseViewModel, PulseMetricViewModel } from '../types/viewModel';
import { zhTW } from '../i18n/zh-TW';
import { formatSharePct, orDash, pulseChangeText } from './format';
import { homeMetrics, metricsByGroup, PULSE_GROUP_ORDER } from './pulse';
import {
  biggestShareShift,
  growthLeaders,
  mainTrend,
  periodText,
  periodUnit,
  rankingValue,
  selfRanking,
  shareMetrics,
  signMatters,
  streak,
  trendDigits,
  trendValue,
} from './marketStory';
import type { RecentFeed } from './feedSummary';

// 一句結論（閱讀路徑 ②，2026-10-27 視覺改版）：只用資料裡的數字，單位與小數位照 lib/format.ts。
// 挑選順序：連續期數（連續 N 個月為正）優先，再來是一般變化（較上期 ▲▼）。之後後端若給 headline，優先用後端的句子。

/** 一句結論的片段；strong 的片段用珊瑚色（本頁最重要的一點） */
export interface HeadlinePart {
  text: string;
  strong?: boolean;
}

/** 一句結論與它用到的指標（數字磚上同一個指標也用珊瑚色） */
export interface Headline {
  parts: HeadlinePart[];
  metricKey: string | null;
}

const t = zhTW.insights;
const STREAK_MIN = 3;

/**
 * 首頁結論：首頁指標「8 月新契約保費年增率 68.5%」＋占比變化最大的項目「，年金保險占比回落到 33.6%」；
 * 沒有市場資料時用新聞「近 30 天 34 則動態，法規 0 則」；都沒有時為 null（不顯示）。
 */
export function homeHeadline(pulse: MarketPulseViewModel | null, news: RecentFeed | null): HeadlinePart[] | null {
  const m = pulse ? homeMetrics(pulse.metrics)[0] : undefined;
  if (pulse && m && m.label && m.latestValue !== null) {
    const period = periodText(m.points.at(-1)?.period ?? null);
    const parts: HeadlinePart[] = [{ text: t.lead(period, m.label) }, { text: trendValue(m, m.latestValue), strong: true }];
    const groupShares = shareMetrics(metricsByGroup(pulse.metrics).get(m.group)!);
    const share = groupShares[0] ?? shareMetrics(pulse.metrics)[0];
    const shift = share ? biggestShareShift(share) : null;
    if (shift) {
      const v = formatSharePct(shift.sharePct);
      parts.push({ text: shift.diff > 0 ? t.shareUp(shift.name, v) : t.shareDown(shift.name, v) });
    }
    return parts;
  }
  if (news && news.items.length > 0) return [{ text: t.news(news.items.length, news.regulation) }];
  return null;
}

/**
 * 市場脈動總覽：成長動能（沒有時用第一個有單線指標的組）的主要指標
 * 「新契約保費年增率連續 8 個月為正」（不到 3 期時「8 月新契約保費年增率 68.5%」），
 * ＋同組占比年增最快的項目「，年金保險年增 135.8% 最快」。
 */
export function overviewHeadline(metrics: PulseMetricViewModel[]): Headline | null {
  const groups = metricsByGroup(metrics);
  const g = PULSE_GROUP_ORDER.find((x) => mainTrend(groups.get(x)!)) ?? null;
  if (g === null) return null;
  const list = groups.get(g)!;
  const m = mainTrend(list)!;
  if (!m.label) return null;
  const s = streak(m.points);
  const parts: HeadlinePart[] =
    signMatters(m) && s.n >= STREAK_MIN
      ? [{ text: t.streak(m.label, s.n, periodUnit(m.points.at(-1)?.period ?? null), s.positive) }]
      : [{ text: t.lead(periodText(m.points.at(-1)?.period ?? null), m.label) }, { text: trendValue(m, m.latestValue), strong: true }];
  const lead = shareMetrics(list).map(growthLeaders).find((x) => x !== null);
  if (lead) {
    const hasStrong = parts.some((p) => p.strong);
    parts.push({ text: t.comma });
    parts.push({ text: t.fastest(lead.fastest.name!, formatSharePct(lead.fastest.growthPct!)), strong: !hasStrong });
  }
  return { parts, metricKey: m.key };
}

/**
 * 分頁：主要指標「8 月新契約保費年增率 68.5%」＋「，連續 8 個月為正」（3 期以上）或「，較上週 ▼ 0.02 個百分點」；
 * 同組有法巴的同業排名時改接「，同業排第 10 名」；只有排名時「8 月法國巴黎人壽市占率 3.56%，同業排第 10 名」；
 * 只有占比時「壽險公司本身行銷體系占 46.4%，銀行經代保代通路 37.0%」。
 */
export function tabHeadline(list: PulseMetricViewModel[]): Headline | null {
  const m = mainTrend(list);
  const ranked = selfRanking(list);
  if (m && m.label) {
    const period = m.points.at(-1)?.period ?? null;
    const parts: HeadlinePart[] = [{ text: t.lead(periodText(period), m.label) }, { text: trendValue(m, m.latestValue), strong: true }];
    const s = streak(m.points);
    if (ranked) parts.push({ text: zhTW.market.ranking.headTail(ranked.self.rank) });
    else if (signMatters(m) && s.n >= STREAK_MIN) parts.push({ text: t.streakTail(s.n, periodUnit(period), s.positive) });
    else if (m.change !== null) parts.push({ text: t.changeTail(m.changeLabel, pulseChangeText(m.change, m.changeUnit, trendDigits(m))) });
    return { parts, metricKey: m.key };
  }
  if (ranked) {
    const { m: r, self } = ranked;
    return {
      parts: [
        { text: t.lead(periodText(r.period), zhTW.market.ranking.shareOf(orDash(self.name))) },
        { text: rankingValue(r, self.value), strong: true },
        { text: zhTW.market.ranking.headTail(self.rank) },
      ],
      metricKey: r.key,
    };
  }
  const share = shareMetrics(list)[0];
  const top = [...(share?.periods.at(-1)?.parts ?? [])].sort((a, b) => b.sharePct - a.sharePct);
  if (!share || top.length === 0) return null;
  const parts: HeadlinePart[] = [{ text: t.shareTop(orDash(top[0]!.name)) }, { text: formatSharePct(top[0]!.sharePct), strong: true }];
  if (top[1]) parts.push({ text: t.shareSecond(orDash(top[1].name), formatSharePct(top[1].sharePct)) });
  return { parts, metricKey: share.key };
}
