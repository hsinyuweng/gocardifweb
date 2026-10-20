import type { KeyPointViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';
import { SourceRefText } from './SourceRefText';

const t = zhTW.report.details;

/** 關鍵發現：文字、來源、證據等級（第 9.4 節：證據等級為 null 時不顯示） */
export function KeyPointList({ points }: { points: KeyPointViewModel[] }) {
  if (points.length === 0) return <p className="text-slate-600">{zhTW.common.none}</p>;
  return (
    <ul className="divide-y divide-slate-100">
      {points.map((p, i) => (
        <li key={p.id ?? `kp-${i}`} className="py-2">
          <div className="flex items-start gap-2">
            {p.evidenceLevel !== null ? (
              <span className="mt-0.5 shrink-0 rounded bg-navy-800/10 px-1.5 py-0.5 text-xs text-navy-800">
                {t.evidenceLevel(p.evidenceLevel)}
              </span>
            ) : null}
            <p className="text-slate-900">{orDash(p.text)}</p>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
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
  );
}
