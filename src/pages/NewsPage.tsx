import { useMemo, useState, useSyncExternalStore } from 'react';
import { useLocation, useSearchParams } from 'react-router';
import { PendingContent } from '../components/home/HomeCard';
import { StatusMessage } from '../components/common/StatusMessage';
import { NewsItem } from '../components/news/NewsItem';
import { DataSourceError, normalizeReportIndex } from '../data';
import type { FeedDomain, FeedItemViewModel } from '../types/viewModel';
import { zhTW } from '../i18n/zh-TW';
import { orDash } from '../lib/format';
import { readFromPath } from '../lib/ownerParam';
import { readWatchlist, subscribeWatchlist } from '../lib/watchlist';
import { errorText, useBreadcrumb, useFeed, useIndexState } from './pageChrome';
import { PageHeader } from '../components/layout/PageHeader';
import { ColumnChart } from '../components/charts/ColumnChart';
import { HBarList } from '../components/charts/HBarList';
import { KeyNumbers } from '../components/story/KeyNumbers';
import { Lead } from '../components/story/Lead';
import { NextStep } from '../components/story/NextStep';
import { ChartTitle, DetailDivider, StorySection } from '../components/story/StorySection';
import { recentFeed } from '../lib/feedSummary';
import { newsHeading, newsHeadline, newsNumbers } from '../lib/newsStory';

const t = zhTW.news;
const TABS: ReadonlyArray<FeedDomain | 'all'> = [
  'all',
  'product_channel',
  'market_macro',
  'regulation',
  'claims_consumer',
  'customer_brand',
];
const PAGE_SIZE = 30;
const LIST_ID = 'news-all';
const DOMAINS: readonly FeedDomain[] = ['product_channel', 'market_macro', 'regulation', 'claims_consumer', 'customer_brand'];

// 頁籤與開關寫進網址（tab、affects=1），切換用 replace，不新增瀏覽紀錄
function readTab(v: string | null): FeedDomain | 'all' {
  return TABS.includes(v as FeedDomain) ? (v as FeedDomain) : 'all';
}

// 頁籤：白底細框膠囊，目前頁籤填代表色（2026-10-27 V3，與市場脈動頁籤一致）
const chipBase = 'inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 ring-1 transition-colors';
const chipOn = 'bg-p text-white ring-p';
const chipOff = 'bg-white text-ink2 ring-line hover:ring-p-mid';

/** 報告險種是否屬於法規的相關險種：完全相同，或是「投資型壽險（IUL，指數連結型）」這類帶括號細分的子類 */
function inCategory(reportCategory: string, categories: string[]): boolean {
  return categories.some((c) => reportCategory === c || reportCategory.startsWith(`${c}（`));
}

