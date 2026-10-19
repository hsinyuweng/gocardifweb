import type { ReactNode } from 'react';
import { zhTW } from '../../i18n/zh-TW';

export type HomeCardIcon = 'news' | 'pulse' | 'research' | 'watchlist';

// 簡單線條圖示（currentColor），對應示意圖
const ICON_PATHS: Record<HomeCardIcon, ReactNode> = {
  news: (
    <>
      <rect x="4" y="3.5" width="12" height="13" rx="1.5" />
      <path d="M7 7h6M7 10h6M7 13h4" />
    </>
  ),
  pulse: <path d="M3 15l4-5 3 3 4-6 3 3M3 17h14" />,
  research: (
    <>
      <circle cx="8.5" cy="8.5" r="5" />
      <path d="M12.2 12.2L17 17" />
    </>
  ),
  watchlist: <path d="M10 3l2.1 4.4 4.9.7-3.5 3.4.8 4.8L10 14l-4.3 2.3.8-4.8L3 8.1l4.9-.7L10 3z" />,
};

interface HomeCardProps {
  icon: HomeCardIcon;
  title: string;
  /** 標題右側（例如「看全部 →」） */
  action?: ReactNode;
  children: ReactNode;
}

/** 市場總覽的卡片外框 */
export function HomeCard({ icon, title, action, children }: HomeCardProps) {
  return (
    <section className="flex min-w-0 flex-col rounded-lg border border-slate-200 bg-white">
      <header className="flex min-h-12 items-center justify-between gap-3 px-5 pt-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <svg
            viewBox="0 0 20 20"
            className="size-5 text-slate-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            {ICON_PATHS[icon]}
          </svg>
          {title}
        </h2>
        {action}
      </header>
      <div className="flex-1 px-5 pt-3 pb-5">{children}</div>
    </section>
  );
}

/** 後端尚未提供資料時的卡片內容 */
export function PendingContent() {
  return <p className="text-slate-500">{zhTW.home.pending}</p>;
}
