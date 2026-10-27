import type { ReactNode } from 'react';
import type { ModuleKey, ScorecardViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';
import { SignalLabel } from '../common/SignalLabel';
import { RegulatoryDistributionBar } from '../charts/RegulatoryDistributionBar';

const t = zhTW.report;

function Indicator({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="flex gap-2">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-ink">{orDash(value)}</dd>
    </div>
  );
}

function Indicators({ card }: { card: ScorecardViewModel }) {
  switch (card.moduleKey) {
    case 'market_demand':
      return (
        <dl className="space-y-1">
          <Indicator label={t.indicators.confidence} value={card.confidence} />
        </dl>
      );
    case 'actuarial':
      return (
        <dl className="space-y-1">
          <Indicator label={t.indicators.comparability} value={card.comparability} />
          <Indicator label={t.indicators.pricingFlagCount} value={card.pricingFlagCount} />
        </dl>
      );
    case 'regulatory':
      return <RegulatoryDistributionBar segments={card.distribution} />;
  }
}

function ScorecardCard({ card, onShowDetail }: { card: ScorecardViewModel; onShowDetail: () => void }) {
  return (
    <article className="flex min-w-0 break-inside-avoid flex-col rounded-xl border border-line bg-white px-[18px] pt-3.5 pb-3">
      <header>
        <h2 className="text-[13px] text-muted">{card.moduleLabel}</h2>
        <p className="sr-only">{zhTW.coreQuestion[card.moduleKey]}</p>
      </header>

      {card.provided ? (
        <>
          <div className="mt-1 text-[20px] font-medium">
            <SignalLabel signal={card.signal} />
          </div>
          <div className="mt-2">
            <Indicators card={card} />
          </div>
          {/* 最多兩行，超過以「…」截斷，滑鼠移上顯示全文 */}
          <p className="mt-2 line-clamp-2 text-[13px] text-ink2" title={card.summary ?? undefined}>
            {orDash(card.summary)}
          </p>
        </>
      ) : (
        <p className="mt-2 text-[13px] text-ink2">
          {t.notProvided}
          {card.skipReason ? t.skipReason(card.skipReason) : t.rawStatus(orDash(card.rawStatus))}
        </p>
      )}

      {/* 推到底部，三欄的連結對齊 */}
      <div className="mt-auto pt-2 print:hidden">
        <button type="button" onClick={onShowDetail} className="text-[13px] text-ink2 hover:text-ink hover:underline">
          {t.showDetail} →
        </button>
      </div>
    </article>
  );
}

interface ScorecardRowProps {
  cards: ScorecardViewModel[];
  /** 點「看詳細內容」：切換 E 區分頁並捲動過去 */
  onShowDetail: (key: ModuleKey) => void;
  /** 第四塊（待解決事項件數） */
  extra?: ReactNode;
}

/** C 區三面向（第 11.3 節 C；2026-10-27 V4 改為閱讀路徑 ③ 的四塊：三面向＋待解決件數），高度一致 */
export function ScorecardRow({ cards, onShowDetail, extra }: ScorecardRowProps) {
  return (
    <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-4 print:grid-cols-4">
      {cards.map((c) => (
        <ScorecardCard key={c.moduleKey} card={c} onShowDetail={() => onShowDetail(c.moduleKey)} />
      ))}
      {extra}
    </div>
  );
}

/** 第四塊：待解決事項「重大 1 · 阻斷 9 · 注意 2」，有重大時數字珊瑚色；點下去捲到待解決事項 */
export function BlockerTile({ counts, onShow }: { counts: { critical: number; blocking: number; warning: number }; onShow: () => void }) {
  const total = counts.critical + counts.blocking + counts.warning;
  return (
    <article className="flex min-w-0 break-inside-avoid flex-col rounded-xl border border-line bg-white px-[18px] pt-3.5 pb-3">
      <h2 className="text-[13px] text-muted">{t.blockersTitle}</h2>
      <p className={`mt-1 text-[30px] leading-tight font-medium tabular-nums ${counts.critical > 0 ? 'text-coral' : 'text-ink'}`}>
        {t.blockerTotal(total)}
      </p>
      <p className="mt-1 text-[13px] text-ink2">{t.blockerBreakdown(counts.critical, counts.blocking, counts.warning)}</p>
      <div className="mt-auto pt-2 print:hidden">
        <button type="button" onClick={onShow} className="text-[13px] text-ink2 hover:text-ink hover:underline">
          {t.showBlockers} ↓
        </button>
      </div>
    </article>
  );
}
