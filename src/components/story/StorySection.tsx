import type { ReactNode } from 'react';

/** 閱讀路徑 ④「圖表證據」：白卡段落，一句標題說出圖要證明什麼（18px）＋圖 */
export function StorySection({ heading, children, id }: { heading: ReactNode; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="scroll-mt-28 space-y-4 rounded-xl border border-line bg-white px-7 pt-5 pb-5">
      <h2 className="text-[18px] leading-normal font-medium text-ink">{heading}</h2>
      {children}
    </section>
  );
}

/** 往下捲才是細節：「細節」分隔線 */
export function DetailDivider({ id, label }: { id: string; label: string }) {
  return (
    <div id={id} className="flex scroll-mt-28 items-center gap-3 text-[13px] text-muted after:flex-1 after:border-t after:border-line">
      {label}
    </div>
  );
}

/** 圖的小標題 */
export function ChartTitle({ children, note }: { children: ReactNode; note?: string }) {
  return (
    <p className="mb-2.5 text-[13px] text-ink2">
      {children}
      {note ? <span className="ml-1.5 text-xs text-muted">{note}</span> : null}
    </p>
  );
}