/** 新聞與法規監控（2026-10-20 新規劃）：6 個頁籤、只看可能相關追蹤清單商品、法規展開可能相關與同險種的追蹤商品 */
export function NewsPage() {
  const location = useLocation();
  const fromHome = readFromPath(location.state) === '/';
  useBreadcrumb(fromHome ? [{ label: zhTW.nav.home, to: '/' }, { label: zhTW.nav.news }] : [{ label: zhTW.nav.news }]);

  const [searchParams, setSearchParams] = useSearchParams();
  const tab = readTab(searchParams.get('tab'));
  const affectsOnly = searchParams.get('affects') === '1';
  const update = (nextTab: FeedDomain | 'all', nextAffects: boolean) => {
    const p = new URLSearchParams();
    if (nextTab !== 'all') p.set('tab', nextTab);
    if (nextAffects) p.set('affects', '1');
    setSearchParams(p, { replace: true, state: location.state });
  };

  const feedState = useFeed();
  const indexState = useIndexState();
  const watchlist = useSyncExternalStore(subscribeWatchlist, readWatchlist);
  // 換頁籤或開關時回到前 30 則
  const [limit, setLimit] = useState({ key: '', n: PAGE_SIZE });
  const filterKey = `${tab}|${affectsOnly}`;
  const shown = limit.key === filterKey ? limit.n : PAGE_SIZE;

  const reports = useMemo(
    () =>
      new Map(
        (indexState.status === 'ok' ? normalizeReportIndex(indexState.index).rows : []).flatMap((r) =>
          r.reportId ? [[r.reportId, { name: r.name ?? r.reportId, category: r.category }] as const] : [],
        ),
      ),
    [indexState],
  );
  /** 法規的追蹤清單商品：可能相關（related_report_ids）與同險種（affected_categories，排除已列為可能相關的） */
  const productsOf = useMemo(() => {
    return (item: FeedItemViewModel) => {
      if (item.kind !== 'regulation') return { affected: [], sameCategory: [] };
      const related = new Set(item.relatedReportIds);
      const link = (id: string) => ({ id, name: reports.get(id)?.name ?? id });
      return {
        affected: watchlist.filter((id) => related.has(id)).map(link),
        sameCategory: watchlist
          .filter((id) => {
            const category = reports.get(id)?.category;
            return !related.has(id) && category != null && inCategory(category, item.affectedCategories);
          })
          .map(link),
      };
    };
  }, [watchlist, reports]);

  const items = feedState.status === 'ok' ? feedState.data.items : [];
  const pool = affectsOnly
    ? items.filter((i) => {
        const p = productsOf(i);
        return p.affected.length > 0 || p.sameCategory.length > 0;
      })
    : items;
  const counts = new Map<FeedDomain | 'all', number>([['all', pool.length]]);
  for (const i of pool) if (i.domain) counts.set(i.domain, (counts.get(i.domain) ?? 0) + 1);
  const visible = tab === 'all' ? pool : pool.filter((i) => i.domain === tab);
  const linkState = { from: location.pathname + location.search, fromState: location.state };
  const recent = useMemo(() => (feedState.status === 'ok' ? recentFeed(feedState.data) : null), [feedState]);

  let body;
  if (feedState.status === 'error') {
    if (feedState.error instanceof DataSourceError && feedState.error.kind === 'not_found') body = <PendingContent />;
    else {
      const { message, detail } = errorText(feedState.error, zhTW.home.pending);
      body = <StatusMessage tone="error" message={message} detail={detail} />;
    }
  } else if (feedState.status !== 'ok') {
    body = <StatusMessage tone="info" message={zhTW.common.loading} />;
  } else {
    const headline = recent ? newsHeadline(recent) : null;
    const heading = recent ? newsHeading(recent) : null;
    // 各領域則數：五個領域都列（0 也列，監理法規 0 則時珊瑚色），沒有領域的另列「未分類」
    const domainRows = recent
      ? [...DOMAINS.map((d) => ({ d, n: recent.domains.find((x) => x.domain === d)?.count ?? 0 })),
          ...(recent.domains.some((x) => x.domain === null) ? [{ d: null, n: recent.domains.find((x) => x.domain === null)!.count }] : [])]
          .sort((a, b) => b.n - a.n)
          .map(({ d, n }) => ({ key: d ?? 'none', name: zhTW.home.domainShort[d ?? 'none'], value: n, strong: d === 'regulation' && n === 0 }))
      : [];
    const story =
      recent && recent.items.length > 0 ? (
        <>
          {headline ? <Lead parts={headline} /> : null}
          <KeyNumbers items={newsNumbers(recent)} />
          {heading ? (
            <StorySection heading={heading}>
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
                <div>
                  <ChartTitle>{t.charts.domains}</ChartTitle>
                  <HBarList rows={domainRows} ariaLabel={t.charts.domains} unit={zhTW.home.countUnit} />
                </div>
                <div>
                  <ChartTitle>{t.charts.companies}</ChartTitle>
                  <HBarList
                    rows={recent.companies.map((c) => ({ key: c.name, name: c.name, value: c.count }))}
                    ariaLabel={t.charts.companies}
                    unit={zhTW.home.countUnit}
                  />
                </div>
                {recent.weeks.length >= 2 ? (
                  <div>
                    <ChartTitle note={t.charts.weeklyNote}>{t.charts.weekly}</ChartTitle>
                    <ColumnChart
                      values={recent.weeks.map((w) => w.count)}
                      labels={recent.weeks.map((w) => w.label)}
                      formatValue={(v) => String(v)}
                      height={140}
                      ariaLabel={t.charts.weekly}
                    />
                  </div>
                ) : null}
              </div>
            </StorySection>
          ) : null}
          <NextStep
            down={{ label: t.down(items.length), targetId: LIST_ID }}
            links={[{ to: '/watchlist', label: t.toWatchlist }]}
          />
          <DetailDivider id={LIST_ID} label={t.allItems} />
        </>
      ) : null;
    body = (
      <div className="space-y-6">
        {story}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div role="tablist" className="flex min-w-0 items-center gap-2 overflow-x-auto px-px py-1">
              {TABS.map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => update(key, affectsOnly)}
                  className={`${chipBase} ${tab === key ? chipOn : chipOff}`}
                >
                  <span>{t.tabs[key]}</span>
                  <span className={tab === key ? 'text-white/80' : 'text-slate-500'}>{counts.get(key) ?? 0}</span>
                </button>
              ))}
            </div>
            <label className="flex shrink-0 cursor-pointer items-center gap-2 text-slate-700">
              <input
                type="checkbox"
                checked={affectsOnly}
                onChange={(e) => update(tab, e.target.checked)}
                className="size-4 accent-[#2fa58a]"
              />
              {t.affectsToggle}
            </label>
          </div>
          {visible.length === 0 ? (
            <StatusMessage tone="info" message={affectsOnly ? t.emptyAffects : t.emptyTab} />
          ) : (
            <>
              <ul className="divide-y divide-slate-100 rounded border border-slate-200 bg-white">
                {visible.slice(0, shown).map((item) => (
                  <NewsItem key={item.id} item={item} {...productsOf(item)} linkState={linkState} />
                ))}
              </ul>
              {visible.length > shown ? (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setLimit({ key: filterKey, n: shown + PAGE_SIZE })}
                    className="h-9 rounded border border-slate-300 bg-white px-4 text-slate-700 hover:border-navy-600 hover:text-navy-800"
                  >
                    {t.showMore}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon="news"
        title={t.title}
        desc={zhTW.pageDesc.news}
        aside={
          feedState.status === 'ok'
            ? `${recent?.range ? `${t.range(recent.range.from, recent.range.to)} · ` : ''}${zhTW.home.updatedAt(orDash(feedState.data.generatedAt))}`
            : null
        }
      />
      {body}
    </div>
  );
}
