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
import { isUnreviewed, readReviewed, subscribeReviewed } from '../lib/reviewed';
import { recentFeed } from '../lib/feedSummary';
import { homeHeadline } from '../lib/insights';
import { buildCandidates } from '../lib/score';
import { readWatchlist, subscribeWatchlist } from '../lib/watchlist';
import { readWeights, subscribeWeights } from '../lib/weights';
import { errorText, useBreadcrumb, useFeed, useIndexState, useMarketPulse } from './pageChrome';
import type { LoadState } from './useOnDemand';
import type { OverviewRow } from '../types/viewModel';

const t = zhTW.home;

function completedTime(r: OverviewRow): number {
  if (r.generatedTime !== null) return r.generatedTime;
  const t = r.generatedDate ? Date.parse(`${r.generatedDate}T00:00:00+08:00`) : NaN;
  return Number.isNaN(t) ? -Infinity : t;
}

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
  const weights = useSyncExternalStore(subscribeWeights, readWeights);
  const reviewed = useSyncExternalStore(subscribeReviewed, readReviewed);

  const vm = useMemo(
    () => (indexState.status === 'ok' ? normalizeReportIndex(indexState.index) : null),
    [indexState],
  );
  // 未審閱報告：完成時間新到舊；沒有時間的用日期當天 0 點（台北），都缺的排最後
  const unreviewedRows = useMemo(
    () =>
      (vm?.rows ?? [])
        .filter((r) => isUnreviewed(r, reviewed))
        .sort((a, b) => completedTime(b) - completedTime(a)),
    [vm, reviewed],
  );
  const candidates = useMemo(() => buildCandidates(watchlist, vm?.rows ?? [], weights), [watchlist, vm, weights]);

  // 追蹤清單、競品研究都靠報告清單：載入中與錯誤時顯示相同訊息
  let indexPending: ReactNode = null;
  if (indexState.status === 'loading') indexPending = <p className="text-slate-500">{zhTW.common.loading}</p>;
  else if (indexState.status === 'error') {
    const { message, detail } = errorText(indexState.error, zhTW.errors.notFoundIndex);
    indexPending = <StatusMessage tone="error" message={message} detail={detail} />;
  }
  const watchBody = indexPending ?? <WatchlistCardContent ranked={candidates.ranked} />;
  const researchBody =
    indexPending ??
    (vm && vm.rows.length === 0 ? (
      <p className="text-slate-500">{zhTW.overview.empty}</p>
    ) : (
      <ResearchList rows={unreviewedRows} total={vm?.rows.length ?? 0} groups={vm?.recommendationGroups ?? []} />
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
          to={unreviewedRows.length > 0 ? '/research?unread=1' : '/research'}
        >
          {researchBody}
        </HomeCard>
      </div>
    </div>
  );
}
