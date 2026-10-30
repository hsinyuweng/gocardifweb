import { zhTW } from '../i18n/zh-TW';

// 等級的相對說明（2026-10-31 使用者要求：A/B/C、T1/T2 這類不直觀的等級都要註明哪端高）。
// 後端還沒給各等級的定義，只寫相對關係；拿到定義後改這裡。

const t = zhTW.grade;

/** 一組等級的高低說明：字母「A 最高、C 最低」（出現 D、E 時延伸）；T 開頭數字「T1 最高、數字越大越低」；認不得時 null */
export function gradeScale(levels: readonly (string | null | undefined)[]): string | null {
  const list = levels.filter((l): l is string => !!l);
  if (list.length === 0) return null;
  if (list.every((l) => /^[A-E]$/.test(l))) {
    const lowest = list.reduce((a, b) => (b > a ? b : a), 'C');
    return t.letters(lowest);
  }
  if (list.every((l) => /^T\d$/.test(l))) return t.tiers;
  return null;
}

/** 信心等級的說明一句：「信心等級：A 最高、C 最低」；不是字母時 null */
export function confidenceNote(levels: readonly (string | null | undefined)[]): string | null {
  const scale = gradeScale(levels);
  return scale ? t.confidenceNote(scale) : null;
}

/** 證據等級的說明一句：「證據等級：A 最高、C 最低，越高代表證據越直接可靠」 */
export function evidenceNote(levels: readonly (string | null | undefined)[]): string | null {
  const scale = gradeScale(levels);
  return scale ? t.evidenceNote(scale) : null;
}
