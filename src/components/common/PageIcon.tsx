import type { ReactNode } from 'react';

export type PageIconName = 'home' | 'news' | 'pulse' | 'research' | 'watchlist' | 'tasks' | 'guide';

// 簡單線條圖示（currentColor），viewBox 20×20
const PATHS: Record<PageIconName, ReactNode> = {
  home: <path d="M3.5 9.5L10 4l6.5 5.5V16a.8.8 0 0 1-.8.8H12.5v-4.8h-5v4.8H4.3a.8.8 0 0 1-.8-.8z" />,
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
  tasks: (
    <>
      <rect x="4" y="3.5" width="12" height="13" rx="1.5" />
      <path d="M7 8l1.5 1.5L11.5 6.5M7 13h6" />
    </>
  ),
  guide: (
    <>
      <circle cx="10" cy="10" r="6.5" />
      <path d="M8.2 8.2a1.9 1.9 0 1 1 2.6 1.8c-.5.2-.8.6-.8 1.1v.4M10 13.8v.1" />
    </>
  ),
};

/** 代表色深底、白色線條的方形圖示（頁首 40px、首頁框 30px） */
export function PageBadge({ icon, size = 'lg' }: { icon: PageIconName; size?: 'lg' | 'sm' }) {
  const box = size === 'lg' ? 'size-10 rounded-xl' : 'size-[30px] rounded-[9px]';
  const svg = size === 'lg' ? 'size-[22px]' : 'size-4';
  return (
    <span className={`grid shrink-0 place-items-center bg-p ${box}`} aria-hidden>
      <svg
        viewBox="0 0 20 20"
        className={`${svg} text-white`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {PATHS[icon]}
      </svg>
    </span>
  );
}
