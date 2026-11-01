import type { LegalJudgement } from '../types/viewModel';
import { zhTW } from '../i18n/zh-TW';
import type { Tone } from './tone';

// 法規判斷（2026-11-01 使用者回饋：法規只看能不能，違一條和一萬條都不能用）：
// 不顯示 0–100 分數，改用後端法規模組的判斷與紅、黃燈件數。卡住幾項看「阻斷」欄，這裡不重複。

const t = zhTW.legal;

export type LegalStatus = 'ok' | 'pending' | 'blocked';

export function legalStatus(j: LegalJudgement | null): LegalStatus | null {
  if (j === null) return null;
  if (j.red > 0) return 'blocked';
  if (j.verdict !== null && /可引進/.test(j.verdict)) return 'ok';
  return 'pending';
}

/** 顯示文字與好壞色：「可引進，需修改 7 處」（好）／「待確認」／「不可引進」（壞） */
export function legalText(j: LegalJudgement | null): { text: string; tone?: Tone } | null {
  const s = legalStatus(j);
  if (s === null || j === null) return null;
  if (s === 'blocked') return { text: t.blocked(j.red), tone: 'bad' };
  if (s === 'ok') return { text: j.yellow > 0 ? t.okWithFixes(j.yellow) : t.ok, tone: 'good' };
  return { text: t.pending };
}

/** 排序用：可引進 0、待確認 1、不可引進 2、沒有資料 3 */
export function legalRank(j: LegalJudgement | null): number {
  return { ok: 0, pending: 1, blocked: 2 }[legalStatus(j) ?? 'blocked'] + (j === null ? 1 : 0);
}
