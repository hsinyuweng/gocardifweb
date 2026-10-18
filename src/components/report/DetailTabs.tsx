import type { Ref } from 'react';
import type { ModuleKey, ReportDetailsViewModel } from '../../types/viewModel';
import { MarketDemandDetail } from './MarketDemandDetail';
import { ActuarialDetail } from './ActuarialDetail';
import { RegulatoryDetail } from './RegulatoryDetail';

const ORDER: readonly ModuleKey[] = ['market_demand', 'actuarial', 'regulatory'];

interface DetailTabsProps {
  details: ReportDetailsViewModel;
  active: ModuleKey;
  onChange: (key: ModuleKey) => void;
  ref?: Ref<HTMLElement>;
}

/**
 * E 區各面向詳細內容（第 11.3 節 E）：全寬分頁籤。
 * 三個分頁都會渲染，畫面上只顯示目前分頁；列印時全部依序展開（第 12 節）。
 */
export function DetailTabs({ details, active, onChange, ref }: DetailTabsProps) {
  return (
    <section ref={ref} className="scroll-mt-20 rounded border border-slate-200 bg-white">
      <div role="tablist" className="flex border-b border-slate-200 px-2 print:hidden">
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
                  ? 'border-navy-800 text-navy-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {details[key].moduleLabel}
            </button>
          );
        })}
      </div>

      {ORDER.map((key) => (
        <div
          key={key}
          id={`panel-${key}`}
          role="tabpanel"
          aria-labelledby={`tab-${key}`}
          className={`px-4 py-4 print:block ${key === active ? '' : 'hidden'} ${
            key === 'market_demand' ? '' : 'print:border-t print:border-slate-200'
          }`}
        >
          {/* 列印時分頁籤隱藏，改以標題標示面向 */}
          <h2 className="mb-3 hidden text-base font-semibold text-slate-900 print:block">{details[key].moduleLabel}</h2>
          {key === 'market_demand' ? <MarketDemandDetail detail={details.market_demand} /> : null}
          {key === 'actuarial' ? <ActuarialDetail detail={details.actuarial} /> : null}
          {key === 'regulatory' ? <RegulatoryDetail detail={details.regulatory} /> : null}
        </div>
      ))}
    </section>
  );
}
