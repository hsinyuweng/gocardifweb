import type { HeadlinePart } from '../../lib/insights';
import { TONE_TEXT } from '../../lib/tone';

const Parts = ({ parts }: { parts: HeadlinePart[] }) => (
  <>
    {parts.map((p, i) =>
      p.tone || p.strong ? (
        <span key={i} className={`${TONE_TEXT[p.tone ?? 'key']} tabular-nums`}>
          {p.text}
        </span>
      ) : (
        <span key={i}>{p.text}</span>
      ),
    )}
  </>
);

/**
 * 閱讀路徑 ②「一句結論」：本頁最大的字。好的結果藍色、壞的珊瑚紅、中性重點用代表色深色（2026-11-01）。
 * sub：第二行較小的補充（例如「其餘 7 件暫緩：缺商品資料」）。
 */
export function Lead({ parts, sub }: { parts: HeadlinePart[]; sub?: HeadlinePart[] | null }) {
  return (
    <div className="space-y-1">
      <p className="text-[28px] leading-snug font-medium text-ink">
        <Parts parts={parts} />
      </p>
      {sub && sub.length > 0 ? (
        <p className="text-[18px] leading-snug text-ink2">
          <Parts parts={sub} />
        </p>
      ) : null}
    </div>
  );
}
