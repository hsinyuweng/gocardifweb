import type { ReactNode } from 'react';

/**
 * 等級說明（2026-10-31 使用者要求）：放在格子或段落最下面的小灰字，第一次看得到、看習慣後不礙眼。
 * 內容由 lib/grade.ts 產生；沒有內容時不顯示。
 */
export function GradeNote({ children, className = '' }: { children: ReactNode; className?: string }) {
  if (!children) return null;
  return <p className={`text-[11.5px] leading-snug text-muted ${className}`}>{children}</p>;
}
