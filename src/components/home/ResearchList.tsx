import { Link } from 'react-router';
import type { OverviewRow } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';

const t = zhTW.home;
const LIMIT = 5;

const moreLink = 'text-sm text-navy-700 hover:underline';

/** 競品研究卡片內容：未審閱報告，新的在上面；點商品進報告頁 */
export function ResearchList({ rows }: { rows: OverviewRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-slate-500">{t.allReviewed}</p>
        <Link to="/research" state={{ from: '/' }} className={moreLink}>
          {t.seeAllReports}
        </Link>
      </div>
    );
  }

  const more = rows.length - LIMIT;
  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {rows.slice(0, LIMIT).map((r) => (
          <li key={r.reportId}>
            <Link
              to={`/report/${encodeURIComponent(r.reportId as string)}`}
              state={{ from: '/' }}
              className="font-medium text-slate-900 hover:text-navy-800 hover:underline"
            >
              {orDash(r.name)}
            </Link>
            <p className="mt-0.5 text-xs text-slate-500">{t.researchMeta(orDash(r.countryLabel), orDash(r.generatedAt ?? r.generatedDate))}</p>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm text-slate-500">{more > 0 ? t.moreUnread(more) : null}</span>
        <Link to="/research?unread=1" state={{ from: '/' }} className={moreLink}>
          {t.seeAll}
        </Link>
      </div>
    </div>
  );
}
