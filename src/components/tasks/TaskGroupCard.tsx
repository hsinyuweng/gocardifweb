import type { ReactNode } from 'react';
import { Link } from 'react-router';
import type { TaskProductGroup } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';
import { BlockersTable } from '../report/BlockersTable';
import { NextStepsList } from '../report/NextStepsList';

interface TaskGroupCardProps {
  group: TaskProductGroup;
  owner: string;
}

function SubSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <h3 className="mb-1 text-sm font-semibold text-slate-700">{title}</h3>
      {children}
    </div>
  );
}

/** 一件商品中屬於所選負責單位的待解決事項與建議下一步 */
export function TaskGroupCard({ group: g, owner }: TaskGroupCardProps) {
  const reportUrl = `/report/${encodeURIComponent(g.reportId)}?owner=${encodeURIComponent(owner)}`;
  const none = <p className="text-slate-600">{zhTW.common.none}</p>;

  return (
    <section className="rounded border border-slate-200 bg-white">
      <header className="flex min-h-11 flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-slate-100 px-4 py-2">
        <h2 className="text-base font-semibold text-slate-900">
          {orDash(g.name)}
          {g.issuer ? <span className="ml-1 font-normal text-slate-500">（{g.issuer}）</span> : null}
        </h2>
        <Link to={reportUrl} className="shrink-0 text-navy-700 hover:underline print:hidden">
          {zhTW.tasks.openReport}
        </Link>
      </header>
      <div className="space-y-4 px-4 py-3">
        <SubSection title={zhTW.report.blockersTitle}>
          {g.blockers.length > 0 ? <BlockersTable blockers={g.blockers} /> : none}
        </SubSection>
        <SubSection title={zhTW.report.nextStepsTitle}>
          {g.nextSteps.length > 0 ? <NextStepsList steps={g.nextSteps} /> : none}
        </SubSection>
      </div>
    </section>
  );
}
