import { useMemo, type ReactNode } from 'react';
import { Navigate, useLocation, useParams } from 'react-router';
import { PendingContent } from '../components/home/HomeCard';
import { StatusMessage } from '../components/common/StatusMessage';
import { PageHeader } from '../components/layout/PageHeader';
import { BarList } from '../components/charts/BarList';
import { ColumnChart } from '../components/charts/ColumnChart';
import { LineBars } from '../components/charts/LineBars';
import { LineChart } from '../components/charts/LineChart';
import { PointLine } from '../components/charts/PointLine';
import { RankingBars } from '../components/charts/RankingBars';
import { Lead } from '../components/story/Lead';
import { ChartCard, ChartTitle } from '../components/story/StorySection';
import { DataSourceError, normalizeReportIndex } from '../data';
import { zhTW } from '../i18n/zh-TW';
import type { HeadlinePart } from '../lib/insights';
import { formatSharePct, orDash, shortPeriodLabels } from '../lib/format';
import {
  bankChannel,
  heroHeadline,
  lineBarRows,
  lineGrowthRows,
  lineHeading,
  periodLong,
  periodText,
  pickMetrics,
  rankingGapHeading,
  rankingHeadline,
  rankingPreview,
  rankingValue,
  selfShareHeading,
  trendValue,
  yieldChange,
  yieldHeading,
} from '../lib/marketStory';
import { readFromPath } from '../lib/ownerParam';
import { signedPct, signTone, TONE_TEXT } from '../lib/tone';
import type { OverviewRow, PulseMetricViewModel } from '../types/viewModel';
import { errorText, useBreadcrumb, useIndexState, useMarketPulse } from './pageChrome';

const t = zhTW.market;

type Picked = ReturnType<typeof pickMetrics>;

/** 卡片標題裡的好壞色片段 */
function HeadingParts({ parts }: { parts: HeadlinePart[] }) {
  return (
    <>
      {parts.map((p, i) => (
        <span key={i} className={p.tone ? `${TONE_TEXT[p.tone]} font-semibold` : undefined}>
          {p.text}
        </span>
      ))}
    </>
  );
}

/** 頁面最下面的資料來源（2026-11-01：不用把每個資訊都呈現） */
function Sources({ metrics }: { metrics: Array<PulseMetricViewModel | undefined | null> }) {
  const seen = new Map<string, string | null>();
  for (const m of metrics) if (m?.source && !seen.has(m.source)) seen.set(m.source, m.sourceUrl);
  if (seen.size === 0) return null;
  return (
    <p className="text-xs text-muted">
      {t.sources}
      {[...seen].map(([name, url], i) => (
        <span key={name}>
          {i > 0 ? '、' : null}
          {url ? (
            <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-ink hover:underline">
              {name}
            </a>
          ) : (
            name
          )}
        </span>
      ))}
    </p>
  );
}

/** 大卡：左邊大字最新年增率（好壞色），右邊每月年增率直條（最新一期實心） */
function Hero({ p }: { p: Picked }) {
  const { yoy, amount } = p;
  if (!yoy || yoy.latestValue === null) return null;
  const v = yoy.latestValue;
  const period = yoy.points.at(-1)?.period ?? null;
  return (
    <section className="grid grid-cols-1 gap-6 rounded-xl border border-line bg-white px-7 py-6 md:grid-cols-[minmax(0,15rem)_1fr] md:items-center">
      <div>
        <p className="text-[13px] text-muted">{t.hero.vsLastYear(periodText(period))}</p>
        <p className={`text-[56px] leading-none font-semibold tracking-tight tabular-nums ${TONE_TEXT[signTone(v) ?? 'key']}`}>
          {signedPct(v)}
        </p>
        {amount && amount.latestValue !== null ? (
          <p className="mt-2 text-[14px] text-ink2">{t.hero.amount(trendValue(amount, amount.latestValue))}</p>
        ) : null}
      </div>
      {yoy.points.length >= 2 ? (
        <div className="min-w-0">
          <ChartTitle>{t.hero.chart}</ChartTitle>
          <ColumnChart
            values={yoy.points.map((x) => x.value)}
            labels={shortPeriodLabels(yoy.points.map((x) => x.period))}
            highlight={yoy.points.length - 1}
            formatValue={(x) => signedPct(x)}
            height={170}
            signed
            ariaLabel={t.hero.chart}
          />
        </div>
      ) : null}
    </section>
  );
}

/** ① 候選商品所屬險種：正負橫條，有候選商品的險種實心 */
function LinesCard({ metrics, rows }: { metrics: PulseMetricViewModel[]; rows: OverviewRow[] }) {
  const lines = lineGrowthRows(metrics, rows);
  if (!lines) return null;
  return (
    <ChartCard heading={<HeadingParts parts={lineHeading(lines.rows)} />} note={t.heading.linesNote(periodText(lines.period))}>
      <LineBars rows={lineBarRows(lines.rows)} ariaLabel={t.heading.lines} />
    </ChartCard>
  );
}

