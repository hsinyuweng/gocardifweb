import type { Ref } from 'react';
import type { ModuleKey, ReportDetailsViewModel } from '../../types/viewModel';
import { MarketDemandDetail } from './MarketDemandDetail';
import { ActuarialDetail } from './ActuarialDetail';
import { RegulatoryDetail } from './RegulatoryDetail';
import { zhTW } from '../../i18n/zh-TW';

const ORDER: readonly ModuleKey[] = ['market_demand', 'actuarial', 'regulatory'];

interface DetailTabsProps {
  details: ReportDetailsViewModel;
  active: ModuleKey;
  onChange: (key: ModuleKey) => void;
  /** 捲回 C 區三面向（從「看詳細內容」跳下來後可以回去） */
  onBackToCards: () => void;
  ref?: Ref<HTMLElement>;
}

/**
 * E 區各面向詳細內容（第 11.3 節 E）：全寬分頁籤。
 * 三個分頁都會渲染，畫面上只顯示目前分頁；列印時全部依序展開（第 12 節）。
 */
export function DetailTabs({ details, active, onChange, onBackToCards, ref }: DetailTabsProps) {
  return (
    <section ref={ref} className="scroll-mt-20 rounded-xl border border-line bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-line px-2 print:hidden">
      <div role="tablist" className="flex min-w-0 overflow-x-auto">
        {ORDER.map((key) => {
          const selected = key === active;
          return (
            <button
              key={key}
              id={`tab-${key}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`panel-${key}`}
              onClick={() => onChange(key)}
              className={`-mb-px h-11 border-b-2 px-4 font-medium transition-colors ${
                selected
                  ? 'border-p text-p-ink'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              {details[key].moduleLabel}
            </button>
          );
        })}
      </div>
        <button
          type="button"
          onClick={onBackToCards}
          className="shrink-0 px-2 whitespace-nowrap text-p-ink hover:text-p-ink hover:underline"
        >
          {zhTW.report.backToCards}
        </button>
      </div>

      {ORDER.map((key) => (
        <div
          key={key}
          id={`panel-${key}`}
          role="tabpanel"
          aria-labelledby={`tab-${key}`}
          className={`px-4 py-4 print:block ${key === active ? '' : 'hidden'} ${
            key === 'market_demand' ? '' : 'print:border-t print:border-line'
          }`}
        >
          {/* 列印時分頁籤隱藏，改以標題標示面向 */}
          <h2 className="mb-3 hidden text-base font-medium text-ink print:block">{details[key].moduleLabel}</h2>
          {key === 'market_demand' ? <MarketDemandDetail detail={details.market_demand} /> : null}
          {key === 'actuarial' ? <ActuarialDetail detail={details.actuarial} /> : null}
          {key === 'regulatory' ? <RegulatoryDetail detail={details.regulatory} /> : null}
        </div>
      ))}
    </section>
  );
}
