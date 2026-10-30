import type { ReactNode } from 'react';

/** E 區分頁內的小區塊標題＋內容 */
export function DetailBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="break-inside-avoid">
      <h3 className="mb-1.5 text-sm font-medium text-ink">{title}</h3>
      {children}
    </div>
  );
}
