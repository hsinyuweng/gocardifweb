import type { MouseEvent, ReactNode } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { PendingContent } from '../components/home/HomeCard';
import { StatusMessage } from '../components/common/StatusMessage';
import { PageHeader } from '../components/layout/PageHeader';
import { MetricCard } from '../components/market/MetricCard';
import { MarketTabs, tabLabel, tabPath } from '../components/market/MarketTabs';
import { BigShareBar } from '../components/charts/BigShareBar';
import { ColumnChart } from '../components/charts/ColumnChart';
import { DivergingBars } from '../components/charts/DivergingBars';
import { LineChart } from '../components/charts/LineChart';
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
  groupSentence,
  growthLeaders,
  isRank,
  mainTrend,
  overviewNumbers,
  periodLong,
  periodText,
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
function GrowthBars({ share, compact = false }: { share: PulseShareViewModel; compact?: boolean }) {
  const lead = growthLeaders(share);
  if (!lead) return null;
  const rows = (share.periods.at(-1)?.parts ?? [])
    .filter((p) => p.growthPct !== null)
    .sort((a, b) => b.growthPct! - a.growthPct!)
    .map((p) => ({ name: orDash(p.name), value: p.growthPct!, strong: p.name === lead.fastest.name }));
  return <DivergingBars rows={rows} formatValue={(v) => `${v > 0 ? '+' : ''}${formatSharePct(v)}`} ariaLabel={orDash(share.label)} compact={compact} />;
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

/** 總覽卡片的小圖：有年增率的占比 → 正負橫條；單線 → 註記折線；只有占比 → 大橫條 */
function MiniChart({ list }: { list: PulseMetricViewModel[] }) {
  const shares = shareMetrics(list);
  const withGrowth = shares.find((s) => growthLeaders(s) !== null);
  if (withGrowth) return <GrowthBars share={withGrowth} compact />;
  const m = mainTrend(list);
  if (m && m.points.length >= 2) {
    return (
      <LineChart
        lines={[{ name: orDash(m.label), points: m.points }]}
        formatValue={(v) => trendValue(m, v)}
        formatTick={(v) => axisTick(m, v)}
        height={96}
        invert={isRank(m)}
        annotate
        ariaLabel={orDash(m.label)}
      />
    );
  }
  if (shares[0]) return <LatestShareBar share={shares[0]} />;
  return null;
}

/** 總覽的一組：一句話＋小圖，整張可點（滑過時框線變代表色），右上「看分頁 →」 */
function GroupCard({ group, sentence, children, state }: { group: PulseGroup; sentence: string | null; children: ReactNode; state: unknown }) {
  const navigate = useNavigate();
  const onClick = (e: MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('a, button')) return;
    if (window.getSelection()?.toString()) return;
    void navigate(tabPath(group), { state });
  };
  return (
    <section
      onClick={onClick}
      className="flex min-w-0 cursor-pointer flex-col gap-2 rounded-xl border border-line bg-white px-5 pt-3 pb-3 transition-colors hover:border-p"
    >
      <div className="flex items-baseline justify-between text-[12.5px]">
        <h2 className="inline-flex items-center gap-[7px] text-ink2">
          <span aria-hidden className="size-[7px] rounded-full bg-p" />
          {t.groups[group].title}
        </h2>
        <Link to={tabPath(group)} state={state} className="text-ink2 hover:text-ink hover:underline">
          {t.seeTab}
        </Link>
      </div>
      {sentence ? <p className="text-[15.5px] leading-normal text-ink">{sentence}</p> : null}
      {children}
    </section>
  );
}

function Overview({ metrics, groups, state }: { metrics: PulseMetricViewModel[]; groups: PulseGroup[]; state: unknown }) {
  const byGroup = metricsByGroup(metrics);
  const headline = overviewHeadline(metrics);
  const missing = PULSE_GROUP_ORDER.filter((g) => !groups.includes(g));
  return (
    <>
      {headline ? <Lead parts={headline.parts} /> : null}
      <KeyNumbers items={overviewNumbers(metrics, headline?.metricKey ?? null)} />
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        {groups.map((g) => {
          const list = byGroup.get(g)!;
          return (
            <GroupCard key={g} group={g} sentence={groupSentence(list)} state={state}>
              <MiniChart list={list} />
            </GroupCard>
          );
        })}
      </div>
      <NextStep
        links={groups.map((g) => ({ to: tabPath(g), label: `${tabLabel(g)} →`, state }))}
        note={missing.length > 0 ? missing.map((g) => t.missingGroup(t.groups[g].title, t.groups[g].desc)).join('；') : null}
      />
    </>
  );
}

function GroupTab({ group, list, groups, state }: { group: PulseGroup; list: PulseMetricViewModel[]; groups: PulseGroup[]; state: unknown }) {
  const headline = tabHeadline(list);
  const m = mainTrend(list);
  const shares = shareMetrics(list);
  const multiShares = shares.filter((s) => s.periods.length >= 2);

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

  // 下一步：前後分頁
  const tabs: MarketTab[] = ['overview', ...groups];
  const i = tabs.indexOf(group);
  const neighbors = [tabs[i - 1], tabs[i + 1]].filter((x): x is MarketTab => x !== undefined);

  return (
    <>
      {headline ? <Lead parts={headline.parts} /> : null}
      <KeyNumbers items={tabNumbers(list)} />
      {main}
      <NextStep
        down={{ label: multiShares.length > 0 ? t.downShare : t.downPlain, targetId: DETAILS_ID }}
        links={neighbors.map((x) => ({ to: tabPath(x), label: `${tabLabel(x)} →`, state }))}
      />
      <DetailDivider id={DETAILS_ID} label={t.details} />
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {list.map((metric) => (
          <MetricCard key={metric.key} metric={metric} />
        ))}
      </div>
    </>
  );
}

/**
 * 市場脈動（2026-10-27 視覺改版 V2）：總覽 `#/market` ＋各組分頁 `#/market/:tab`。
 * 分頁只顯示有指標的組；網址的分頁不存在或沒有資料時 replace 回總覽。
 * 每頁照閱讀路徑：頁首 → 頁籤 → 一句結論 → 關鍵數字 → 圖表 → 下一步 →（分頁）細節。
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
        <p className="text-slate-500">{zhTW.home.noMetrics}</p>
      ) : (
        <>
          <MarketTabs groups={groups} current={tab} state={location.state} />
          {tab === 'overview' ? (
            <Overview metrics={metrics} groups={groups} state={location.state} />
          ) : (
            <GroupTab group={tab} list={list} groups={groups} state={location.state} />
          )}
        </>
      );
  }

  return (
    <div className={tab === 'overview' ? 'space-y-4' : 'space-y-6'}>
      <PageHeader icon="pulse" title={title} desc={desc} aside={aside} />
      {body}
    </div>
  );
}
