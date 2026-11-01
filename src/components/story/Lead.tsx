import { Link, useLocation } from 'react-router';
import type { HeadlinePart } from '../../lib/insights';
import { TONE_TEXT } from '../../lib/tone';

// 突顯：深紅字（--color-highlight）、粗體，沒有底色（2026-11-01 使用者回饋：推薦商品不夠突顯；試過白框不好看）
const HIGHLIGHT = 'font-bold text-highlight';

function Highlight({ part }: { part: HeadlinePart }) {
  const location = useLocation();
  return part.href ? (
    <Link
      to={part.href}
      state={{ from: location.pathname + location.search, fromState: location.state }}
      className={`${HIGHLIGHT} underline-offset-4 hover:underline`}
    >
      {part.text}
    </Link>
  ) : (
    <span className={HIGHLIGHT}>{part.text}</span>
  );
}

const Parts = ({ parts }: { parts: HeadlinePart[] }) => (
  <>
    {parts.map((p, i) =>
      p.highlight ? (
        <Highlight key={i} part={p} />
      ) : p.tone || p.strong ? (
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
 * 閱讀路徑 ②「一句結論」：本頁最大的字。好的結果綠色、壞的珊瑚紅、中性重點用代表色深色（2026-11-01）。
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
