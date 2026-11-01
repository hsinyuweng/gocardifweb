import { Link } from 'react-router';
import type { OverviewRow, RecommendationGroup } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';
import { isRecommended } from '../../lib/recommendation';
import { groupsByRank } from '../../lib/researchStory';
import { DOT_CLASS } from '../../lib/signalColor';
import { ScoreNumber } from '../common/ScoreBar';

const t = zhTW.home;
const LIMIT = 4;

const reportLink = (r: OverviewRow, className: string) => (
  <Link
    to={`/report/${encodeURIComponent(r.reportId as string)}`}
    state={{ from: '/' }}
    className={`min-w-0 truncate hover:underline ${className}`}
    title={r.name ?? undefined}
  >
    {orDash(r.shortName)}
  </Link>
);

const blockerLine = (r: OverviewRow) => (
  <p className="truncate text-xs text-muted" title={r.topBlocker ?? undefined}>
    {r.topBlocker ? t.stuckOn(r.topBlocker) : t.noBlocker}
  </p>
);

/**
 * 競品研究框（2026-11-01 使用者回饋：直接寫推薦、和其他件分清楚）：
 * 推薦的商品放最上面（粗字、藍色實心標籤），粗分隔線下面是其餘商品（灰色，寫卡在哪裡）；每件右側寫引進分數。
 */
export function ResearchList({ rows, groups }: { rows: OverviewRow[]; groups: RecommendationGroup[] }) {
  const rec = rows.filter((r) => isRecommended(r.recommendationKey));
  const rest = rows.filter((r) => !isRecommended(r.recommendationKey));
  const restGroups = groupsByRank(groups).filter((g) => !isRecommended(g.key));
  const restLabel = restGroups.map((g) => `${g.count} 件${g.label ?? ''}`).join('、');
  return (
    <>
      {rec.length > 0 ? (
        <ul className="space-y-2.5">
          {rec.map((r) => (
            <li key={r.reportId}>
              <div className="flex items-center gap-2.5">
                <span className="shrink-0 rounded-md bg-good px-2 py-0.5 text-xs font-medium text-white">{orDash(r.recommendation.text)}</span>
                {reportLink(r, 'flex-1 text-[17px] font-semibold text-ink')}
                <ScoreNumber row={r} className="text-[17px]" />
              </div>
              <div className="mt-0.5">{blockerLine(r)}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-ink2">{t.noRecommended}</p>
      )}
      {rest.length > 0 ? (
        <div className="border-t-2 border-line pt-2.5">
          <p className="mb-1.5 text-xs text-muted">{rec.length > 0 ? t.restLabel(restLabel) : restLabel}</p>
          <ul className="space-y-1.5 text-[13px]">
            {rest.slice(0, Math.max(1, LIMIT - rec.length)).map((r) => (
              <li key={r.reportId}>
                <div className="flex items-baseline gap-2">
                  <span aria-hidden className={`inline-block size-2 shrink-0 rounded-full ${DOT_CLASS[r.recommendation.color]}`} />
                  {reportLink(r, 'flex-1 text-ink2')}
                  <ScoreNumber row={r} />
                </div>
                <div className="pl-4">{blockerLine(r)}</div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}
