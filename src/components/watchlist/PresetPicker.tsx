import { zhTW } from '../../i18n/zh-TW';
import { PRESETS, type WeightPreset } from '../../lib/weights';

const t = zhTW.watchlist;

/** 「看重：平均｜法規優先｜市場優先」（2026-10-27 V4，取代權重拉桿）；滑鼠移上去說明權重 */
export function PresetPicker({ value, onChange }: { value: WeightPreset; onChange: (p: WeightPreset) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.presetLabel}>
      <span className="text-[13px] text-ink2">{t.presetLabel}</span>
      <div className="inline-flex rounded-full border border-line bg-white p-0.5">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={value === p}
            title={t.presetHint[p]}
            onClick={() => onChange(p)}
            className={`rounded-full px-3.5 py-1 text-[13.5px] transition-colors ${
              value === p ? 'bg-p font-medium text-white' : 'text-ink2 hover:text-ink'
            }`}
          >
            {t.presets[p]}
          </button>
        ))}
      </div>
      <span className="text-xs text-muted">{t.presetHint[value]}</span>
    </div>
  );
}
