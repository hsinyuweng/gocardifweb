import { Fragment } from 'react';
import { Link } from 'react-router';
import { zhTW } from '../../i18n/zh-TW';

export interface BreadcrumbItem {
  label: string;
  /** 有值時可點擊 */
  to?: string;
  /** 連結附帶的 location.state（讓上一層頁面的麵包屑也能接著返回） */
  state?: unknown;
}

export interface TopBarNotice {
  tone: 'warning' | 'info';
  text: string;
}

interface TopBarProps {
  breadcrumb: BreadcrumbItem[];
  /** 狀態提示（離線資料、版本不符），僅在需要時傳入 */
  notices: TopBarNotice[];
  /** 1024px 以下的選單按鈕 */
  menuOpen: boolean;
  onMenuClick: () => void;
}

/** 頂部列（第 10.2 節） */
export function TopBar({ breadcrumb, notices, menuOpen, onMenuClick }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 print:hidden">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label={zhTW.layout.openMenu}
        aria-expanded={menuOpen}
        className="-ml-2 rounded p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden"
      >
        <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="round" />
        </svg>
      </button>
      <nav aria-label="breadcrumb" className="flex min-w-0 flex-1 items-center gap-2 text-slate-500">
        {breadcrumb.map((item, i) => {
          const last = i === breadcrumb.length - 1;
          return (
            <Fragment key={`${i}-${item.label}`}>
              {i > 0 ? <span className="text-slate-300">/</span> : null}
              {item.to && !last ? (
                <Link to={item.to} state={item.state} className="hover:text-navy-800 hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span className={`truncate ${last ? 'font-medium text-slate-800' : ''}`}>{item.label}</span>
              )}
            </Fragment>
          );
        })}
      </nav>

      {notices.length > 0 ? (
        <div className="flex min-w-0 shrink items-center gap-2">
          {notices.map((n) => (
            <span
              key={n.text}
              title={n.text}
              className={`truncate rounded px-2 py-1 text-xs ${
                n.tone === 'warning' ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-200' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {n.text}
            </span>
          ))}
        </div>
      ) : null}
    </header>
  );
}
