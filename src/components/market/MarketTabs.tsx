import { Link } from 'react-router';
import type { PulseGroup } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import type { MarketTab } from '../../lib/marketStory';

const t = zhTW.market;

export const tabPath = (tab: MarketTab) => (tab === 'overview' ? '/market' : `/market/${tab}`);
export const tabLabel = (tab: MarketTab) => (tab === 'overview' ? t.overviewTab : t.groups[tab].title);

interface MarketTabsProps {
  groups: PulseGroup[];
  current: MarketTab;
  /** 切換分頁時帶著原本的 location.state，麵包屑的「市場總覽」不會不見 */
  state: unknown;
}

/**
 * 市場脈動分頁頁籤（2026-10-27 視覺改版 V2）：白底細框膠囊，目前分頁填代表色、白字。
 * 往下捲時固定在頂部列下方；切換分頁新增瀏覽紀錄（上一頁回到前一個分頁）。
 */
export function MarketTabs({ groups, current, state }: MarketTabsProps) {
  const tabs: MarketTab[] = ['overview', ...groups];
  return (
    <nav
      aria-label={t.tabsLabel}
      className="sticky top-14 z-10 -mx-6 flex gap-1.5 overflow-x-auto bg-p-faint px-6 py-2.5 lg:-mx-12 lg:px-12 print:hidden"
    >
      {tabs.map((tab) => {
        const on = tab === current;
        return (
          <Link
            key={tab}
            to={tabPath(tab)}
            state={state}
            aria-current={on ? 'page' : undefined}
            className={`shrink-0 rounded-full border px-[15px] py-1 text-[13.5px] whitespace-nowrap transition-colors ${
              on ? 'border-p bg-p font-medium text-white' : 'border-line bg-white text-ink2 hover:border-p-mid hover:text-ink'
            }`}
          >
            {tabLabel(tab)}
          </Link>
        );
      })}
    </nav>
  );
}
