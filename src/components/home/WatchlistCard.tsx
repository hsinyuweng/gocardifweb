import { Link } from 'react-router';
import type { Candidate } from '../../lib/score';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';

const t = zhTW.watchlist;
const LIMIT = 5;

/** 追蹤清單卡片內容：依目前權重的綜合分數排序，最多 5 則 */
export function WatchlistCardContent({ ranked }: { ranked: Candidate[] }) {
  if (ranked.length === 0) return <p className="text-slate-500">{t.homeEmpty}</p>;
  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {ranked.slice(0, LIMIT).map(({ row, score }) => (
          <li key={row.reportId} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <Link
                to={`/report/${encodeURIComponent(row.reportId as string)}`}
                state={{ from: '/' }}
                className="font-medium text-slate-900 hover:text-navy-800 hover:underline"
              >
                {orDash(row.name)}
              </Link>
              <p className="mt-0.5 text-xs text-slate-500">{t.homeMeta(orDash(row.countryLabel))}</p>
            </div>
            <span className="shrink-0 text-2xl font-semibold tabular-nums text-navy-800">{orDash(score.total)}</span>
          </li>
        ))}
      </ul>
      <div className="text-right">
        <Link to="/watchlist" state={{ from: '/' }} className="text-sm text-navy-700 hover:underline">
          {zhTW.home.seeAll}
        </Link>
      </div>
    </div>
  );
}
