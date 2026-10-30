import type { ReactNode } from 'react';
import { Navigate, useLocation, useParams, useSearchParams } from 'react-router';
import { PendingContent } from '../components/home/HomeCard';
import { StatusMessage } from '../components/common/StatusMessage';
import { PageHeader } from '../components/layout/PageHeader';
import { KeyMetricCard } from '../components/market/KeyMetricCard';
import { MetricTable } from '../components/market/MetricTable';
import { MarketTabs, tabLabel } from '../components/market/MarketTabs';
import { BigShareBar } from '../components/charts/BigShareBar';
import { ColumnChart } from '../components/charts/ColumnChart';
import { DivergingBars } from '../components/charts/DivergingBars';
import { LineChart } from '../components/charts/LineChart';
import { RankingBars } from '../components/charts/RankingBars';
import { StackedColumns } from '../components/charts/StackedColumns';
import { KeyNumbers } from '../components/story/KeyNumbers';
import { Lead } from '../components/story/Lead';
import { NextStep } from '../components/story/NextStep';
import { ChartTitle, DetailDivider, StorySection } from '../components/story/StorySection';
import { DataSourceError } from '../data';
import { zhTW } from '../i18n/zh-TW';
import { formatPulseTick, formatSharePct, orDash, shortPeriodLabels } from '../lib/format';
import { overviewHeadline, tabHeadline } from '../lib/insights';
import {
  availableGroups,
  growthLeaders,
  isRank,
  isTrend,
  mainTrend,
  periodLong,
  periodText,
  rankingGapHeading,
  rankingPreview,
  rankingValue,
  selfRanking,
  shareDetailHeading,
  shareMetrics,
  tabNumbers,
  trendHeading,
  trendValue,
  type MarketTab,
} from '../lib/marketStory';
import { readFromPath } from '../lib/ownerParam';
import { metricsByGroup, PULSE_GROUP_ORDER } from '../lib/pulse';
import type { PulseGroup, PulseMetricViewModel, PulseShareViewModel, PulseTrendViewModel } from '../types/viewModel';
import { errorText, useBreadcrumb, useMarketPulse } from './pageChrome';

const t = zhTW.market;
const DETAILS_ID = 'market-details';
/** 占比期數少於此數時圖下註「資料累積中」 */
const FULL_PERIODS = 6;

const isGroup = (x: string): x is PulseGroup => (PULSE_GROUP_ORDER as readonly string[]).includes(x);
const isMonthly = (period: string | null | undefined) => !!period && /^\d{4}-\d{2}$/.test(period);

/** 折線圖 y 軸：名次只標整數（formatPulseTick），其他與數值同格式（利率「2.05%」） */
const axisTick = (m: PulseTrendViewModel, v: number) => (isRank(m) ? formatPulseTick(v, m.unit) : trendValue(m, v));

/** 一組指標代表的資料期間（頁首右側） */
function dataPeriod(list: PulseMetricViewModel[]): string | null {
  const m = mainTrend(list);
  if (m) return periodLong(m.points.at(-1)?.period ?? null);
  return periodLong(shareMetrics(list)[0]?.periods.at(-1)?.period ?? null);
}

/** 年增率正負橫條：最快的項目珊瑚色 */
function GrowthBars({ share }: { share: PulseShareViewModel }) {
  const lead = growthLeaders(share);
  if (!lead) return null;
  const rows = (share.periods.at(-1)?.parts ?? [])
    .filter((p) => p.growthPct !== null)
    .sort((a, b) => b.growthPct! - a.growthPct!)
    .map((p) => ({ name: orDash(p.name), value: p.growthPct!, strong: p.name === lead.fastest.name }));
  return <DivergingBars rows={rows} formatValue={(v) => `${v > 0 ? '+' : ''}${formatSharePct(v)}`} ariaLabel={orDash(share.label)} />;
}

/** 占比最新一期的大橫條（段內寫名稱與占比） */
function LatestShareBar({ share }: { share: PulseShareViewModel }) {
  const parts = [...(share.periods.at(-1)?.parts ?? [])].sort((a, b) => b.sharePct - a.sharePct);
  return (
    <BigShareBar
      ariaLabel={orDash(share.label)}
      segments={parts.map((p, i) => ({
        key: p.name ?? String(i),
        label: `${orDash(p.name)} ${formatSharePct(p.sharePct)}`,
        value: p.sharePct,
        title: `${orDash(p.name)}：${formatSharePct(p.sharePct)}`,
      }))}
    />
  );
}

/** 重點指標卡只有 1 期時：同組有法巴排名就列法巴前後各 2 名，取代「累積中」 */
function cardFallback(list: PulseMetricViewModel[]): ReactNode {
  const r = selfRanking(list);
  if (!r) return null;
  return (
    <RankingBars rows={rankingPreview(r.m, 0, 2)} formatValue={(v) => rankingValue(r.m, v)} ariaLabel={orDash(r.m.label)} compact />
  );
}

