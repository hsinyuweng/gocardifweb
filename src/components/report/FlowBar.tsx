import { Fragment } from 'react';
import { zhTW } from '../../i18n/zh-TW';

const t = zhTW.report.flow;

interface Step {
  label: string;
  status: string;
  state: 'done' | 'partial' | 'planned';
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A 區流程列（第 11.3 節 A） */
export function FlowBar({ provided, total }: { provided: number; total: number }) {
  const steps: Step[] = [
    { label: t.collect, status: t.done, state: 'done' },
    { label: t.analysis, status: t.analysisProgress(provided, total), state: provided === total ? 'done' : 'partial' },
    { label: t.synthesis, status: t.done, state: 'done' },
    { label: t.review, status: zhTW.common.roadmap, state: 'planned' },
  ];

  return (
    <ol className="flex min-h-10 items-center gap-2 overflow-x-auto whitespace-nowrap rounded border border-slate-200 bg-white px-4 py-1.5">
      {steps.map((s, i) => (
        <Fragment key={s.label}>
          {i > 0 ? (
            <li aria-hidden className="text-slate-300">
              →
            </li>
          ) : null}
          <li className={`flex items-center gap-1.5 ${s.state === 'planned' ? 'text-slate-400' : 'text-slate-800'}`}>
            <span
              className={`flex size-5 items-center justify-center rounded-full text-[11px] ${
                s.state === 'planned' ? 'bg-slate-100 text-slate-400' : 'bg-navy-800 text-white'
              }`}
            >
              {s.state === 'done' ? <CheckIcon /> : i + 1}
            </span>
            <span className="font-medium">{s.label}</span>
            <span
              className={`rounded px-1.5 py-0.5 text-xs ${
                s.state === 'planned' ? 'bg-slate-100 text-slate-400' : 'text-slate-500'
              }`}
            >
              {s.status}
            </span>
          </li>
        </Fragment>
      ))}
    </ol>
  );
}
