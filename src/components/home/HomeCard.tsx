import type { MouseEvent, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { zhTW } from '../../i18n/zh-TW';
import type { PageTheme } from '../../lib/pageTheme';
import { PageBadge, type PageIconName } from '../common/PageIcon';

interface HomeCardProps {
  theme: PageTheme;
  icon: PageIconName;
  title: string;
  /** 「看全部 →」與整框點擊的目的地 */
  to: string;
  children: ReactNode;
}

/**
 * 市場總覽的一框（2026-10-27 視覺改版）：框頂代表色極淡色帶＋圖示＋標題，右上「看全部 →」。
 * 整框可點（滑過時框線變代表色）；框內的連結（新聞標題、報告名稱）仍各自連到自己的頁面。
 * 鍵盤使用者用「看全部 →」連結。
 */
export function HomeCard({ theme, icon, title, to, children }: HomeCardProps) {
  const navigate = useNavigate();
  const onClick = (e: MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('a, button')) return;
    // 正在選取文字時不跳頁
    if (window.getSelection()?.toString()) return;
    void navigate(to, { state: { from: '/' } });
  };
  return (
    <section
      data-theme={theme}
      onClick={onClick}
      className="flex h-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-[14px] border border-line bg-white transition-colors hover:border-p"
    >
      <header className="flex items-center gap-2.5 border-b border-p-pale bg-p-faint px-5 py-2.5">
        <PageBadge icon={icon} size="sm" />
        <h2 className="text-[18px] font-semibold text-ink">{title}</h2>
        <Link to={to} state={{ from: '/' }} className="ml-auto text-[13px] text-ink2 hover:text-ink hover:underline">
          {zhTW.home.seeAll}
        </Link>
      </header>
      <div className="flex flex-1 flex-col gap-3 px-5 pt-3.5 pb-4">{children}</div>
    </section>
  );
}

/** 後端尚未提供資料時的卡片內容 */
export function PendingContent() {
  return <p className="text-slate-500">{zhTW.home.pending}</p>;
}

/** 框內第一行：重點數字（大字）＋一句說明 */
export function KeyLine({ num, coral, children }: { num: ReactNode; coral?: boolean; children: ReactNode }) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
      <span className={`text-[28px] leading-tight font-medium tabular-nums ${coral ? 'text-coral' : 'text-ink'}`}>{num}</span>
      <span className="text-ink2">{children}</span>
    </p>
  );
}