/** 總覽的指標表：膠囊篩組別（網址 `?group=`，replace） */
function TableSection({ metrics, groups }: { metrics: PulseMetricViewModel[]; groups: PulseGroup[] }) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const param = searchParams.get('group');
  const current = param !== null && isGroup(param) && groups.includes(param) ? param : null;
  const select = (g: PulseGroup | null) => {
    const p = new URLSearchParams(searchParams);
    if (g === null) p.delete('group');
    else p.set('group', g);
    setSearchParams(p, { replace: true, state: location.state });
  };
  const chip = (on: boolean) =>
    `shrink-0 rounded-full border px-3 py-0.5 text-[13px] whitespace-nowrap transition-colors ${
      on ? 'border-p bg-p text-white' : 'border-line bg-white text-ink2 hover:border-p-mid hover:text-ink'
    }`;
  return (
    <section id={DETAILS_ID} className="scroll-mt-28 space-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h2 className="text-[18px] font-medium text-ink">{t.table.title(metrics.length)}</h2>
        <div role="group" aria-label={t.table.filter} className="flex gap-1.5 overflow-x-auto px-px py-1">
          {([null, ...groups] as const).map((g) => (
            <button key={g ?? 'all'} type="button" aria-pressed={current === g} onClick={() => select(g)} className={chip(current === g)}>
              {g === null ? t.table.all : t.groups[g].title}
            </button>
          ))}
        </div>
      </div>
      <MetricTable metrics={current === null ? metrics : metrics.filter((m) => m.group === current)} />
    </section>
  );
}

function Overview({ metrics, groups }: { metrics: PulseMetricViewModel[]; groups: PulseGroup[] }) {
  const headline = overviewHeadline(metrics);
  const missing = PULSE_GROUP_ORDER.filter((g) => !groups.includes(g));
  // 重點指標卡：每個有最新值的單線指標，依組別順序
  const byGroup = metricsByGroup(metrics);
  const cards = groups.flatMap((g) => byGroup.get(g)!.filter(isTrend).filter((m) => m.latestValue !== null));
  return (
    <>
      {headline ? <Lead parts={headline.parts} /> : null}
      {cards.length > 0 ? (
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
          {cards.map((m) => (
            <KeyMetricCard
              key={m.key}
              metric={m}
              coral={m.key === headline?.metricKey}
              fallback={m.points.length < 2 ? cardFallback(byGroup.get(m.group)!) : null}
            />
          ))}
        </div>
      ) : null}
      <NextStep
        down={{ label: t.table.down(metrics.length), targetId: DETAILS_ID }}
        note={missing.length > 0 ? missing.map((g) => t.missingGroup(t.groups[g].title, t.groups[g].desc)).join('；') : null}
      />
      <TableSection metrics={metrics} groups={groups} />
    </>
  );
}

function GroupTab({ list }: { list: PulseMetricViewModel[] }) {
  const headline = tabHeadline(list);
  const m = mainTrend(list);
  const shares = shareMetrics(list);
  const multiShares = shares.filter((s) => s.periods.length >= 2);
  const ranked = selfRanking(list);

  let main: ReactNode = null;
  if (m && m.points.length >= 2) {
    const fmt = (v: number) => trendValue(m, v);
    main = (
      <StorySection heading={trendHeading(m)}>
        <div>
          <ChartTitle note={orDash(m.unit)}>{orDash(m.label)}</ChartTitle>
          {/* 月資料用直條；週資料與名次（y 軸反向）用折線 */}
          {isMonthly(m.points.at(-1)?.period) && !isRank(m) ? (
            <ColumnChart
              values={m.points.map((p) => p.value)}
              labels={shortPeriodLabels(m.points.map((p) => p.period))}
              highlight={m.points.length - 1}
              formatValue={fmt}
              height={180}
              ariaLabel={orDash(m.label)}
            />
          ) : (
            <LineChart
              lines={[{ name: orDash(m.label), points: m.points }]}
              formatValue={fmt}
              formatTick={(v) => axisTick(m, v)}
              height={180}
              invert={isRank(m)}
              annotate
              ariaLabel={orDash(m.label)}
            />
          )}
        </div>
      </StorySection>
    );
  } else if (!m && shares[0]) {
    const latest = shares[0].periods.at(-1)!;
    main = (
      <StorySection heading={t.heading.shareLatest(periodLong(latest.period) ?? '')}>
        <LatestShareBar share={shares[0]} />
        {shares[0].periods.length < FULL_PERIODS ? <p className="text-xs text-muted">{t.accumulating}</p> : null}
      </StorySection>
    );
  }

  // 同業排名：前 5 名＋法巴前後各 1 名，標題寫與前後名次的差距（細節區列全部）
  const rankFmt = ranked ? (v: number) => rankingValue(ranked.m, v) : null;
  const rankingSection =
    ranked && rankFmt ? (
      <StorySection heading={rankingGapHeading(list) ?? orDash(ranked.m.label)}>
        <div className="max-w-3xl">
          <ChartTitle note={orDash(ranked.m.label)}>{t.ranking.previewHeading(orDash(ranked.self.name), ranked.self.rank)}</ChartTitle>
          <RankingBars rows={rankingPreview(ranked.m, 5, 1)} formatValue={rankFmt} ariaLabel={orDash(ranked.m.label)} />
        </div>
      </StorySection>
    ) : null;

  return (
    <>
      {headline ? <Lead parts={headline.parts} /> : null}
      <KeyNumbers items={tabNumbers(list)} />
      {main}
      {rankingSection}
      <NextStep
        down={{ label: multiShares.length > 0 ? t.downShare : t.downPlain, targetId: DETAILS_ID }}
      />
      <DetailDivider id={DETAILS_ID} label={t.details} />
      {ranked && rankFmt ? (
        <StorySection heading={t.ranking.all(ranked.m.rows.length, periodLong(ranked.m.period) ?? '')}>
          <div className="max-w-3xl">
            <ChartTitle note={orDash(ranked.m.label)}>{orDash(ranked.m.source)}</ChartTitle>
            <RankingBars rows={ranked.m.rows} formatValue={rankFmt} ariaLabel={orDash(ranked.m.label)} />
          </div>
        </StorySection>
      ) : null}
      {multiShares.map((s) => {
        const lead = growthLeaders(s);
        return (
          <StorySection key={s.key} heading={shareDetailHeading(s)}>
            <div className={`grid gap-12 ${lead ? 'lg:grid-cols-2' : ''}`}>
              {lead ? (
                <div>
                  <ChartTitle>{t.heading.growthLatest(periodText(s.periods.at(-1)!.period) ?? '')}</ChartTitle>
                  <GrowthBars share={s} />
                </div>
              ) : null}
              <div>
                <ChartTitle note={orDash(s.label)}>{t.heading.shareByPeriod}</ChartTitle>
                <StackedColumns periods={s.periods} strongName={lead?.fastest.name ?? null} ariaLabel={orDash(s.label)} />
              </div>
            </div>
          </StorySection>
        );
      })}
      <MetricTable metrics={list} />
    </>
  );
}

