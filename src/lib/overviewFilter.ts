import type { OverviewRow } from '../types/viewModel';

// 案件總覽的篩選與排序（只處理 ViewModel，不讀原始 JSON）

export type SortKey = 'name' | 'generatedDate';
export type SortDir = 'asc' | 'desc';

export interface OverviewFilters {
  /** null 表示「全部」；{ key } 表示只看該 recommendation（key 可能為 null，代表缺漏者） */
  recommendation: { key: string | null } | null;
  search: string;
  /** 空字串表示全部 */
  country: string;
  category: string;
}

export const DEFAULT_FILTERS: OverviewFilters = { recommendation: null, search: '', country: '', category: '' };

/** 切換欄位時的預設方向：商品 A→Z、產出日期新→舊 */
export const DEFAULT_SORT_DIR: Record<SortKey, SortDir> = { name: 'asc', generatedDate: 'desc' };

export function filterRows(rows: OverviewRow[], f: OverviewFilters): OverviewRow[] {
  const q = f.search.trim().toLowerCase();
  return rows.filter((r) => {
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
  return [...rows].sort((a, b) => {
    const va = a[key];
    const vb = b[key];
    if (va === vb) return 0;
    if (va === null) return 1;
    if (vb === null) return -1;
    return sign * va.localeCompare(vb, 'zh-Hant-TW');
  });
}
