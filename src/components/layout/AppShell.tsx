import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import type { AppMetaViewModel } from '../../types/viewModel';
import { Sidebar, type MyUnitControl } from './Sidebar';
import { TopBar, type BreadcrumbItem, type TopBarNotice } from './TopBar';

interface AppShellProps {
  meta: AppMetaViewModel;
  showRoadmapNav: boolean;
  breadcrumb: BreadcrumbItem[];
  notices: TopBarNotice[];
  myUnit: MyUnitControl;
  children: ReactNode;
}

/**
 * 所有頁面共用版面（第 10 節）：只接收 props，不取資料。
 * 寬度 1024px 以下：側邊導覽收合為選單按鈕，點開後由左側滑出（第 4 節 RWD）。
 */
export function AppShell({ meta, showRoadmapNav, breadcrumb, notices, myUnit, children }: AppShellProps) {
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  // 換頁時關閉選單
  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  // Esc 關閉選單
  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNavOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navOpen]);

  return (
    <div className="min-h-screen">
      <Sidebar
        meta={meta}
        showRoadmapNav={showRoadmapNav}
        myUnit={myUnit}
        mobileOpen={navOpen}
        onClose={() => setNavOpen(false)}
      />
      {navOpen ? (
        <div aria-hidden className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={() => setNavOpen(false)} />
      ) : null}
      <div className="flex min-h-screen flex-col lg:ml-[232px] print:ml-0 print:block print:min-h-0">
        <TopBar breadcrumb={breadcrumb} notices={notices} menuOpen={navOpen} onMenuClick={() => setNavOpen(true)} />
        {/* 主內容：左右內距 24px，超過 1600px 置中（第 10.3 節）；列印時全寬 */}
        <main className="mx-auto w-full max-w-[1600px] flex-1 px-6 py-6 print:max-w-none print:p-0">{children}</main>
      </div>
    </div>
  );
}