/**
 * 市場脈動（2026-10-27 視覺改版 V2、V5）：總覽 `#/market` ＋各組分頁 `#/market/:tab`。
 * 分頁只顯示有指標的組；網址的分頁不存在或沒有資料時 replace 回總覽。
 * 每頁照閱讀路徑：頁首 → 頁籤 → 一句結論 → 重點指標卡（總覽）或關鍵數字與主圖（分頁）→ 下一步 → 指標表。
 */
export function MarketPage() {
  const { tab: tabParam } = useParams();
  const location = useLocation();
  const fromHome = readFromPath(location.state) === '/';
  const tab: MarketTab | null = tabParam === undefined ? 'overview' : isGroup(tabParam) ? tabParam : null;
  const home = fromHome ? [{ label: zhTW.nav.home, to: '/' }] : [];
  useBreadcrumb(
    tab === 'overview' || tab === null
      ? [...home, { label: t.title }]
      : [...home, { label: t.title, to: '/market', state: location.state }, { label: tabLabel(tab) }],
  );
  const pulseState = useMarketPulse();

  if (tab === null) return <Navigate to="/market" replace state={location.state} />;

  const title = tab === 'overview' ? t.title : t.tabTitle(tabLabel(tab));
  const desc = tab === 'overview' ? zhTW.pageDesc.market : t.groups[tab].desc;

  let body: ReactNode;
  let aside: string | null = null;
  if (pulseState.status === 'error') {
    if (pulseState.error instanceof DataSourceError && pulseState.error.kind === 'not_found') body = <PendingContent />;
    else {
      const { message, detail } = errorText(pulseState.error, zhTW.home.pending);
      body = <StatusMessage tone="error" message={message} detail={detail} />;
    }
  } else if (pulseState.status !== 'ok') {
    body = <StatusMessage tone="info" message={zhTW.common.loading} />;
  } else {
    const { metrics, generatedAt } = pulseState.data;
    const groups = availableGroups(metrics);
    if (tab !== 'overview' && !groups.includes(tab)) return <Navigate to="/market" replace state={location.state} />;
    const list = tab === 'overview' ? metrics : metricsByGroup(metrics).get(tab)!;
    aside = t.headerAside(tab === 'overview' ? dataPeriod(metricsByGroup(metrics).get(groups[0] ?? 'growth')!) : dataPeriod(list), orDash(generatedAt));
    body =
      metrics.length === 0 ? (
        <p className="text-muted">{zhTW.home.noMetrics}</p>
      ) : (
        <>
          <MarketTabs groups={groups} current={tab} state={location.state} />
          {tab === 'overview' ? (
            <Overview metrics={metrics} groups={groups} />
          ) : (
            <GroupTab list={list} />
          )}
        </>
      );
  }

  return (
    <div className={tab === 'overview' ? 'space-y-5' : 'space-y-6'}>
      <PageHeader icon="pulse" title={title} desc={desc} aside={aside} />
      {body}
    </div>
  );
}
