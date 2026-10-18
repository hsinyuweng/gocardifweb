import { NavLink } from 'react-router';
import type { AppMetaViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';

const t = zhTW.nav;

interface SidebarProps {
  meta: AppMetaViewModel;
  showRoadmapNav: boolean;
}

function navClass({ isActive }: { isActive: boolean }) {
  return `block rounded px-3 py-2 transition-colors ${
    isActive ? 'bg-white/15 font-semibold text-white' : 'text-slate-200 hover:bg-white/10 hover:text-white'
  }`;
}

/** 左側固定導覽列（第 10.1 節） */
export function Sidebar({ meta, showRoadmapNav }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 flex w-[232px] flex-col bg-navy-800 text-slate-100">
      <div className="flex h-14 items-center border-b border-white/10 px-5 text-base font-semibold tracking-wide text-white">
        {zhTW.appName}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          <li>
            <NavLink to="/" end className={navClass}>
              {t.overview}
            </NavLink>
          </li>
          <li>
            <NavLink to="/guide" className={navClass}>
              {t.guide}
            </NavLink>
          </li>
        </ul>

        {showRoadmapNav ? (
          <div className="mt-6">
            <div className="px-3 pb-2 text-xs text-slate-400">{t.roadmapGroup}</div>
            <ul className="space-y-1">
              {t.roadmapItems.map((item) => (
                // 規劃中功能：灰色、不可點擊、游標不變（原則 6）
                <li
                  key={item}
                  aria-disabled="true"
                  className="flex cursor-default items-center justify-between rounded px-3 py-2 text-slate-400 select-none"
                >
                  <span>{item}</span>
                  <span className="rounded bg-white/10 px-1.5 py-0.5 text-[11px] text-slate-300">
                    {zhTW.common.roadmap}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </nav>

      <div className="space-y-1 border-t border-white/10 px-5 py-3 text-xs text-slate-300">
        <div>
          {t.dataUpdated}
          {orDash(meta.generatedAt)}
        </div>
        <div>
          {t.dataSource}
          {meta.dataSource === 'api' ? t.dataSourceApi : t.dataSourceStatic}
        </div>
      </div>
    </aside>
  );
}
