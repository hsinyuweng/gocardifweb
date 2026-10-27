import type { HeadlinePart } from '../../lib/insights';

/** 閱讀路徑 ②「一句結論」：本頁最大的字；最重要的數字用珊瑚色（2026-10-27 視覺改版） */
export function Lead({ parts }: { parts: HeadlinePart[] }) {
  return (
    <p className="max-w-[900px] text-[28px] leading-snug font-medium text-balance text-ink">
      {parts.map((p, i) =>
        p.strong ? (
          <span key={i} className="text-coral tabular-nums">
            {p.text}
          </span>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </p>
  );
}
