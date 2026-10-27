import type { ReactNode } from 'react';
import { PageBadge, type PageIconName } from '../common/PageIcon';

interface PageHeaderProps {
  icon: PageIconName;
  title: ReactNode;
  /** 一行頁面說明 */
  desc?: string;
  /** 右側：資料期間、更新時間或頁面工具 */
  aside?: ReactNode;
}

/** 閱讀路徑 ①「我在哪裡」：代表色圖示＋頁名＋一行說明，右側資料時間（2026-10-27 視覺改版） */
export function PageHeader({ icon, title, desc, aside }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-x-3.5 gap-y-2 border-b border-p-pale pb-3.5">
      <PageBadge icon={icon} />
      <div className="min-w-0">
        <h1 className="text-[24px] leading-tight font-semibold text-ink">{title}</h1>
        {desc ? <p className="mt-0.5 text-[13px] text-ink2">{desc}</p> : null}
      </div>
      {aside ? <div className="ml-auto self-end text-xs text-muted">{aside}</div> : null}
    </header>
  );
}
