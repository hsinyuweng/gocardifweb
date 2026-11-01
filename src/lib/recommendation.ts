import type { SignalText } from '../types/viewModel';
import { toSignalColor } from './signalColor';

// 整體建議的顯示（2026-11-01 使用者回饋）：後端「有條件推進」與「暫緩」都給黃色，看不出差別。
// 依建議代碼改用全站好壞色：推進＝好（綠）、不建議＝壞（紅）、暫緩與未完成＝灰；標籤改白話。

const COLOR_BY_KEY: Record<string, SignalText['color']> = {
  go: 'green',
  conditional_go: 'green',
  hold_missing_info: 'gray',
  hold_resolve_red_flag: 'gray',
  incomplete_review: 'gray',
  not_recommended: 'red',
};

const LABEL_BY_KEY: Record<string, string> = {
  hold_missing_info: '暫緩：缺商品資料',
};

export function recommendationDisplay(key: string | null, label: string | null, color: string | null | undefined): SignalText {
  return {
    color: (key !== null && COLOR_BY_KEY[key]) || toSignalColor(color),
    text: (key !== null && LABEL_BY_KEY[key]) || label,
  };
}

/** 推進類（有條件推進、建議推進） */
export const isRecommended = (key: string | null) => key === 'go' || key === 'conditional_go';
