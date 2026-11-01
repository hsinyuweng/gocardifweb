import { NavLink } from 'react-router';
import type { AppMetaViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';
import type { PageTheme } from '../../lib/pageTheme';

const t = zhTW.nav;

interface SidebarProps {
  meta: AppMetaViewModel;
  showRoadmapNav: boolean;
  /** 1024px 以下：選單是否展開 */
  mobileOpen: boolean;
  onClose: () => void;
}

function navClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors ${
    isActive ? 'bg-p-pale font-medium text-ink' : 'text-ink2 hover:bg-p-faint hover:text-ink'
  }`;
}

/** 導覽項目：前面一個代表色圓點；目前頁用代表色淡底（2026-10-27 視覺改版） */
function NavItem({ to, theme, label, end }: { to: string; theme: PageTheme; label: string; end?: boolean }) {
  return (
    <li data-theme={theme}>
      <NavLink to={to} end={end} className={navClass}>
        <span aria-hidden className="size-2 shrink-0 rounded-full bg-p" />
        {label}
      </NavLink>
    </li>
  );
}

/** 左側固定導覽列（第 10.1 節） */
export function Sidebar({ meta, showRoadmapNav, mobileOpen, onClose }: SidebarProps) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-[232px] flex-col border-r border-line bg-white text-ink transition-transform lg:translate-x-0 print:hidden ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-14 items-center justify-between border-b border-line px-5 text-base font-semibold tracking-wide text-[#3b4a7a]">
        {zhTW.appName}
        <button
          type="button"
          onClick={onClose}
          aria-label={zhTW.layout.closeMenu}
          className="-mr-2 rounded p-1 text-muted hover:bg-p-faint hover:text-ink lg:hidden"
        >
          <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          <NavItem to="/" end theme="home" label={t.home} />
          {/* 市場脈動在新聞上面（2026-10-27 使用者指定，與首頁四框順序一致） */}
          <NavItem to="/market" theme="pulse" label={t.market} />
          <NavItem to="/news" theme="news" label={t.news} />
          <NavItem to="/watchlist" theme="watch" label={t.watchlist} />
          <NavItem to="/research" theme="research" label={t.overview} />
          {/* 我的待辦 2026-10-27 V6 從導覽收起（只從報告頁負責單位篩選旁進入，網址照舊） */}
          <NavItem to="/guide" theme="plain" label={t.guide} />
        </ul>

        {showRoadmapNav ? (
          <div className="mt-6">
            <div className="px-3 pb-2 text-xs text-muted">{t.roadmapGroup}</div>
            <ul className="space-y-1">
              {t.roadmapItems.map((item) => (
                // 規劃中功能：灰色、不可點擊、游標不變（原則 6）
                <li
                  key={item}
                  aria-disabled="true"
                  className="flex cursor-default items-center justify-between rounded px-3 py-2 text-muted select-none"
                >
                  <span>{item}</span>
                  <span className="rounded bg-line px-1.5 py-0.5 text-[11px] text-muted">
                    {zhTW.common.roadmap}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </nav>

      <div className="space-y-1 border-t border-line px-5 py-3 text-xs text-muted">
        <div>
          {t.dataUpdated}
          {orDash(meta.generatedAt)}
        </div>
      </div>
    </aside>
  );
}
