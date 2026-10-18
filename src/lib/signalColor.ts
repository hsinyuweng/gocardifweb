import type { SignalColor } from '../types/viewModel';

// 第 9.2 節：color 名稱 → Tailwind 色系
// class 名稱需完整寫出，Tailwind 才能在建置時掃描到。

const KNOWN: readonly SignalColor[] = ['green', 'yellow', 'orange', 'red', 'gray'];

/** 未列出的名稱（含 null）一律當作 gray */
export function toSignalColor(name: string | null | undefined): SignalColor {
  return KNOWN.includes(name as SignalColor) ? (name as SignalColor) : 'gray';
}

/** 色點 */
export const DOT_CLASS: Record<SignalColor, string> = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-400',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  gray: 'bg-slate-400',
};

/** 淡色底標籤（整體建議） */
export const SOFT_BADGE_CLASS: Record<SignalColor, string> = {
  green: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  yellow: 'bg-amber-50 text-amber-800 ring-amber-200',
  orange: 'bg-orange-50 text-orange-800 ring-orange-200',
  red: 'bg-red-50 text-red-800 ring-red-200',
  gray: 'bg-slate-100 text-slate-700 ring-slate-200',
};
