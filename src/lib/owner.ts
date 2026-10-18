import { zhTW } from '../i18n/zh-TW';

// 第 9.5 節：負責單位以全形斜線「／」拆分；null 歸入「未指定」

export function splitOwners(owner: string | null): string[] {
  const parts = (owner ?? '')
    .split('／')
    .map((s) => s.trim())
    .filter((s) => s !== '');
  return parts.length > 0 ? parts : [zhTW.report.ownerUnassigned];
}

/** selected 為 null 表示「全部」 */
export function matchesOwner(owners: string[], selected: string | null): boolean {
  return selected === null || owners.includes(selected);
}

/** 依出現順序收集選項，「未指定」放最後 */
export function collectOwnerOptions(lists: string[][]): string[] {
  const seen = new Set<string>();
  for (const owners of lists) for (const o of owners) seen.add(o);
  const unassigned = zhTW.report.ownerUnassigned;
  const options = [...seen].filter((o) => o !== unassigned);
  return seen.has(unassigned) ? [...options, unassigned] : options;
}
