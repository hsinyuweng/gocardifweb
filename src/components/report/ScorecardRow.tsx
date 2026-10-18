import type { ModuleKey, ScorecardViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';
import { SignalLabel } from '../common/SignalLabel';
import { RegulatoryDistributionBar } from '../charts/RegulatoryDistributionBar';

const t = zhTW.report;

function Indicator({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="flex gap-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-800">{orDash(value)}</dd>
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
    <article className="flex break-inside-avoid flex-col rounded border border-slate-200 bg-white px-4 py-3">
      <header>
        <h2 className="text-base font-semibold text-slate-900">{card.moduleLabel}</h2>
        <p className="text-xs text-slate-500">{zhTW.coreQuestion[card.moduleKey]}</p>
      </header>

      {card.provided ? (
        <>
          <div className="mt-2 text-base font-semibold">
            <SignalLabel signal={card.signal} />
          </div>
          <div className="mt-2">
            <Indicators card={card} />
          </div>
          {/* 最多三行，超過以「…」截斷，滑鼠移上顯示全文 */}
          <p className="mt-2 line-clamp-3 text-slate-600" title={card.summary ?? undefined}>
            {orDash(card.summary)}
          </p>
        </>
      ) : (
        <p className="mt-2 text-slate-600">
          {t.notProvided}
          {t.rawStatus(orDash(card.rawStatus))}
        </p>
      )}

      {/* 推到底部，三欄的連結對齊 */}
      <div className="mt-auto pt-2 print:hidden">
        <button type="button" onClick={onShowDetail} className="text-navy-700 hover:text-navy-900 hover:underline">
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
}

/** C 區三面向計分列（第 11.3 節 C）：三欄等寬、高度一致 */
export function ScorecardRow({ cards, onShowDetail }: ScorecardRowProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 print:grid-cols-3">
      {cards.map((c) => (
        <ScorecardCard key={c.moduleKey} card={c} onShowDetail={() => onShowDetail(c.moduleKey)} />
      ))}
    </div>
  );
}
