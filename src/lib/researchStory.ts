import type { OverviewRow, RecommendationGroup } from '../types/viewModel';
import { zhTW } from '../i18n/zh-TW';
import type { HeadlinePart } from './insights';
import type { KeyNumber } from './marketStory';
import { scoreOf } from './introScore';
import { isRecommended } from './recommendation';

// 競品研究頁與首頁的閱讀路徑內容（2026-11-01 使用者回饋）：結論句、數字卡、全站共用的商品排序。只用報告清單的欄位。

const t = zhTW.overview.story;

/** 建議由好到壞（後端 legend.recommendation 的代碼）；不認得的排最後 */
const REC_ORDER = ['go', 'conditional_go', 'hold_missing_info', 'hold_resolve_red_flag', 'incomplete_review', 'not_recommended'];
export const recRank = (key: string | null) => {
  const i = REC_ORDER.indexOf(key ?? '');
  return i === -1 ? REC_ORDER.length : i;
};

/** 阻斷項目數（重大＋阻斷） */
export const blockingOf = (r: OverviewRow) => r.blockerCounts.critical + r.blockerCounts.blocking;
/** 潛在市場（中間情境，元）；沒有時 -1 */
export const marketOf = (r: OverviewRow) => r.dimensionScores?.marketSize?.value ?? -1;

/** 同分時：建議由好到壞 → 阻斷項目少 → 潛在市場大 */
export const tieBreak = (a: OverviewRow, b: OverviewRow) =>
  recRank(a.recommendationKey) - recRank(b.recommendationKey) || blockingOf(a) - blockingOf(b) || marketOf(b) - marketOf(a);

/**
 * 全站共用的商品排序（2026-11-01 第二輪）：引進分數高的在前（lib/introScore.ts），同分見 tieBreak。
 * 用在首頁、競品研究預設排序、追蹤清單。
 */
export function rankRows(rows: OverviewRow[]): OverviewRow[] {
  return [...rows].sort((a, b) => scoreOf(b) - scoreOf(a) || tieBreak(a, b));
}

/** 建議分組，由好到壞 */
export function groupsByRank(groups: RecommendationGroup[]): RecommendationGroup[] {
  return [...groups].sort((a, b) => recRank(a.key) - recRank(b.key));
}

const NAME_LIMIT = 2;
const display = (r: OverviewRow) => r.shortName ?? r.name ?? t.missing;

/** 一句結論分兩行：主句（推薦什麼）與第二行（其餘怎樣） */
export interface ResearchHeadline {
  parts: HeadlinePart[];
  sub: HeadlinePart[];
}

/**
 * 「推薦：CareScout 長照險（有條件推進）」／「其餘 7 件暫緩：缺商品資料」（2026-11-01 使用者回饋：改排版、用簡稱）。
 * 沒有推進的商品時：「8 件國外商品目前都還不能推進」／「7 件暫緩：缺商品資料、1 件…」。
 */
export function researchHeadline(rows: OverviewRow[], groups: RecommendationGroup[]): ResearchHeadline | null {
  const ranked = groupsByRank(groups);
  if (ranked.length === 0) return null;
  const good = ranked.filter((g) => isRecommended(g.key));
  const rest = ranked.filter((g) => !isRecommended(g.key));
  const list = (gs: RecommendationGroup[]) => gs.map((g) => `${t.count(g.count)}${g.label ?? t.missing}`).join('、');
  if (good.length === 0) return { parts: [{ text: t.noneRecommended(rows.length) }], sub: [{ text: list(rest) }] };
  const recRows = rankRows(rows).filter((r) => isRecommended(r.recommendationKey));
  const labels = good.map((g) => g.label ?? t.missing).join('、');
  // 推薦的商品名用珊瑚紅字突顯、可點進報告頁（2026-11-01：首頁淺綠底上綠字不夠突顯；試過白框不好看）；超過 2 件只寫件數
  const who: HeadlinePart[] =
    recRows.length <= NAME_LIMIT
      ? recRows.flatMap((r, i) => [
          ...(i > 0 ? [{ text: '、' }] : []),
          { text: display(r), highlight: true, href: reportHref(r) },
        ])
      : [{ text: t.count(recRows.length), tone: 'good' }];
  return {
    parts: [{ text: t.recommend }, ...who, { text: t.paren(labels) }],
    sub: rest.length > 0 ? [{ text: t.restOf(list(rest)) }] : [],
  };
}

/** 卡關原因歸類：同一件事的不同寫法算在一起 */
const BLOCKER_THEMES: ReadonlyArray<{ re: RegExp; label: string }> = [
  { re: /利率|回報率/, label: '保證利率／預定利率未提供' },
  { re: /險種歸類|可銷售/, label: '險種歸類與可銷售性待確認' },
];
const themeOf = (s: string) => BLOCKER_THEMES.find((x) => x.re.test(s))?.label ?? s;

/** 還不能推進的商品中，最常見的卡關原因（至少 2 件才算） */
export function commonBlocker(rows: OverviewRow[]): { label: string; count: number } | null {
  const held = rows.filter((r) => !isRecommended(r.recommendationKey));
  const counts = new Map<string, number>();
  for (const r of held) if (r.topBlocker) counts.set(themeOf(r.topBlocker), (counts.get(themeOf(r.topBlocker)) ?? 0) + 1);
  const [label, count] = [...counts].sort((a, b) => b[1] - a[1])[0] ?? [];
  return label !== undefined && count !== undefined && count >= 2 ? { label, count } : null;
}

const reportHref = (r: OverviewRow) => (r.reportId ? `/report/${encodeURIComponent(r.reportId)}` : undefined);

/** 數字卡（2026-11-01 使用者回饋）：推薦（商品名可點進報告）、最常見的卡關原因、台灣潛在市場最大 */
export function researchNumbers(rows: OverviewRow[]): KeyNumber[] {
  const out: KeyNumber[] = [];
  const ranked = rankRows(rows);
  const rec = ranked.filter((r) => isRecommended(r.recommendationKey));
  if (rec.length === 1) {
    const r = rec[0]!;
    out.push({
      key: 'best',
      label: t.tile.best(r.recommendation.text ?? t.missing),
      value: display(r),
      href: reportHref(r),
      note: r.topBlocker ? zhTW.home.stuckOn(r.topBlocker) : zhTW.home.noBlocker,
      tone: 'good',
    });
  } else if (rec.length > 1) {
    out.push({ key: 'best', label: t.tile.bestMany, value: t.count(rec.length), note: rec.map(display).join('、'), tone: 'good' });
  }
  const common = commonBlocker(rows);
  if (common) {
    // 大字直接寫原因本身（2026-11-01 第二輪：「4 件」看不出卡在什麼）
    out.push({ key: 'blocker', label: t.tile.commonBlocker, value: common.label, note: t.tile.commonBlockerNote(common.count), small: true });
  }
  const market = [...rows].filter((r) => marketOf(r) >= 0).sort((a, b) => marketOf(b) - marketOf(a))[0];
  if (market?.dimensionScores?.marketSize?.valueText) {
    out.push({ key: 'market', label: t.tile.topMarket, value: market.dimensionScores.marketSize.valueText, note: display(market), href: undefined });
  }
  return out;
}
