import { useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { HomeCard, PendingContent } from '../components/home/HomeCard';
import { WatchlistCardContent } from '../components/home/WatchlistCard';
import { NewsList } from '../components/home/NewsList';
import { PulseList } from '../components/home/PulseList';
import { ResearchList } from '../components/home/ResearchList';
import { StatusMessage } from '../components/common/StatusMessage';
import { PageHeader } from '../components/layout/PageHeader';
import { Lead } from '../components/story/Lead';
import { DataSourceError, normalizeReportIndex } from '../data';
import { zhTW } from '../i18n/zh-TW';
import { orDash } from '../lib/format';
import { recentFeed } from '../lib/feedSummary';
import { homeHeadline } from '../lib/insights';
import { buildCandidates } from '../lib/score';
import { rankRows } from '../lib/researchStory';
import { readWatchlist, subscribeWatchlist } from '../lib/watchlist';
import { PRESET_WEIGHTS, readPreset, subscribePreset } from '../lib/weights';
import { errorText, useBreadcrumb, useFeed, useIndexState, useMarketPulse } from './pageChrome';
import type { LoadState } from './useOnDemand';

const t = zhTW.home;

/** 卡片內容依讀取狀態切換：載入中／資料準備中（檔案不存在）／錯誤（只影響這張卡片）／內容 */
function cardBody<T>(state: LoadState<T>, render: (data: T) => ReactNode): ReactNode {
  if (state.status === 'ok') return render(state.data);
  if (state.status === 'error') {
    if (state.error instanceof DataSourceError && state.error.kind === 'not_found') return <PendingContent />;
    const { message, detail } = errorText(state.error, t.pending);
    return <StatusMessage tone="error" message={message} detail={detail} />;
  }
  return <p className="text-muted">{zhTW.common.loading}</p>;
}

/**
 * 市場總覽（首頁，2026-10-20 新規劃，規格 D1；2026-10-27 視覺改版）。
 * 1440×900 一個畫面看完：頁首、一句結論、四框依 Z 字順序（市場脈動、新聞與法規監控、追蹤清單、競品研究）。
 * 市場脈動讀市場指標；新聞與法規監控讀動態清單；追蹤清單、競品研究用報告清單。
 */
export function MarketHomePage() {
  useBreadcrumb([{ label: zhTW.nav.home }]);
  const indexState = useIndexState();
  const feedState = useFeed();
  const pulseState = useMarketPulse();
  const watchlist = useSyncExternalStore(subscribeWatchlist, readWatchlist);
  const weights = PRESET_WEIGHTS[useSyncExternalStore(subscribePreset, readPreset)];

  const vm = useMemo(
    () => (indexState.status === 'ok' ? normalizeReportIndex(indexState.index) : null),
    [indexState],
  );
  // 競品研究框：建議由好到壞、再依綜合分數（2026-10-31 取代未審閱）
  const rankedRows = useMemo(() => rankRows(vm?.rows ?? [], weights), [vm, weights]);
  const candidates = useMemo(() => buildCandidates(watchlist, vm?.rows ?? [], weights), [watchlist, vm, weights]);
  // 還沒追蹤任何商品時，列綜合分數最高的 3 件當建議（2026-10-31）
  const suggestions = useMemo(() => {
    const rows = vm?.rows ?? [];
    return buildCandidates(rows.flatMap((r) => (r.reportId ? [r.reportId] : [])), rows, weights).ranked.slice(0, 3);
  }, [vm, weights]);

  // 追蹤清單、競品研究都靠報告清單：載入中與錯誤時顯示相同訊息
  let indexPending: ReactNode = null;
  if (indexState.status === 'loading') indexPending = <p className="text-muted">{zhTW.common.loading}</p>;
  else if (indexState.status === 'error') {
    const { message, detail } = errorText(indexState.error, zhTW.errors.notFoundIndex);
    indexPending = <StatusMessage tone="error" message={message} detail={detail} />;
  }
  const watchBody = indexPending ?? <WatchlistCardContent ranked={candidates.ranked} suggestions={suggestions} />;
  const researchBody =
    indexPending ??
    (vm && vm.rows.length === 0 ? (
      <p className="text-muted">{zhTW.overview.empty}</p>
    ) : (
      <ResearchList rows={rankedRows} groups={vm?.recommendationGroups ?? []} />
    ));

  const headline = useMemo(
    () =>
      homeHeadline(
        pulseState.status === 'ok' ? pulseState.data : null,
        feedState.status === 'ok' ? recentFeed(feedState.data) : null,
      ),
    [pulseState, feedState],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        icon="home"
        title={t.title}
        desc={zhTW.pageDesc.home}
        aside={vm ? t.updatedAt(orDash(vm.generatedAt)) : null}
      />
      {headline ? <Lead parts={headline} /> : null}
      {/* 2×2 依 Z 字順序（2026-10-27 使用者確認）；窄螢幕一欄同順序 */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:auto-rows-fr lg:grid-cols-2">
        <HomeCard theme="pulse" icon="pulse" title={t.cards.pulse} to="/market">
          {cardBody(pulseState, (pulse) => <PulseList metrics={pulse.metrics} />)}
        </HomeCard>
        <HomeCard theme="news" icon="news" title={t.cards.news} to="/news">
          {cardBody(feedState, (feed) => <NewsList feed={feed} />)}
        </HomeCard>
        <HomeCard theme="watch" icon="watchlist" title={t.cards.watchlist} to="/watchlist">
          {watchBody}
        </HomeCard>
        <HomeCard
          theme="research"
          icon="research"
          title={t.cards.research}
          to="/research"
        >
          {researchBody}
        </HomeCard>
      </div>
    </div>
  );
}
