import { Link } from 'react-router';
import type { OverviewRow, RecommendationGroup } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';
import { BigShareBar } from '../charts/BigShareBar';
import { KeyLine } from './HomeCard';

const t = zhTW.home;
const LIMIT = 2;

interface ResearchListProps {
  /** 未審閱報告，新的在前 */
  rows: OverviewRow[];
  total: number;
  groups: RecommendationGroup[];
}

/**
 * 競品研究框（2026-10-27 視覺改版）：未審閱份數、建議分布大橫條（代表色深淺，不用燈號色）、
 * 最新 2 份未審閱報告（點商品進報告頁）。
 */
export function ResearchList({ rows, total, groups }: ResearchListProps) {
  return (
    <>
      {rows.length > 0 ? (
        <KeyLine num={rows.length}>{t.researchKey(total)}</KeyLine>
      ) : (
        <p className="text-ink2">{t.researchAllReviewed(total)}</p>
      )}
      <BigShareBar
        ariaLabel={zhTW.overview.columns.recommendation}
        segments={groups.map((g) => ({
          key: g.key ?? '__null__',
          label: `${orDash(g.label)} ${g.count}`,
          value: g.count,
          title: `${orDash(g.label)}：${g.count}`,
        }))}
      />
      {rows.length > 0 ? (
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
              <span className="shrink-0 text-xs text-muted">
                {t.researchMeta(orDash(r.countryLabel), orDash(r.generatedAt ?? r.generatedDate))}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
