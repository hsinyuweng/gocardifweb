import type { KeyNumber } from '../../lib/marketStory';
import { Sparkline } from '../charts/Sparkline';

/** 閱讀路徑 ③「關鍵數字」：3–4 個白卡並排，小標、數字（30px）、變化，可加迷你線（2026-10-27 視覺改版） */
export function KeyNumbers({ items }: { items: KeyNumber[] }) {
  if (items.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
      {items.map((k) => (
        <div key={k.key} className="min-w-0 rounded-xl border border-line bg-white px-[18px] pt-3.5 pb-3">
          <p className="truncate text-[12.5px] text-muted" title={k.label}>
            {k.label}
          </p>
          <p className={`truncate text-[30px] leading-tight font-medium tabular-nums ${k.coral ? 'text-coral' : 'text-ink'}`} title={k.value}>
            {k.value}
          </p>
          {k.note ? <p className="text-[12.5px] text-ink2">{k.note}</p> : null}
          {k.spark ? (
            <span className="mt-1.5 block text-p-mid">
              <Sparkline values={k.spark} width={160} height={24} />
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
