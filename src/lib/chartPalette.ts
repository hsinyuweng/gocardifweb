// 多系列圖表的顏色（2026-10-20 經使用者同意）。綠黃橘紅只用在燈號（D4），所以用藍、紫系。
// 已用 dataviz 驗證工具檢查（淺色背景）：明度、彩度、色覺辨識、對比全部通過。順序固定，不循環使用。
export const SERIES_COLORS = ['#2f5f9f', '#b07cc6', '#5a4a96', '#2f97c4'] as const;

/** 多線圖第二種辨識方式：實線／虛線交替 */
export const SERIES_DASH = [undefined, '5 3', undefined, '2 3'] as const;

/** 占比圖超過 4 項時合併成「其他」的顏色 */
export const OTHER_COLOR = '#cbd5e1';

export const MAX_SERIES = SERIES_COLORS.length;
