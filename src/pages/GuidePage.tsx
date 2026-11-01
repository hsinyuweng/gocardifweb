import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { zhTW } from '../i18n/zh-TW';
import { useBreadcrumb } from './pageChrome';
import { PageHeader } from '../components/layout/PageHeader';
import { PageBadge, type PageIconName } from '../components/common/PageIcon';
import type { PageTheme } from '../lib/pageTheme';

const t = zhTW.guide;

// 四個頁面：路徑、圖示、代表色（與側欄、首頁框一致）
const PAGES: Record<string, { to: string; icon: PageIconName; theme: PageTheme; name: string }> = {
  market: { to: '/market', icon: 'pulse', theme: 'pulse', name: zhTW.nav.market },
  news: { to: '/news', icon: 'news', theme: 'news', name: zhTW.nav.news },
  watchlist: { to: '/watchlist', icon: 'watchlist', theme: 'watch', name: zhTW.nav.watchlist },
  research: { to: '/research', icon: 'research', theme: 'research', name: zhTW.nav.overview },
};

const COLOR_CHIP: Record<string, string> = {
  good: 'bg-good',
  bad: 'bg-coral',
  gray: 'bg-slate-400',
  key: 'bg-p',
};

// 分數組成的長條顏色（示範用：由深到淺）
const PART_BAR: Record<string, string> = { rec: 'bg-good', blocking: 'bg-good/70', market: 'bg-good/40' };

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-white px-6 pt-4 pb-5">
      <h2 className="mb-3 text-[17px] font-medium text-ink">{title}</h2>
      {children}
    </section>
  );
}

/** 分數示範：CareScout 長照險 50 + 25 + 23 = 98（與競品研究的實際分數相同的組成） */
const EXAMPLE = { rec: 50, blocking: 25, market: 23 } as const;

/**
 * 使用說明（2026-11-01 第二輪：簡單清楚、用圖示）：四個頁面的圖示卡、顏色色塊、引進分數示範長條、看報告的順序。
 * 固定內容，全部來自 i18n。
 */
export function GuidePage() {
  useBreadcrumb([{ label: zhTW.nav.guide }]);
  const total = EXAMPLE.rec + EXAMPLE.blocking + EXAMPLE.market;

  return (
    <div className="max-w-5xl space-y-4">
      <PageHeader icon="guide" title={t.title} desc={zhTW.pageDesc.guide} />
      <p className="text-[18px] text-ink">{t.what}</p>

      <Card title={t.pagesTitle}>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {t.pages.map((pg) => {
            const meta = PAGES[pg.key]!;
            return (
              <li key={pg.key} data-theme={meta.theme}>
                <Link to={meta.to} className="flex h-full items-start gap-3 rounded-xl bg-p-faint px-4 py-3 ring-1 ring-p-pale hover:ring-p-mid">
                  <PageBadge icon={meta.icon} />
                  <span className="min-w-0">
                    <span className="block font-medium text-ink">{meta.name}</span>
                    <span className="block text-[13.5px] text-ink2">{pg.body}</span>
                    <span className="mt-1 block text-[12.5px] text-p-ink">{t.go}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title={t.colorsTitle}>
          <ul className="space-y-2.5">
            {t.colors.map((c) => (
              <li key={c.key} className="flex items-center gap-3" data-theme={c.key === 'key' ? 'research' : undefined}>
                <span aria-hidden className={`h-4 w-10 shrink-0 rounded-md ${COLOR_CHIP[c.key]}`} />
                <span className="font-medium text-ink">{c.name}</span>
                <span className="text-[13.5px] text-ink2">{c.body}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={t.scoreTitle}>
          <p className="text-[13.5px] text-ink2">{t.scoreBody}</p>
          <div className="mt-3">
            <div className="mb-1 flex items-baseline justify-between text-[13px]">
              <span className="text-ink2">{t.scoreExample}</span>
              <span className="text-[20px] font-semibold text-good-ink tabular-nums">{zhTW.score.points(total)}</span>
            </div>
            <div aria-hidden className="flex h-4 w-full gap-[2px] overflow-hidden rounded-md bg-line">
              {t.scoreParts.map((p) => (
                <span key={p.key} className={PART_BAR[p.key]} style={{ width: `${EXAMPLE[p.key as keyof typeof EXAMPLE]}%` }} />
              ))}
            </div>
          </div>
          <ul className="mt-3 space-y-1.5 text-[13.5px]">
            {t.scoreParts.map((p) => (
              <li key={p.key} className="flex items-center gap-2.5">
                <span aria-hidden className={`size-3 shrink-0 rounded-sm ${PART_BAR[p.key]}`} />
                <span className="w-20 shrink-0 font-medium text-ink">{p.name}</span>
                <span className="w-12 shrink-0 text-ink2 tabular-nums">{zhTW.score.points(p.max)}</span>
                <span className="text-ink2">{p.body}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title={t.reportTitle}>
        <ol className="flex flex-wrap items-center gap-2">
          {t.reportSteps.map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              {i > 0 ? (
                <span aria-hidden className="text-axis">
                  →
                </span>
              ) : null}
              <span className="rounded-md bg-p-pale px-2.5 py-1 text-ink">
                <span className="mr-1.5 text-p-ink tabular-nums">{'①②③④'[i]}</span>
                {step}
              </span>
            </li>
          ))}
        </ol>
      </Card>

      <p className="text-[13px] text-muted">{t.note}</p>
    </div>
  );
}
