import { useLocation } from 'react-router';
import { PendingContent } from '../components/home/HomeCard';
import { StatusMessage } from '../components/common/StatusMessage';
import { MetricCard } from '../components/market/MetricCard';
import { DataSourceError } from '../data';
import { zhTW } from '../i18n/zh-TW';
import { orDash } from '../lib/format';
import { readFromPath } from '../lib/ownerParam';
import { metricsByGroup, PULSE_GROUP_ORDER } from '../lib/pulse';
import type { PulseGroup } from '../types/viewModel';
import { errorText, useBreadcrumb, useMarketPulse } from './pageChrome';
import { PageHeader } from '../components/layout/PageHeader';

const t = zhTW.market;
const sectionId = (g: PulseGroup) => `market-${g}`;

/** 市場脈動（2026-10-20 新規劃）：本月焦點＋五組指標 */
export function MarketPage() {
  const location = useLocation();
  const fromHome = readFromPath(location.state) === '/';
  useBreadcrumb(fromHome ? [{ label: zhTW.nav.home, to: '/' }, { label: t.title }] : [{ label: t.title }]);
  const pulseState = useMarketPulse();

  let body;
  if (pulseState.status === 'error') {
    if (pulseState.error instanceof DataSourceError && pulseState.error.kind === 'not_found') body = <PendingContent />;
    else {
      const { message, detail } = errorText(pulseState.error, zhTW.home.pending);
      body = <StatusMessage tone="error" message={message} detail={detail} />;
    }
  } else if (pulseState.status !== 'ok') {
    body = <StatusMessage tone="info" message={zhTW.common.loading} />;
  } else {
    const { focus, metrics } = pulseState.data;
    const groups = metricsByGroup(metrics);
    body = (
      <div className="space-y-6">
        {focus ? (
          <section className="rounded-lg border border-navy-600/20 bg-navy-600/5 px-5 py-4">
            <h2 className="text-sm font-semibold text-navy-800">{t.focusLabel}</h2>
            <p className="mt-1 text-slate-800">{focus.text}</p>
            <p className="mt-1 text-xs text-slate-500">{t.focusMeta(focus.asOf)}</p>
          </section>
        ) : null}
        {/* 只捲動頁面，不改網址 */}
        <nav aria-label={t.jumpLabel} className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm">
          {PULSE_GROUP_ORDER.map((g, i) => (
            <span key={g} className="inline-flex items-center gap-1">
              {i > 0 ? <span aria-hidden className="text-slate-300">｜</span> : null}
              <button
                type="button"
                onClick={() => document.getElementById(sectionId(g))?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="rounded px-1 text-navy-700 hover:underline"
              >
                {t.groups[g].title}
              </button>
            </span>
          ))}
        </nav>
        {PULSE_GROUP_ORDER.map((g) => {
          const list = groups.get(g)!;
          return (
            <section key={g} id={sectionId(g)} className="scroll-mt-20">
              <h2 className="text-lg font-semibold text-slate-900">{t.groups[g].title}</h2>
              <p className="mb-3 text-sm text-slate-500">{t.groups[g].desc}</p>
              {list.length === 0 ? (
                <p className="text-slate-500">{t.emptyGroup}</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {list.map((m) => (
                    <MetricCard key={m.key} metric={m} />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon="pulse"
        title={t.title}
        desc={zhTW.pageDesc.market}
        aside={pulseState.status === 'ok' ? zhTW.home.updatedAt(orDash(pulseState.data.generatedAt)) : null}
      />
      {body}
    </div>
  );
}
