import type { OverviewRow, RecommendationGroup, SignalColor } from '../types/viewModel';
import { zhTW } from '../i18n/zh-TW';
import type { HeadlinePart } from './insights';
import type { KeyNumber } from './marketStory';
import { scoreRow, type Weights } from './score';

// 競品研究頁的閱讀路徑內容（2026-10-27 V6）：結論句、數字磚、圖表標題、三面向燈號表。只用報告清單的欄位。

const t = zhTW.overview.story;

/** 件數最多的建議（同數取第一個） */
function topGroup(groups: RecommendationGroup[]): RecommendationGroup | null {
  return groups.reduce<RecommendationGroup | null>((a, b) => (a === null || b.count > a.count ? b : a), null);
}

/** 建議由好到壞（後端 legend.recommendation 的代碼）；不認得的排最後 */
const REC_ORDER = ['go', 'conditional_go', 'hold_missing_info', 'hold_resolve_red_flag', 'incomplete_review', 'not_recommended'];
export const recRank = (key: string | null) => {
  const i = REC_ORDER.indexOf(key ?? '');
  return i === -1 ? REC_ORDER.length : i;
};

/** 依建議由好到壞，再依綜合分數由高到低 */
export function rankRows(rows: OverviewRow[], weights: Weights): OverviewRow[] {
  const total = (r: OverviewRow) => scoreRow(r, weights).total ?? -1;
  return [...rows].sort((a, b) => recRank(a.recommendationKey) - recRank(b.recommendationKey) || total(b) - total(a));
}

/** 建議分組，由好到壞 */
export function groupsByRank(groups: RecommendationGroup[]): RecommendationGroup[] {
  return [...groups].sort((a, b) => recRank(a.key) - recRank(b.key));
}

const NAME_LIMIT = 2;
const names = (rows: OverviewRow[], key: string | null) =>
  rows.filter((r) => r.recommendationKey === key).map((r) => r.name ?? t.missing);

/**
 * 「8 件國外商品中，CareScout…長期照顧保險「有條件推進」；其餘 7 件「暫緩，待補資料」」（2026-10-31，取代審閱進度）：
 * 最好的建議 2 件以內寫商品名（珊瑚色），否則寫件數；其他建議依由好到壞列件數。
 */
export function researchHeadline(rows: OverviewRow[], groups: RecommendationGroup[]): HeadlinePart[] {
  const [best, ...rest] = groupsByRank(groups);
  if (!best) return [];
  const label = best.label ?? t.missing;
  const who = best.count <= NAME_LIMIT ? names(rows, best.key).join('、') : t.count(best.count);
  const parts: HeadlinePart[] = [{ text: t.leadOf(rows.length) }, { text: who, strong: true }, { text: t.quoted(label) }];
  if (rest.length > 0) parts.push({ text: t.restOf(rest.map((g) => `${t.count(g.count)}${t.quoted(g.label ?? t.missing)}`).join('、')) });
  return parts;
}

/** 數字磚：最好的建議（珊瑚）、次一種建議、待解決事項、綜合分數最高 */
export function researchNumbers(rows: OverviewRow[], groups: RecommendationGroup[], weights: Weights): KeyNumber[] {
  const ranked = groupsByRank(groups);
  const sum = (k: 'critical' | 'blocking' | 'warning') => rows.reduce((n, r) => n + r.blockerCounts[k], 0);
  const out: KeyNumber[] = ranked.slice(0, 2).map((g, i) => ({
    key: `rec-${g.key ?? 'none'}`,
    label: g.label ?? t.missing,
    value: t.count(g.count),
    note: g.count <= NAME_LIMIT ? names(rows, g.key).join('、') : t.tile.ofTotal(rows.length),
    coral: i === 0,
  }));
  const critical = sum('critical');
  out.push({
    key: 'blockers',
    label: t.tile.blockers,
    value: t.tile.blocking(sum('blocking')),
    note: critical > 0 ? t.tile.withCritical(critical, sum('warning')) : t.tile.warning(sum('warning')),
  });
  const top = rows
    .map((r) => ({ r, total: scoreRow(r, weights).total }))
    .filter((x): x is { r: OverviewRow; total: number } => x.total !== null)
    .sort((a, b) => b.total - a.total)[0];
  if (top) out.push({ key: 'top-score', label: t.tile.topScore, value: String(top.total), note: top.r.name ?? t.missing });
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
