import type { OverviewRow, RecommendationGroup } from '../types/viewModel';
import { zhTW } from '../i18n/zh-TW';
import type { HeadlinePart } from './insights';
import type { KeyNumber } from './marketStory';

// 競品研究頁的閱讀路徑內容（2026-11-01 顯示資料整理）：結論句、數字磚。只用報告清單的欄位。

const t = zhTW.overview.story;

/** 建議由好到壞（後端 legend.recommendation 的代碼）；不認得的排最後 */
const REC_ORDER = ['go', 'conditional_go', 'hold_missing_info', 'hold_resolve_red_flag', 'incomplete_review', 'not_recommended'];
export const recRank = (key: string | null) => {
  const i = REC_ORDER.indexOf(key ?? '');
  return i === -1 ? REC_ORDER.length : i;
};

/** 依建議由好到壞，再依法規可行性由高到低（2026-11-01，與競品研究列表預設排序一致） */
export function rankRows(rows: OverviewRow[]): OverviewRow[] {
  const feas = (r: OverviewRow) => r.dimensionScores?.feasibility?.score ?? -1;
  return [...rows].sort((a, b) => recRank(a.recommendationKey) - recRank(b.recommendationKey) || feas(b) - feas(a));
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

/** 數字磚（2026-11-01 顯示資料整理）：最值得看（最好的建議，珊瑚）、法規可行性最高、潛在市場最大 */
export function researchNumbers(rows: OverviewRow[], groups: RecommendationGroup[]): KeyNumber[] {
  const out: KeyNumber[] = [];
  const best = groupsByRank(groups)[0];
  if (best) {
    out.push({
      key: 'best',
      label: t.tile.best(best.label ?? t.missing),
      value: t.count(best.count),
      note: best.count <= NAME_LIMIT ? names(rows, best.key).join('、') : t.tile.ofTotal(rows.length),
      coral: true,
    });
  }
  const top = <T,>(get: (r: OverviewRow) => T | null | undefined, by: (v: T) => number) =>
    rows
      .flatMap((r) => {
        const v = get(r);
        return v === null || v === undefined ? [] : [{ r, v }];
      })
      .sort((a, b) => by(b.v) - by(a.v))[0];
  const feas = top((r) => r.dimensionScores?.feasibility?.score, (v) => v);
  if (feas) out.push({ key: 'feasibility', label: t.tile.topFeasibility, value: t.tile.points(feas.v), note: feas.r.name ?? t.missing });
  const market = top((r) => r.dimensionScores?.marketSize, (d) => d.value ?? -1);
  if (market?.v.valueText) out.push({ key: 'market', label: t.tile.topMarket, value: market.v.valueText, note: market.r.name ?? t.missing });
  return out;
}
