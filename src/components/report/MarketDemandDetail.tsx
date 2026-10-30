import type { ReportDetailsViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';
import { MarketSizingBar } from '../charts/MarketSizingBar';
import { DetailBlock } from './DetailBlock';
import { KeyPointList } from './KeyPointList';
import { confidenceNote } from '../../lib/grade';
import { GradeNote } from '../common/GradeNote';

const t = zhTW.report.details;

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex gap-2">
      <dt className="w-24 shrink-0 text-slate-500">{label}</dt>
      <dd className="text-slate-900">{orDash(value)}</dd>
    </div>
  );
}

/** E 區：市場需求 */
export function MarketDemandDetail({ detail }: { detail: ReportDetailsViewModel['market_demand'] }) {
  const s = detail.sizing;
  return (
    <div className="space-y-5">
      <DetailBlock title={t.summary}>
        <p className="text-slate-800">{orDash(detail.summary)}</p>
      </DetailBlock>
      <DetailBlock title={t.marketSizing}>
        <dl className="space-y-1.5">
          <Field label={t.methodology} value={s.methodology} />
          <Field label={t.targetPopulation} value={s.targetPopulation} />
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-slate-500">{t.estimate}</dt>
            <dd className="flex-1">
              <MarketSizingBar low={s.low} mid={s.mid} high={s.high} />
            </dd>
          </div>
          <Field label={t.confidence} value={s.confidence} />
        </dl>
        <GradeNote className="mt-2">{confidenceNote([s.confidence])}</GradeNote>
      </DetailBlock>
      <DetailBlock title={t.keyPoints}>
        <KeyPointList points={detail.keyPoints} />
      </DetailBlock>
    </div>
  );
}
