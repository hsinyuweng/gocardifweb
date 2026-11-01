import type { OverviewRow } from '../types/viewModel';
import { recRank } from './researchStory';

// 競品研究（全部報告）的篩選與排序（只處理 ViewModel，不讀原始 JSON）

/** 2026-11-01：預設依整體建議（好到壞，同建議再依法規可行性高到低） */
export type SortKey = 'recommendation' | 'name' | 'market' | 'feasibility' | 'blocking' | 'competitors' | 'generatedDate';
const SORT_KEYS: readonly SortKey[] = ['recommendation', 'name', 'market', 'feasibility', 'blocking', 'competitors', 'generatedDate'];
export type SortDir = 'asc' | 'desc';

export interface OverviewFilters {
  /** null 表示「全部」；{ key } 表示只看該 recommendation（key 可能為 null，代表缺漏者） */
  recommendation: { key: string | null } | null;
  search: string;
  /** 空字串表示全部 */
  country: string;
  category: string;
  /** 只看未審閱（2026-10-20 經確認） */
  unread: boolean;
}

export const DEFAULT_FILTERS: OverviewFilters = {
  recommendation: null,
  search: '',
  country: '',
  category: '',
  unread: false,
};

/** 切換欄位時的預設方向：商品 A→Z、產出日期新→舊 */
export const DEFAULT_SORT_DIR: Record<SortKey, SortDir> = {
  recommendation: 'asc',
  name: 'asc',
  market: 'desc',
  feasibility: 'desc',
  blocking: 'asc',
  competitors: 'asc',
  generatedDate: 'desc',
};
export const DEFAULT_SORT_KEY: SortKey = 'recommendation';

const feasibility = (r: OverviewRow) => r.dimensionScores?.feasibility?.score ?? null;
const blockingCount = (r: OverviewRow) => r.blockerCounts.critical + r.blockerCounts.blocking;
/** 數字欄位的取值；null 一律排最後 */
const NUMERIC: Partial<Record<SortKey, (r: OverviewRow) => number | null>> = {
  recommendation: (r) => recRank(r.recommendationKey),
  market: (r) => r.dimensionScores?.marketSize?.value ?? null,
  feasibility,
  blocking: blockingCount,
  competitors: (r) => r.directCompetitors,
};

/** isUnread：判斷某列是否未審閱（未審閱篩選開啟時使用） */
export function filterRows(rows: OverviewRow[], f: OverviewFilters, isUnread: (r: OverviewRow) => boolean): OverviewRow[] {
  const q = f.search.trim().toLowerCase();
  return rows.filter((r) => {
    if (f.unread && !isUnread(r)) return false;
    if (f.recommendation && r.recommendationKey !== f.recommendation.key) return false;
    if (f.country && r.countryCode !== f.country) return false;
    if (f.category && r.category !== f.category) return false;
    if (q) {
      const hay = `${r.name ?? ''}\n${r.issuer ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/** null 一律排在最後 */
export function sortRows(rows: OverviewRow[], key: SortKey, dir: SortDir): OverviewRow[] {
  const sign = dir === 'asc' ? 1 : -1;
  const numeric = NUMERIC[key];
  const cmp = (va: number | string | null, vb: number | string | null) => {
    if (va === vb) return 0;
    if (va === null) return 1;
    if (vb === null) return -1;
    return sign * (typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), 'zh-Hant-TW'));
  };
  return [...rows].sort((a, b) => {
    const main = numeric ? cmp(numeric(a), numeric(b)) : cmp(a[key as 'name' | 'generatedDate'], b[key as 'name' | 'generatedDate']);
    if (main !== 0 || key !== 'recommendation') return main;
    // 同一種建議：法規可行性高的在前
    return (feasibility(b) ?? -1) - (feasibility(a) ?? -1);
  });
}

// 篩選與排序寫入網址：從報告頁返回時恢復原本狀態（導覽原則，2026-10-18 經確認）。預設值不寫入。
const P = {
  search: 'q',
  country: 'country',
  category: 'category',
  rec: 'rec',
  unread: 'unread',
  sort: 'sort',
  dir: 'dir',
} as const;
/** recommendation 缺漏者的網址值 */
const REC_MISSING = '__missing__';

export interface OverviewUrlState {
  filters: OverviewFilters;
  sortKey: SortKey;
  sortDir: SortDir;
}

export function readOverviewParams(params: URLSearchParams): OverviewUrlState {
  const rec = params.get(P.rec);
  const sortParam = params.get(P.sort);
  const sortKey: SortKey = SORT_KEYS.includes(sortParam as SortKey) ? (sortParam as SortKey) : DEFAULT_SORT_KEY;
  const dirParam = params.get(P.dir);
  return {
    filters: {
      recommendation: rec === null ? null : { key: rec === REC_MISSING ? null : rec },
      search: params.get(P.search) ?? '',
      country: params.get(P.country) ?? '',
      category: params.get(P.category) ?? '',
      unread: params.get(P.unread) === '1',
    },
    sortKey,
    sortDir: dirParam === 'asc' || dirParam === 'desc' ? dirParam : DEFAULT_SORT_DIR[sortKey],
  };
}

export function writeOverviewParams(s: OverviewUrlState): URLSearchParams {
  const p = new URLSearchParams();
  const f = s.filters;
  if (f.search !== '') p.set(P.search, f.search);
  if (f.country !== '') p.set(P.country, f.country);
  if (f.category !== '') p.set(P.category, f.category);
  if (f.recommendation !== null) p.set(P.rec, f.recommendation.key ?? REC_MISSING);
  if (f.unread) p.set(P.unread, '1');
  if (s.sortKey !== DEFAULT_SORT_KEY) p.set(P.sort, s.sortKey);
  if (s.sortDir !== DEFAULT_SORT_DIR[s.sortKey]) p.set(P.dir, s.sortDir);
  return p;
}
