import { useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { HomeCard, PendingContent, type HomeCardIcon } from '../components/home/HomeCard';
import { WatchlistCard } from '../components/home/WatchlistCard';
import { NewsList } from '../components/home/NewsList';
import { PulseList } from '../components/home/PulseList';
import { ResearchList } from '../components/home/ResearchList';
import { StatusMessage } from '../components/common/StatusMessage';
import { DataSourceError, normalizeReportIndex } from '../data';
import { zhTW } from '../i18n/zh-TW';
import { orDash } from '../lib/format';
import { isUnreviewed, readReviewed, subscribeReviewed } from '../lib/reviewed';
import { addWatchItem, matchWatchItem, readWatchlist, removeWatchItem, subscribeWatchlist } from '../lib/watchlist';
import { errorText, useBreadcrumb, useFeed, useIndexState, useMarketPulse } from './pageChrome';
import type { LoadState } from './useOnDemand';

const t = zhTW.home;

// 新聞與法規監控：先顯示全部動態（2026-10-20 新規劃階段 1；6 領域頁籤待新格式）
const NEWS_LIMIT = 5;
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
 * 市場總覽（首頁，2026-10-20 新規劃，規格 D1）。
 * 新聞與法規監控讀動態清單；市場脈動讀市場指標；追蹤清單用報告清單（＋動態日期）；競品研究列未審閱報告。
 */
export function MarketHomePage() {
  useBreadcrumb([{ label: zhTW.nav.home }]);
  const indexState = useIndexState();
  const feedState = useFeed();
  const pulseState = useMarketPulse();
  const watchlist = useSyncExternalStore(subscribeWatchlist, readWatchlist);
  const reviewed = useSyncExternalStore(subscribeReviewed, readReviewed);

  const vm = useMemo(
    () => (indexState.status === 'ok' ? normalizeReportIndex(indexState.index) : null),
    [indexState],
  );
  // 未審閱報告：產出日期新到舊（缺日期排最後）
  const unreviewedRows = useMemo(
    () =>
      (vm?.rows ?? [])
        .filter((r) => isUnreviewed(r, reviewed))
        .sort((a, b) => (b.generatedDate ?? '').localeCompare(a.generatedDate ?? '')),
    [vm, reviewed],
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

  let researchBody;
  if (indexState.status === 'loading') researchBody = <p className="text-slate-500">{zhTW.common.loading}</p>;
  else if (indexState.status === 'error') {
    const { message, detail } = errorText(indexState.error, zhTW.errors.notFoundIndex);
    researchBody = <StatusMessage tone="error" message={message} detail={detail} />;
  } else if (vm && vm.rows.length === 0) researchBody = <p className="text-slate-500">{zhTW.overview.empty}</p>;
  else researchBody = <ResearchList rows={unreviewedRows} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="text-xl font-semibold text-slate-900">{t.title}</h1>
        {vm ? <span className="text-xs text-slate-500">{t.updatedAt(orDash(vm.generatedAt))}</span> : null}
      </div>
      {/* 寬螢幕 2×2 照規劃圖排列；窄螢幕一欄：競品研究、追蹤清單、新聞、市場脈動 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="order-3 min-w-0 lg:order-1">
          <Card icon="news" title={t.cards.news}>
            {cardBody(feedState, (feed) => <NewsList items={feed.items.slice(0, NEWS_LIMIT)} />)}
          </Card>
        </div>
        <div className="order-4 min-w-0 lg:order-2">
          <Card icon="pulse" title={t.cards.pulse}>
            {cardBody(pulseState, (pulse) => (
              <PulseList metrics={pulse.metrics.slice(0, PULSE_LIMIT)} />
            ))}
          </Card>
        </div>
        <div className="order-2 min-w-0 lg:order-3">{watchCard}</div>
        <div className="order-1 min-w-0 lg:order-4">
          <Card icon="research" title={t.cards.research}>
            {researchBody}
          </Card>
        </div>
      </div>
    </div>
  );
}
