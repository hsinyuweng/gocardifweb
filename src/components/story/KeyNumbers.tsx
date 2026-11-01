import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import type { KeyNumber } from '../../lib/marketStory';
import { TONE_TEXT } from '../../lib/tone';
import { Sparkline } from '../charts/Sparkline';

const COLS: Record<number, string> = { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3' };

/** 數字卡的外框與小標（KeyNumbers 與自訂內容的卡片共用） */
export function NumberCard({ label, children, corner }: { label: string; children: ReactNode; corner?: ReactNode }) {
  return (
    <div className="relative min-w-0 rounded-xl border border-line bg-white px-[18px] pt-3.5 pb-3">
      <p className="truncate pr-24 text-[12.5px] text-muted" title={label}>
        {label}
      </p>
      {corner ? <span className="absolute top-3.5 right-[18px] text-p-mid">{corner}</span> : null}
      {children}
    </div>
  );
}

/** 閱讀路徑 ③「關鍵數字」：最多 3 張白卡並排；迷你線放卡片右上角（2026-11-01 使用者回饋） */
export function KeyNumbers({ items }: { items: KeyNumber[] }) {
  const location = useLocation();
  if (items.length === 0) return null;
  return (
    <div className={`grid grid-cols-1 gap-3.5 ${COLS[items.length] ?? 'md:grid-cols-3'}`}>
      {items.map((k) => {
        const size = k.small ? 'text-[21px] leading-snug py-1' : 'truncate text-[30px] leading-tight';
        const cls = `block ${size} font-medium tabular-nums ${k.tone ? TONE_TEXT[k.tone] : 'text-ink'}`;
        return (
          <NumberCard key={k.key} label={k.label} corner={k.spark ? <Sparkline values={k.spark} width={88} height={22} /> : null}>
            {k.href ? (
              // 商品名直接點進報告頁（2026-11-01 使用者回饋）；麵包屑可回到這一頁
              <Link to={k.href} state={{ from: location.pathname + location.search, fromState: location.state }} className={`${cls} hover:underline`} title={k.value}>
                {k.value} →
              </Link>
            ) : (
              <p className={cls} title={k.value}>
                {k.value}
              </p>
            )}
            {k.note ? <div className="text-[12.5px] text-ink2">{k.note}</div> : null}
          </NumberCard>
        );
      })}
    </div>
  );
}
