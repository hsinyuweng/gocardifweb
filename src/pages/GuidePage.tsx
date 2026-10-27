import type { ReactNode } from 'react';
import { zhTW } from '../i18n/zh-TW';
import type { ModuleKey } from '../types/viewModel';
import { useBreadcrumb } from './pageChrome';
import { PageHeader } from '../components/layout/PageHeader';

const t = zhTW.guide;
const c = zhTW.overview.columns;

// 面向名稱與首頁表格欄名一致（使用說明不讀報告，無 legend 可查）
const MODULES: Array<{ key: ModuleKey; label: string }> = [
  { key: 'market_demand', label: c.marketDemand },
  { key: 'actuarial', label: c.actuarial },
  { key: 'regulatory', label: c.regulatory },
];

function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="rounded border border-slate-200 bg-white px-5 py-4">
      <h2 className="text-base font-semibold text-slate-900">
        <span className="mr-2 text-navy-700 tabular-nums">{n}.</span>
        {title}
      </h2>
      <div className="mt-2 text-slate-700">{children}</div>
    </section>
  );
}

/** 使用說明（第 11.4 節）：固定內容，全部來自 i18n */
export function GuidePage() {
  useBreadcrumb([{ label: zhTW.nav.guide }]);

  return (
    <div className="max-w-3xl space-y-4">
      <PageHeader icon="guide" title={t.title} desc={zhTW.pageDesc.guide} />

      <Section n={1} title={t.whatTitle}>
        <p>{t.whatBody}</p>
      </Section>

      <Section n={2} title={t.homeTitle}>
        <ul className="space-y-1">
          {t.homeBlocks.map((b) => (
            <li key={b.name}>
              <span className="font-medium text-slate-900">{b.name}</span>：{b.body}
            </li>
          ))}
        </ul>
      </Section>

      <Section n={3} title={t.flowTitle}>
        <ol className="flex flex-wrap items-center gap-2">
          {t.flowSteps.map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              {i > 0 ? (
                <span aria-hidden className="text-slate-300">
                  →
                </span>
              ) : null}
              <span
                className={`rounded px-2 py-0.5 ${
                  i === t.flowSteps.length - 1 ? 'bg-slate-100 text-slate-400' : 'bg-navy-800/10 text-navy-800'
                }`}
              >
                {step}
              </span>
            </li>
          ))}
        </ol>
      </Section>

      <Section n={4} title={t.questionsTitle}>
        <table className="w-full max-w-md border-collapse text-left">
          <thead className="border-b border-slate-200 text-slate-600">
            <tr className="h-9">
              <th scope="col" className="pr-4 font-medium">{t.questionsColumns.module}</th>
              <th scope="col" className="font-medium">{t.questionsColumns.question}</th>
            </tr>
          </thead>
          <tbody>
            {MODULES.map((m) => (
              <tr key={m.key} className="h-9 border-b border-slate-100 last:border-b-0">
                <td className="pr-4 font-medium text-slate-900">{m.label}</td>
                <td>{zhTW.coreQuestion[m.key]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section n={5} title={t.howTitle}>
        <p>{t.howBody}</p>
      </Section>

      <Section n={6} title={t.noteTitle}>
        <p>{t.noteBody}</p>
      </Section>
    </div>
  );
}
