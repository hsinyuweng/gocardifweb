import type { KeyPointViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';
import { SourceRefText } from './SourceRefText';
import { evidenceNote } from '../../lib/grade';
import { GradeNote } from '../common/GradeNote';

const t = zhTW.report.details;

/** 關鍵發現：文字、來源、證據等級（第 9.4 節：證據等級為 null 時不顯示） */
export function KeyPointList({ points }: { points: KeyPointViewModel[] }) {
  if (points.length === 0) return <p className="text-ink2">{zhTW.common.none}</p>;
  const note = evidenceNote(points.map((p) => p.evidenceLevel));
  return (
    <>
    <ul className="divide-y divide-line">
      {points.map((p, i) => (
        <li key={p.id ?? `kp-${i}`} className="py-2">
          <div className="flex items-start gap-2">
            {p.evidenceLevel !== null ? (
              <span className="mt-0.5 shrink-0 rounded-md bg-p-pale px-1.5 py-0.5 text-xs text-p-ink">
                {t.evidenceLevel(p.evidenceLevel)}
              </span>
            ) : null}
            <p className="text-ink">{orDash(p.text)}</p>
          </div>
          <p className="mt-0.5 text-xs text-muted">
            {t.source}
            {p.source || p.sourceUrl ? (
              <SourceRefText source={{ name: p.source, url: p.sourceUrl, asOf: p.asOf }} />
            ) : (
              orDash(p.source)
            )}
          </p>
        </li>
      ))}
    </ul>
    <GradeNote className="mt-1">{note}</GradeNote>
    </>
  );
}
