import { Link } from 'react-router';
import type { OverviewRow } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';
import { DOT_CLASS } from '../../lib/signalColor';
import { WatchToggle } from '../overview/WatchToggle';
import { ScoreNumber } from '../common/ScoreBar';

const t = zhTW.watchlist;
const LIMIT = 4;

/** 商品簡稱（連報告頁）＋建議＋引進分數 */
function Row({ row, action }: { row: OverviewRow; action?: boolean }) {
  return (
    <li className="flex items-center gap-3 py-2 first:pt-0">
      <span aria-hidden className={`inline-block size-2 shrink-0 rounded-full ${DOT_CLASS[row.recommendation.color]}`} />
      <Link
        to={`/report/${encodeURIComponent(row.reportId as string)}`}
        state={{ from: '/' }}
        className="min-w-0 flex-1 truncate text-ink hover:underline"
        title={row.name ?? undefined}
      >
        {orDash(row.shortName)}
      </Link>
      <span className="shrink-0 text-xs text-ink2">{orDash(row.recommendation.text)}</span>
      <ScoreNumber row={row} className="w-12 text-right" />
      {action ? <WatchToggle reportId={row.reportId as string} name={orDash(row.shortName)} /> : null}
    </li>
  );
}

/**
 * 追蹤清單框（2026-11-01 使用者回饋）：不寫件數與最高分（使用者知道自己追蹤了什麼），
 * 直接列追蹤的商品（簡稱、建議、引進分數）；還沒追蹤時列最值得看的 3 件，可直接加入。
 */
export function WatchlistCardContent({ watched, suggestions }: { watched: OverviewRow[]; suggestions: OverviewRow[] }) {
  if (watched.length === 0) {
    if (suggestions.length === 0) return <p className="text-muted">{t.homeEmpty}</p>;
    return (
      <>
        <p className="text-ink2">{t.homeSuggestLead(suggestions.length)}</p>
        <ul className="divide-y divide-line text-[13.5px]">
          {suggestions.map((r) => (
            <Row key={r.reportId} row={r} action />
          ))}
        </ul>
      </>
    );
  }
  return (
    <>
      <ul className="divide-y divide-line text-[13.5px]">
        {watched.slice(0, LIMIT).map((r) => (
          <Row key={r.reportId} row={r} />
        ))}
      </ul>
      {watched.length > LIMIT ? <p className="mt-auto text-xs text-muted">{zhTW.home.moreItems(watched.length - LIMIT)}</p> : null}
    </>
  );
}
