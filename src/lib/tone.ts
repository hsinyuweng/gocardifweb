// 好壞顏色（2026-11-01 使用者回饋，全站統一）：好的結果綠色、壞的結果珊瑚紅；
// 不分好壞、只是重點的數字用目前頁面代表色深色。不要再用珊瑚紅標「重點」。

export type Tone = 'good' | 'bad' | 'key';

/** 文字色 */
export const TONE_TEXT: Record<Tone, string> = {
  good: 'text-good',
  bad: 'text-coral',
  key: 'text-p-ink',
};

/** 數字的好壞：正為好、負為壞、0 不標 */
export const signTone = (v: number | null | undefined): Tone | undefined =>
  v === null || v === undefined || v === 0 ? undefined : v > 0 ? 'good' : 'bad';

/** 帶正負號的百分比：「+51.9%」「-1.8%」 */
export const signedPct = (v: number, digits = 1) => `${v > 0 ? '+' : ''}${v.toFixed(digits)}%`;
