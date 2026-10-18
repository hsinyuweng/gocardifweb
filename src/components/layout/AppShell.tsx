import type { ReactNode } from 'react';
import type { AppMetaViewModel } from '../../types/viewModel';
import { Sidebar } from './Sidebar';
import { TopBar, type BreadcrumbItem, type TopBarNotice } from './TopBar';

interface AppShellProps {
  meta: AppMetaViewModel;
  showRoadmapNav: boolean;
  breadcrumb: BreadcrumbItem[];
  notices: TopBarNotice[];
  children: ReactNode;
}

/** 所有頁面共用版面（第 10 節）：只接收 props，不取資料 */
export function AppShell({ meta, showRoadmapNav, breadcrumb, notices, children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <Sidebar meta={meta} showRoadmapNav={showRoadmapNav} />
      <div className="ml-[232px] flex min-h-screen flex-col">
        <TopBar breadcrumb={breadcrumb} notices={notices} />
        {/* 主內容：左右內距 24px，超過 1600px 置中（第 10.3 節） */}
        <main className="mx-auto w-full max-w-[1600px] flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
