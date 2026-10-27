import { useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
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
import { feedDay, recentDays, recentFeed } from '../lib/feedSummary';
import { newsHeading, newsHeadline, newsNumbers } from '../lib/newsStory';

const t = zhTW.news;
const PAGE_SIZE = 10;
const LIST_ID = 'news-all';
const DOMAINS: readonly FeedDomain[] = ['product_channel', 'market_macro', 'regulation', 'claims_consumer', 'customer_brand'];
type GroupKey = FeedDomain | 'none';
const GROUP_KEYS: readonly GroupKey[] = [...DOMAINS, 'none'];

// 日期膠囊：白底細框，目前的填代表色（與市場脈動頁籤一致）
const chipBase = 'inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 ring-1 transition-colors';
const chipOn = 'bg-p text-white ring-p';
const chipOff = 'bg-white text-ink2 ring-line hover:ring-p-mid';

/** 一個領域：代表色深色標題列（名稱＋則數，可收合）＋一行一則；先列 10 則＋「顯示更多」 */
function DomainGroup({
  name,
  items,
  closed,
  onToggle,
  render,
}: {
  name: string;
  items: FeedItemViewModel[];
  closed: boolean;
  onToggle: () => void;
  render: (item: FeedItemViewModel) => ReactNode;
}) {
  const [shown, setShown] = useState(PAGE_SIZE);
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-white">
      <button
        type="button"
        aria-expanded={!closed}
        onClick={onToggle}
        className="flex w-full items-center gap-3 bg-p px-5 py-2 text-left text-white hover:brightness-95"
      >
        <span className="font-medium">{name}</span>
        <span className="text-[13px] text-white/85">{t.count(items.length)}</span>
        <span aria-hidden className="ml-auto text-[16px] leading-none">
          {closed ? '▸' : '▾'}
        </span>
        <span className="sr-only">{closed ? t.expand : t.collapse}</span>
      </button>
      {closed ? null : items.length === 0 ? (
        <p className="px-5 py-2.5 text-[13px] text-muted">{t.groupEmpty}</p>
      ) : (
        <>
          <ul className="divide-y divide-slate-100">{items.slice(0, shown).map(render)}</ul>
          {items.length > shown ? (
            <div className="border-t border-slate-100 px-5 py-2">
              <button type="button" onClick={() => setShown(shown + PAGE_SIZE)} className="text-[13px] text-p hover:underline">
                {t.showMore}
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

/** 報告險種是否屬於法規的相關險種：完全相同，或是「投資型壽險（IUL，指數連結型）」這類帶括號細分的子類 */
function inCategory(reportCategory: string, categories: string[]): boolean {
  return categories.some((c) => reportCategory === c || reportCategory.startsWith(`${c}（`));
}

/** 新聞與法規監控（2026-10-20 新規劃；2026-10-27 V5 清單改日期膠囊＋依領域分組）：只看可能相關追蹤清單商品、法規展開可能相關與同險種的追蹤商品 */
export function NewsPage() {
  const location = useLocation();
  const fromHome = readFromPath(location.state) === '/';
  useBreadcrumb(fromHome ? [{ label: zhTW.nav.home, to: '/' }, { label: zhTW.nav.news }] : [{ label: zhTW.nav.news }]);

  // 日期、勾選、收合寫進網址（date、affects=1、closed），切換用 replace，不新增瀏覽紀錄
  const [searchParams, setSearchParams] = useSearchParams();
  const date = searchParams.get('date');
  const affectsOnly = searchParams.get('affects') === '1';
  const closed = new Set((searchParams.get('closed') ?? '').split(',').filter((x): x is GroupKey => (GROUP_KEYS as readonly string[]).includes(x)));
  const update = (next: { date?: string | null; affects?: boolean; closed?: Set<GroupKey> }) => {
    const d = next.date !== undefined ? next.date : date;
    const a = next.affects ?? affectsOnly;
    const c = next.closed ?? closed;
    const p = new URLSearchParams();
    if (d) p.set('date', d);
    if (a) p.set('affects', '1');
    if (c.size > 0) p.set('closed', GROUP_KEYS.filter((k) => c.has(k)).join(','));
    setSearchParams(p, { replace: true, state: location.state });
  };
  const toggleGroup = (k: GroupKey) => {
    const c = new Set(closed);
    if (c.has(k)) c.delete(k);
    else c.add(k);
    update({ closed: c });
  };

  const feedState = useFeed();
  const indexState = useIndexState();
  const watchlist = useSyncExternalStore(subscribeWatchlist, readWatchlist);

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
  const recent = useMemo(() => (feedState.status === 'ok' ? recentFeed(feedState.data) : null), [feedState]);
  const days = useMemo(() => recentDays(items), [items]);
  // 網址的日期不在最近 5 天內時回到近 30 天
  const day = days.find((x) => x.date === date)?.date ?? null;
  const dated = day ? items.filter((i) => feedDay(i) === day) : (recent?.items ?? []);
  const visible = affectsOnly
    ? dated.filter((i) => {
        const p = productsOf(i);
        return p.affected.length > 0 || p.sameCategory.length > 0;
      })
    : dated;
  const groups = GROUP_KEYS.map((k) => ({ key: k, items: visible.filter((i) => (i.domain ?? 'none') === k) })).filter(
    (g) => g.key !== 'none' || g.items.length > 0,
  );
  const linkState = { from: location.pathname + location.search, fromState: location.state };
  // 換日期或勾選時每組回到前 10 則
  const filterKey = `${day ?? ''}|${affectsOnly}`;

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
            down={{ label: t.down(recent.items.length), targetId: LIST_ID }}
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
            <div role="group" aria-label={t.datesLabel} className="flex min-w-0 items-center gap-2 overflow-x-auto px-px py-1">
              <span className="shrink-0 text-[13px] text-ink2">{t.datesLabel}</span>
              {[{ date: null, label: t.last30, count: recent?.items.length ?? 0 }, ...days].map((x) => (
                <button
                  key={x.date ?? 'recent'}
                  type="button"
                  aria-pressed={day === x.date}
                  onClick={() => update({ date: x.date })}
                  className={`${chipBase} ${day === x.date ? chipOn : chipOff}`}
                >
                  <span>{x.label}</span>
                  <span className={day === x.date ? 'text-white/80' : 'text-slate-500'}>{x.count}</span>
                </button>
              ))}
            </div>
            <label className="flex shrink-0 cursor-pointer items-center gap-2 text-slate-700">
              <input
                type="checkbox"
                checked={affectsOnly}
                onChange={(e) => update({ affects: e.target.checked })}
                className="size-4 accent-[#2fa58a]"
              />
              {t.affectsToggle}
            </label>
          </div>
          {affectsOnly && visible.length === 0 ? <StatusMessage tone="info" message={t.emptyAffects} /> : null}
          {groups.map((g) => (
            <DomainGroup
              key={`${g.key}|${filterKey}`}
              name={t.domains[g.key]}
              items={g.items}
              closed={closed.has(g.key)}
              onToggle={() => toggleGroup(g.key)}
              render={(item) => <NewsItem key={item.id} item={item} {...productsOf(item)} linkState={linkState} />}
            />
          ))}
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
