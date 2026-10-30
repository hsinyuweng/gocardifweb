import { Link } from 'react-router';
import type { OverviewRow, RecommendationGroup } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';
import { groupsByRank } from '../../lib/researchStory';
import { BigShareBar } from '../charts/BigShareBar';
import { KeyLine } from './HomeCard';

const t = zhTW.home;
const LIMIT = 2;

interface ResearchListProps {
  /** 全部報告，依建議由好到壞、再依綜合分數排好 */
  rows: OverviewRow[];
  groups: RecommendationGroup[];
}

/**
 * 競品研究框（2026-10-31 改成建議與卡關，取代審閱進度）：最好的建議幾件、建議分布大橫條（由好到壞）、
 * 最值得看的 2 件（點商品進報告頁）。
 */
export function ResearchList({ rows, groups }: ResearchListProps) {
  const ranked = groupsByRank(groups);
  const best = ranked[0];
  return (
    <>
      {best ? <KeyLine num={best.count}>{t.researchBest(orDash(best.label), rows.length)}</KeyLine> : null}
      <BigShareBar
        ariaLabel={zhTW.overview.columns.recommendation}
        segments={ranked.map((g) => ({
          key: g.key ?? '__null__',
          label: `${orDash(g.label)} ${g.count}`,
          value: g.count,
          title: `${orDash(g.label)}：${g.count}`,
        }))}
      />
      <ul className="mt-auto space-y-1.5 text-[13px]">
        {rows.slice(0, LIMIT).map((r) => (
          <li key={r.reportId} className="flex items-baseline gap-3">
            <Link
              to={`/report/${encodeURIComponent(r.reportId as string)}`}
              state={{ from: '/' }}
              className="min-w-0 flex-1 truncate text-ink hover:underline"
              title={r.name ?? undefined}
            >
              {orDash(r.name)}
            </Link>
            <span className="shrink-0 text-xs text-muted">{t.researchMeta(orDash(r.countryLabel), orDash(r.recommendation.text))}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
