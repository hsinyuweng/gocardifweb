import { useMemo, useSyncExternalStore } from 'react';
import { HomeCard, PendingContent } from '../components/home/HomeCard';
import { WatchlistCard } from '../components/home/WatchlistCard';
import { StatusMessage } from '../components/common/StatusMessage';
import { normalizeReportIndex } from '../data';
import { zhTW } from '../i18n/zh-TW';
import { orDash } from '../lib/format';
import { addWatchItem, matchWatchItem, readWatchlist, removeWatchItem, subscribeWatchlist } from '../lib/watchlist';
import { errorText, useBreadcrumb, useIndexState } from './pageChrome';

const t = zhTW.home;

/**
 * 市場總覽（首頁儀表板，2026-10-18 經確認，修改規格 D1）。
 * 新聞監控、市場脈動、競品與法規異動等後端資料（階段 B）；我的追蹤清單用現有報告清單。
 */
export function MarketHomePage() {
  useBreadcrumb([{ label: zhTW.nav.home }]);
  const indexState = useIndexState();
  const watchlist = useSyncExternalStore(subscribeWatchlist, readWatchlist);

  const vm = useMemo(
    () => (indexState.status === 'ok' ? normalizeReportIndex(indexState.index) : null),
    [indexState],
  );
  const watchItems = useMemo(
    () => watchlist.map((item) => ({ item, match: matchWatchItem(item, vm?.rows ?? []) })),
    [watchlist, vm],
  );

  let watchCard;
  if (indexState.status === 'loading') {
    watchCard = (
      <HomeCard icon="watchlist" title={t.cards.watchlist}>
        <p className="text-slate-500">{zhTW.common.loading}</p>
      </HomeCard>
    );
  } else if (indexState.status === 'error') {
    const { message, detail } = errorText(indexState.error, zhTW.errors.notFoundIndex);
    watchCard = (
      <HomeCard icon="watchlist" title={t.cards.watchlist}>
        <StatusMessage tone="error" message={message} detail={detail} />
      </HomeCard>
    );
  } else {
    watchCard = (
      <WatchlistCard
        items={watchItems}
        categoryOptions={vm?.categoryOptions ?? []}
        countryOptions={vm?.countryOptions ?? []}
        onAdd={addWatchItem}
        onRemove={removeWatchItem}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="text-xl font-semibold text-slate-900">{t.title}</h1>
        {vm ? <span className="text-xs text-slate-500">{t.updatedAt(orDash(vm.generatedAt))}</span> : null}
      </div>
      {/* 寬螢幕 2×2 照示意圖排列；窄螢幕一欄，追蹤清單排第一（目前唯一有資料） */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="order-2 min-w-0 lg:order-1">
          <HomeCard icon="news" title={t.cards.news}>
            <PendingContent />
          </HomeCard>
        </div>
        <div className="order-3 min-w-0 lg:order-2">
          <HomeCard icon="pulse" title={t.cards.pulse}>
            <PendingContent />
          </HomeCard>
        </div>
        <div className="order-4 min-w-0 lg:order-3">
          <HomeCard icon="changes" title={t.cards.changes}>
            <PendingContent />
          </HomeCard>
        </div>
        <div className="order-1 min-w-0 lg:order-4">{watchCard}</div>
      </div>
    </div>
  );
}
