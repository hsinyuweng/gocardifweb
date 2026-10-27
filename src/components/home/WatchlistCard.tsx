import { Link } from 'react-router';
import type { Candidate } from '../../lib/score';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';
import { KeyLine } from './HomeCard';

const t = zhTW.watchlist;
const LIMIT = 4;

// 第 1 名代表色深、第 2 名中、其他淡
const BAR_CLASS = ['bg-p', 'bg-p-mid', 'bg-p-pale'];

/** 追蹤清單框（2026-10-27 視覺改版）：候選件數與最高分、前 4 名分數橫條（商品名稱連報告頁） */
export function WatchlistCardContent({ ranked }: { ranked: Candidate[] }) {
  if (ranked.length === 0) return <p className="text-slate-500">{t.homeEmpty}</p>;
  const top = ranked[0]!;
  return (
    <>
      <KeyLine num={ranked.length}>
        {top.score.total !== null
          ? zhTW.home.watchKey(orDash(top.row.name), String(top.score.total))
          : zhTW.home.watchKeyNoScore}
      </KeyLine>
      <ul className="grid grid-cols-[minmax(0,11rem)_1fr] items-center gap-x-3 gap-y-1.5 text-[12.5px]">
        {ranked.slice(0, LIMIT).map(({ row, score }, i) => (
          <li key={row.reportId} className="contents">
            <Link
              to={`/report/${encodeURIComponent(row.reportId as string)}`}
              state={{ from: '/' }}
              className="truncate text-ink2 hover:text-ink hover:underline"
              title={row.name ?? undefined}
            >
              {orDash(row.name)}
            </Link>
            <span className="flex items-center gap-2">
              {score.total !== null ? (
                <span
                  className={`h-2.5 rounded-full ${BAR_CLASS[Math.min(i, BAR_CLASS.length - 1)]}`}
                  style={{ width: `${Math.max(2, score.total) * 0.85}%` }}
                />
              ) : null}
              <span className="text-muted tabular-nums">{orDash(score.total)}</span>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
