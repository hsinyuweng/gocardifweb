import { Fragment } from 'react';
import { Link } from 'react-router';

export interface BreadcrumbItem {
  label: string;
  /** 有值時可點擊 */
  to?: string;
}

export interface TopBarNotice {
  tone: 'warning' | 'info';
  text: string;
}

interface TopBarProps {
  breadcrumb: BreadcrumbItem[];
  /** 狀態提示（離線資料、版本不符），僅在需要時傳入 */
  notices: TopBarNotice[];
}

/** 頂部列（第 10.2 節） */
export function TopBar({ breadcrumb, notices }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6 print:hidden">
      <nav aria-label="breadcrumb" className="flex min-w-0 items-center gap-2 text-slate-500">
        {breadcrumb.map((item, i) => {
          const last = i === breadcrumb.length - 1;
          return (
            <Fragment key={`${i}-${item.label}`}>
              {i > 0 ? <span className="text-slate-300">/</span> : null}
              {item.to && !last ? (
                <Link to={item.to} className="hover:text-navy-800 hover:underline">
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
        <div className="flex shrink-0 items-center gap-2">
          {notices.map((n) => (
            <span
              key={n.text}
              className={`rounded px-2 py-1 text-xs ${
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
