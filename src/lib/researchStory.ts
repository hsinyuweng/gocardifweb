import type { OverviewRow, RecommendationGroup, SignalColor } from '../types/viewModel';
import { zhTW } from '../i18n/zh-TW';
import type { HeadlinePart } from './insights';
import type { KeyNumber } from './marketStory';

// 競品研究頁的閱讀路徑內容（2026-10-27 V6）：結論句、數字磚、圖表標題、三面向燈號表。只用報告清單的欄位。

const t = zhTW.overview.story;
const NOT_RECOMMENDED = 'not_recommended';

const withCritical = (rows: OverviewRow[]) => rows.filter((r) => r.blockerCounts.critical > 0).length;

/** 「9 份報告都還沒審閱，2 份有重大事項，1 份不建議引進」；重大事項珊瑚色，0 份的片段不寫 */
export function researchHeadline(rows: OverviewRow[], unread: number): HeadlinePart[] {
  const total = rows.length;
  const parts: HeadlinePart[] = [
    { text: unread === 0 ? t.allReviewed(total) : unread === total ? t.noneReviewed(total) : t.someUnread(unread, total) },
  ];
  const critical = withCritical(rows);
  if (critical > 0) parts.push({ text: t.sep }, { text: t.critical(critical), strong: true });
  const notRec = rows.filter((r) => r.recommendationKey === NOT_RECOMMENDED).length;
  if (notRec > 0) parts.push({ text: t.sep + t.notRecommended(notRec) });
  return parts;
}

/** 份數最多的建議（同數取第一個） */
function topGroup(groups: RecommendationGroup[]): RecommendationGroup | null {
  return groups.reduce<RecommendationGroup | null>((a, b) => (a === null || b.count > a.count ? b : a), null);
}

export function researchNumbers(rows: OverviewRow[], groups: RecommendationGroup[], unread: number): KeyNumber[] {
  const top = topGroup(groups);
  const critical = withCritical(rows);
  const sum = (k: 'critical' | 'blocking' | 'warning') => rows.reduce((n, r) => n + r.blockerCounts[k], 0);
  const out: KeyNumber[] = [
    { key: 'unread', label: t.tile.unread, value: t.count(unread), note: t.tile.ofTotal(rows.length) },
  ];
  if (top) out.push({ key: 'top', label: t.tile.topRec, value: top.label ?? t.missing, note: t.count(top.count) });
  out.push({
    key: 'critical',
    label: t.tile.critical,
    value: t.count(critical),
    note: critical > 0 ? t.tile.criticalItems(sum('critical')) : t.tile.noCritical,
    coral: critical > 0,
  });
  out.push({ key: 'blockers', label: t.tile.blockers, value: t.tile.blocking(sum('blocking')), note: t.tile.warning(sum('warning')) });
  return out;
}

export type ModuleField = 'marketDemand' | 'actuarial' | 'regulatory';
export const MODULE_FIELDS: readonly ModuleField[] = ['marketDemand', 'actuarial', 'regulatory'];

const COLOR_ORDER: Record<SignalColor, number> = { green: 0, yellow: 1, orange: 2, red: 3, gray: 4 };

/** 一個面向的燈號分布：同色同字算一組，依綠→黃→橘→紅→灰 */
export function moduleSignals(rows: OverviewRow[], field: ModuleField): { color: SignalColor; text: string | null; count: number }[] {
  const map = new Map<string, { color: SignalColor; text: string | null; count: number }>();
  for (const r of rows) {
    const s = r[field];
    const k = `${s.color}|${s.text ?? ''}`;
    const cur = map.get(k);
    if (cur) cur.count++;
    else map.set(k, { color: s.color, text: s.text, count: 1 });
  }
  return [...map.values()].sort((a, b) => COLOR_ORDER[a.color] - COLOR_ORDER[b.color] || b.count - a.count);
}

/** 圖表段落標題：「暫緩，待補資料最多，共 6 份；法規適用沒有一份是綠燈」（後半取非綠燈最多的面向） */
export function researchHeading(rows: OverviewRow[], groups: RecommendationGroup[]): string | null {
  const top = topGroup(groups);
  if (!top || rows.length === 0) return null;
  const labels = zhTW.overview.columns;
  const worst = MODULE_FIELDS.map((f) => ({ f, n: rows.filter((r) => r[f].color !== 'green').length })).reduce((a, b) =>
    b.n > a.n ? b : a,
  );
  const head = t.headingTop(top.label ?? t.missing, top.count);
  if (worst.n === 0) return head;
  return head + (worst.n === rows.length ? t.headingNoGreen(labels[worst.f]) : t.headingNotGreen(labels[worst.f], worst.n));
}
