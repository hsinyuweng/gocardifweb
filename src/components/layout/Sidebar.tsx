import { useState } from 'react';
import { NavLink } from 'react-router';
import type { AppMetaViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';

const t = zhTW.nav;

/** 我的單位（2026-10-18 經確認新增）：報告頁與我的待辦的預設負責單位 */
export interface MyUnitControl {
  value: string | null;
  /** 單位選項；尚未讀取完成時為 null */
  options: string[] | null;
  onRequestOptions: () => void;
  onChange: (unit: string | null) => void;
}

interface SidebarProps {
  meta: AppMetaViewModel;
  showRoadmapNav: boolean;
  myUnit: MyUnitControl;
  /** 1024px 以下：選單是否展開 */
  mobileOpen: boolean;
  onClose: () => void;
}

function navClass({ isActive }: { isActive: boolean }) {
  return `block rounded px-3 py-2 transition-colors ${
    isActive ? 'bg-white/15 font-semibold text-white' : 'text-slate-200 hover:bg-white/10 hover:text-white'
  }`;
}

const linkButton = 'ml-1 text-slate-100 underline underline-offset-2 hover:text-white';

/** 顯示「我的單位：○○ 更改」；按更改後改為下拉＋取消 */
function MyUnitSetting({ value, options, onRequestOptions, onChange }: MyUnitControl) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <div>
        {t.myUnit}
        {value ?? t.myUnitUnset}
        <button
          type="button"
          className={linkButton}
          onClick={() => {
            onRequestOptions();
            setEditing(true);
          }}
        >
          {value === null ? t.myUnitSet : t.myUnitChange}
        </button>
      </div>
    );
  }

  // 已設定但不在目前資料中的單位仍列出，避免選單看不到目前值
  const list = options === null ? null : value !== null && !options.includes(value) ? [value, ...options] : options;
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span>{t.myUnit}</span>
      {list === null ? (
        <span>{zhTW.common.loading}</span>
      ) : (
        <select
          autoFocus
          aria-label={t.myUnit}
          value={value ?? ''}
          onChange={(e) => {
            onChange(e.target.value === '' ? null : e.target.value);
            setEditing(false);
          }}
          className="h-7 max-w-[140px] rounded border border-white/20 bg-navy-900 px-1 text-slate-100"
        >
          <option value="">{t.myUnitUnset}</option>
          {list.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      )}
      <button type="button" className={linkButton} onClick={() => setEditing(false)}>
        {t.myUnitCancel}
      </button>
    </div>
  );
}

/** 左側固定導覽列（第 10.1 節） */
export function Sidebar({ meta, showRoadmapNav, myUnit, mobileOpen, onClose }: SidebarProps) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-[232px] flex-col bg-navy-800 text-slate-100 transition-transform lg:translate-x-0 print:hidden ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-14 items-center justify-between border-b border-white/10 px-5 text-base font-semibold tracking-wide text-white">
        {zhTW.appName}
        <button
          type="button"
          onClick={onClose}
          aria-label={zhTW.layout.closeMenu}
          className="-mr-2 rounded p-1 text-slate-300 hover:bg-white/10 hover:text-white lg:hidden"
        >
          <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          <li>
            <NavLink to="/" end className={navClass}>
              {t.home}
            </NavLink>
          </li>
          <li>
            <NavLink to="/news" className={navClass}>
              {t.news}
            </NavLink>
          </li>
          <li>
            <NavLink to="/market" className={navClass}>
              {t.market}
            </NavLink>
          </li>
          <li>
            <NavLink to="/watchlist" className={navClass}>
              {t.watchlist}
            </NavLink>
          </li>
          <li>
            <NavLink to="/research" className={navClass}>
              {t.overview}
            </NavLink>
          </li>
          {/* 規格外新增（2026-10-18 經確認，修改第 10.1 節） */}
          <li>
            <NavLink to="/tasks" className={navClass}>
              {t.tasks}
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
        <MyUnitSetting {...myUnit} />
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
