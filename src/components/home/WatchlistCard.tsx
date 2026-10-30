import { Link } from 'react-router';
import type { Candidate } from '../../lib/score';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';
import { KeyLine } from './HomeCard';
import { WatchToggle } from '../overview/WatchToggle';

const t = zhTW.watchlist;
const LIMIT = 4;

// 第 1 名代表色深、第 2 名中、其他淡
const BAR_CLASS = ['bg-p', 'bg-p-mid', 'bg-p-pale'];

/** 分數橫條＋數字 */
function ScoreBar({ total, i }: { total: number | null; i: number }) {
  return (
    <span className="flex items-center gap-2">
      {total !== null ? (
        <span
          className={`h-2.5 rounded-full ${BAR_CLASS[Math.min(i, BAR_CLASS.length - 1)]}`}
          style={{ width: `${Math.max(2, total) * 0.85}%` }}
        />
      ) : null}
      <span className="text-muted tabular-nums">{orDash(total)}</span>
    </span>
  );
}

const reportLink = (c: Candidate) => (
  <Link
    to={`/report/${encodeURIComponent(c.row.reportId as string)}`}
    state={{ from: '/' }}
    className="truncate text-ink2 hover:text-ink hover:underline"
    title={c.row.name ?? undefined}
  >
    {orDash(c.row.name)}
  </Link>
);

/**
 * 還沒追蹤任何商品時（2026-10-31）：列出綜合分數最高的 3 件，每件「＋ 追蹤」直接加入（不跳頁）；加入後換成一般內容。
 */
function Suggestions({ suggestions }: { suggestions: Candidate[] }) {
  if (suggestions.length === 0) return <p className="text-muted">{t.homeEmpty}</p>;
  return (
    <>
      <p className="text-ink2">{t.homeSuggestLead(suggestions.length)}</p>
      <ul className="grid grid-cols-[minmax(0,11rem)_1fr_auto] items-center gap-x-3 gap-y-2 text-[12.5px]">
        {suggestions.map((c, i) => (
          <li key={c.row.reportId} className="contents">
            {reportLink(c)}
            <ScoreBar total={c.score.total} i={i} />
            <WatchToggle reportId={c.row.reportId as string} name={orDash(c.row.name)} />
          </li>
        ))}
      </ul>
      <p className="mt-auto text-xs text-muted">{t.homeSuggestNote}</p>
    </>
  );
}

/** 追蹤清單框（2026-10-27 視覺改版）：候選件數與最高分、前 4 名分數橫條（商品名稱連報告頁）；沒有候選時列建議 */
export function WatchlistCardContent({ ranked, suggestions }: { ranked: Candidate[]; suggestions: Candidate[] }) {
  if (ranked.length === 0) return <Suggestions suggestions={suggestions} />;
  const top = ranked[0]!;
  return (
    <>
      <KeyLine num={ranked.length}>
        {top.score.total !== null
          ? zhTW.home.watchKey(orDash(top.row.name), String(top.score.total))
          : zhTW.home.watchKeyNoScore}
      </KeyLine>
      <ul className="grid grid-cols-[minmax(0,11rem)_1fr] items-center gap-x-3 gap-y-1.5 text-[12.5px]">
        {ranked.slice(0, LIMIT).map((c, i) => (
          <li key={c.row.reportId} className="contents">
            {reportLink(c)}
            <ScoreBar total={c.score.total} i={i} />
          </li>
        ))}
      </ul>
    </>
  );
}
