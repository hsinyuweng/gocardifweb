import { Link } from 'react-router';
import type { OverviewRow, RecommendationGroup } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';
import { groupsByRank } from '../../lib/researchStory';
import { DOT_CLASS } from '../../lib/signalColor';
import { KeyLine } from './HomeCard';

const t = zhTW.home;
const LIMIT = 3;

interface ResearchListProps {
  /** 全部報告，依建議由好到壞、再依法規可行性排好 */
  rows: OverviewRow[];
  groups: RecommendationGroup[];
}

/**
 * 競品研究框（2026-11-01 顯示資料整理，首頁最重要的框）：最好的建議幾件，
 * 再列最值得看的 3 件：商品名（進報告頁）、建議、卡在哪裡（最嚴重的一項待解決事項）。
 */
export function ResearchList({ rows, groups }: ResearchListProps) {
  const best = groupsByRank(groups)[0];
  return (
    <>
      {best ? <KeyLine num={best.count}>{t.researchBest(orDash(best.label), rows.length)}</KeyLine> : null}
      <ul className="divide-y divide-line text-[13.5px]">
        {rows.slice(0, LIMIT).map((r) => (
          <li key={r.reportId} className="py-2 first:pt-0">
            <div className="flex items-baseline gap-2">
              <span aria-hidden className={`inline-block size-2 shrink-0 rounded-full ${DOT_CLASS[r.recommendation.color]}`} />
              <Link
                to={`/report/${encodeURIComponent(r.reportId as string)}`}
                state={{ from: '/' }}
                className="min-w-0 flex-1 truncate text-ink hover:underline"
                title={r.name ?? undefined}
              >
                {orDash(r.name)}
              </Link>
              <span className="shrink-0 text-xs text-ink2">{orDash(r.recommendation.text)}</span>
            </div>
            <p className="truncate pl-4 text-xs text-muted" title={r.topBlocker ?? undefined}>
              {r.topBlocker ? t.stuckOn(r.topBlocker) : t.noBlocker}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
