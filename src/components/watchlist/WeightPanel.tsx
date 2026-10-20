import { DIMENSIONS, MAX_WEIGHT, type DimensionKey, type Weights } from '../../lib/score';
import { zhTW } from '../../i18n/zh-TW';

const t = zhTW.watchlist;

interface WeightPanelProps {
  weights: Weights;
  /** 有任何候選商品有品牌／通路契合度的後端分數 */
  hasBrandFit: boolean;
  onChange: (key: DimensionKey, value: number) => void;
  onReset: () => void;
}

/** 權重滑桿：每個維度 0–5 整數，拖動即時重算排序 */
export function WeightPanel({ weights, hasBrandFit, onChange, onReset }: WeightPanelProps) {
  const allZero = DIMENSIONS.every((k) => weights[k] === 0);
  return (
    <section className="rounded border border-slate-200 bg-white">
      <header className="flex min-h-11 items-center justify-between gap-3 border-b border-slate-100 px-4 py-2">
        <h2 className="text-base font-semibold text-slate-900">{t.weightsTitle}</h2>
        <button type="button" onClick={onReset} className="text-sm text-navy-700 hover:underline">
          {t.reset}
        </button>
      </header>
      <div className="grid grid-cols-1 gap-x-8 gap-y-3 px-4 py-3 md:grid-cols-2">
        {DIMENSIONS.map((key) => {
          const id = `weight-${key}`;
          return (
            <div key={key} className="min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <label htmlFor={id} className="text-slate-800">
                  {t.dimensions[key]}
                  <span className="ml-2 text-xs text-slate-500">
                    {key === 'brandFit' && hasBrandFit ? t.basisBrandFitBackend : t.basis[key]}
                  </span>
                </label>
                <span className="tabular-nums font-semibold text-navy-800">{weights[key]}</span>
              </div>
              <input
                id={id}
                type="range"
                min={0}
                max={MAX_WEIGHT}
                step={1}
                value={weights[key]}
                onChange={(e) => onChange(key, Number(e.target.value))}
                className="mt-1 w-full accent-navy-700"
              />
              {key === 'brandFit' && weights.brandFit > 0 && !hasBrandFit ? (
                <p className="text-xs text-slate-500">{t.brandNoData}</p>
              ) : null}
            </div>
          );
        })}
      </div>
      {allZero ? <p className="px-4 pb-3 text-sm text-amber-800">{t.allZero}</p> : null}
    </section>
  );
}
