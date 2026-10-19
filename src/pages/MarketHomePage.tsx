import { useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { HomeCard, PendingContent, type HomeCardIcon } from '../components/home/HomeCard';
import { WatchlistCard } from '../components/home/WatchlistCard';
import { NewsList } from '../components/home/NewsList';
import { PulseList } from '../components/home/PulseList';
import { ChangesList } from '../components/home/ChangesList';
import { StatusMessage } from '../components/common/StatusMessage';
import { DataSourceError, normalizeReportIndex } from '../data';
import { zhTW } from '../i18n/zh-TW';
import { orDash } from '../lib/format';
import { addWatchItem, matchWatchItem, readWatchlist, removeWatchItem, subscribeWatchlist } from '../lib/watchlist';
import { errorText, useBreadcrumb, useFeed, useIndexState, useMarketPulse } from './pageChrome';
import type { LoadState } from './useOnDemand';

const t = zhTW.home;

// 卡片分工（2026-10-18 經確認）：新聞監控＝news、market；競品與法規異動＝product、regulation
const NEWS_CATEGORIES = new Set(['news', 'market']);
const CHANGE_CATEGORIES = new Set(['product', 'regulation']);
const NEWS_LIMIT = 3;
const CHANGES_LIMIT = 4;
const PULSE_LIMIT = 4;

/** 卡片內容依讀取狀態切換：載入中／資料準備中（檔案不存在）／錯誤（只影響這張卡片）／內容 */
function cardBody<T>(state: LoadState<T>, render: (data: T) => ReactNode): ReactNode {
  if (state.status === 'ok') return render(state.data);
  if (state.status === 'error') {
    if (state.error instanceof DataSourceError && state.error.kind === 'not_found') return <PendingContent />;
    const { message, detail } = errorText(state.error, t.pending);
    return <StatusMessage tone="error" message={message} detail={detail} />;
  }
  return <p className="text-slate-500">{zhTW.common.loading}</p>;
}

function Card({ icon, title, children }: { icon: HomeCardIcon; title: string; children: ReactNode }) {
  return (
    <HomeCard icon={icon} title={title}>
      {children}
    </HomeCard>
  );
}

/**
 * 市場總覽（首頁儀表板，2026-10-18 經確認，修改規格 D1）。
 * 新聞監控、競品與法規異動讀動態清單；市場脈動讀市場指標；我的追蹤清單用報告清單（＋動態日期）。
 */
export function MarketHomePage() {
  useBreadcrumb([{ label: zhTW.nav.home }]);
  const indexState = useIndexState();
  const feedState = useFeed();
  const pulseState = useMarketPulse();
  const watchlist = useSyncExternalStore(subscribeWatchlist, readWatchlist);

  const vm = useMemo(
    () => (indexState.status === 'ok' ? normalizeReportIndex(indexState.index) : null),
    [indexState],
  );
  const reportNames = useMemo(
    () => new Map((vm?.rows ?? []).flatMap((r) => (r.reportId && r.name ? [[r.reportId, r.name] as const] : []))),
    [vm],
  );
  const feedItems = useMemo(() => (feedState.status === 'ok' ? feedState.data.items : []), [feedState]);
  const watchItems = useMemo(
    () => watchlist.map((item) => ({ item, match: matchWatchItem(item, vm?.rows ?? [], feedItems) })),
    [watchlist, vm, feedItems],
  );

  let watchCard;
  if (indexState.status === 'loading') {
    watchCard = (
      <Card icon="watchlist" title={t.cards.watchlist}>
        <p className="text-slate-500">{zhTW.common.loading}</p>
      </Card>
    );
  } else if (indexState.status === 'error') {
    const { message, detail } = errorText(indexState.error, zhTW.errors.notFoundIndex);
    watchCard = (
      <Card icon="watchlist" title={t.cards.watchlist}>
        <StatusMessage tone="error" message={message} detail={detail} />
      </Card>
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
      {/* 寬螢幕 2×2 照示意圖排列；窄螢幕一欄，追蹤清單排第一 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="order-2 min-w-0 lg:order-1">
          <Card icon="news" title={t.cards.news}>
            {cardBody(feedState, (feed) => (
              <NewsList items={feed.items.filter((i) => NEWS_CATEGORIES.has(i.category ?? '')).slice(0, NEWS_LIMIT)} />
            ))}
          </Card>
        </div>
        <div className="order-3 min-w-0 lg:order-2">
          <Card icon="pulse" title={t.cards.pulse}>
            {cardBody(pulseState, (pulse) => (
              <PulseList metrics={pulse.metrics.slice(0, PULSE_LIMIT)} />
            ))}
          </Card>
        </div>
        <div className="order-4 min-w-0 lg:order-3">
          <Card icon="changes" title={t.cards.changes}>
            {cardBody(feedState, (feed) => (
              <ChangesList
                items={feed.items.filter((i) => CHANGE_CATEGORIES.has(i.category ?? '')).slice(0, CHANGES_LIMIT)}
                reportNames={reportNames}
              />
            ))}
          </Card>
        </div>
        <div className="order-1 min-w-0 lg:order-4">{watchCard}</div>
      </div>
    </div>
  );
}