/** ② 利率：近 12 個月折線，標題寫一年變化 */
function YieldCard({ p }: { p: Picked }) {
  const m = p.yieldM;
  if (!m || m.points.length < 2) return null;
  const c = yieldChange(m);
  return (
    <ChartCard heading={<HeadingParts parts={yieldHeading(m)} />} note={c ? t.heading.yieldNote(c.latest, c.meaning) : undefined}>
      <LineChart
        lines={[{ name: orDash(m.label), points: m.points }]}
        formatValue={(v) => trendValue(m, v)}
        height={150}
        annotate
        ariaLabel={`${t.heading.yieldChart}${orDash(m.label)}`}
      />
    </ChartCard>
  );
}

/** 法巴市占率過去五年：單線折線，每點標數字、最新一點實心。資料不到 2 期時顯示「資料準備中」 */
function SelfShareCard({ p }: { p: Picked }) {
  const m = p.selfShare;
  if (!m) return null;
  if (m.points.length < 2) {
    return (
      <ChartCard heading={t.selfShare.title} note={t.selfShare.pendingNote(m.latestValue !== null ? trendValue(m, m.latestValue) : null)}>
        <div className="grid h-[180px] place-items-center rounded-lg border-2 border-dashed border-line text-[14px] text-muted">
          {t.selfShare.pending}
        </div>
      </ChartCard>
    );
  }
  return (
    <ChartCard heading={<HeadingParts parts={selfShareHeading(m)} />} note={orDash(m.label)}>
      <PointLine points={m.points} formatValue={(v) => trendValue(m, v)} ariaLabel={t.selfShare.title} />
    </ChartCard>
  );
}

/** ③ 法巴排名：前 3 名＋法巴前後各 1 名，法巴實心 */
function RankingCard({ p }: { p: Picked }) {
  const r = p.ranking;
  if (!r) return null;
  return (
    <ChartCard heading={<HeadingParts parts={rankingHeadline(r)} />} note={rankingGapHeading(r) ?? orDash(r.m.label)}>
      <RankingBars rows={rankingPreview(r.m, 3, 1)} formatValue={(v) => rankingValue(r.m, v)} ariaLabel={orDash(r.m.label)} />
    </ChartCard>
  );
}

/** ④ 銀行通路：各通路占比橫條，銀行實心 */
function ChannelCard({ p }: { p: Picked }) {
  const ch = p.channel;
  const bank = ch ? bankChannel(ch) : null;
  if (!ch || !bank) return null;
  const latest = ch.periods.at(-1);
  return (
    <ChartCard heading={t.channel.heading(formatSharePct(bank.sharePct))} note={`${orDash(ch.label)} · ${periodLong(latest?.period ?? null) ?? ''}`}>
      <BarList
        ariaLabel={orDash(ch.label)}
        rows={[...(latest?.parts ?? [])]
          .sort((a, b) => b.sharePct - a.sharePct)
          .map((x, i) => ({
            key: x.name ?? String(i),
            name: orDash(x.name),
            value: x.sharePct,
            text: formatSharePct(x.sharePct),
            strong: x === bank,
          }))}
      />
    </ChartCard>
  );
}

/**
 * 市場脈動（2026-11-01 使用者回饋第二輪：不分頁，一眼看出市場動態）：
 * 大標題＋大卡（最新年增率＋每月直條）→ 圖卡（候選商品險種、法巴市占率過去五年、利率、法巴排名、銀行通路整列）→ 資料來源。
 * 舊分頁網址 `#/market/*` 一律 replace 到 `#/market`。
 */
export function MarketPage() {
  const { tab: tabParam } = useParams();
  const location = useLocation();
  const fromHome = readFromPath(location.state) === '/';
  useBreadcrumb([...(fromHome ? [{ label: zhTW.nav.home, to: '/' }] : []), { label: t.title }]);
  const pulseState = useMarketPulse();
  const indexState = useIndexState();
  const rows = useMemo(() => (indexState.status === 'ok' ? normalizeReportIndex(indexState.index).rows : []), [indexState]);

  if (tabParam !== undefined) return <Navigate to="/market" replace state={location.state} />;

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
    const p = pickMetrics(metrics);
    aside = t.headerAside(periodLong(p.yoy?.points.at(-1)?.period ?? null), orDash(generatedAt));
    body =
      metrics.length === 0 ? (
        <p className="text-muted">{zhTW.home.noMetrics}</p>
      ) : (
        <>
          {p.yoy ? <Lead parts={heroHeadline(p.yoy)} /> : null}
          <Hero p={p} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <LinesCard metrics={metrics} rows={rows} />
            <SelfShareCard p={p} />
            <YieldCard p={p} />
            <RankingCard p={p} />
            <div className="lg:col-span-2">
              <ChannelCard p={p} />
            </div>
          </div>
          <Sources metrics={[p.yoy, p.amount, p.mix, p.selfShare, p.yieldM, p.ranking?.m, p.channel]} />
        </>
      );
  }

  return (
    <div className="space-y-5">
      <PageHeader icon="pulse" title={t.title} desc={zhTW.pageDesc.market} aside={aside} />
      {body}
    </div>
  );
}
