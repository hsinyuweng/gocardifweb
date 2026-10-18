import { useRef, useState, type ReactNode } from 'react';
import type { ModuleKey, ReportViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { matchesOwner } from '../../lib/owner';
import { FlowBar } from './FlowBar';
import { DecisionSummary } from './DecisionSummary';
import { ScorecardRow } from './ScorecardRow';
import { OwnerFilter } from './OwnerFilter';
import { BlockersTable } from './BlockersTable';
import { NextStepsList } from './NextStepsList';
import { DataQualityPanel } from './DataQualityPanel';
import { DataGapsPanel } from './DataGapsPanel';
import { DetailTabs } from './DetailTabs';
import { ReportFooter } from './ReportFooter';

const t = zhTW.report;

interface ReportViewProps {
  vm: ReportViewModel;
  /** 負責單位篩選；null 表示「全部」 */
  owner: string | null;
  onOwnerChange: (owner: string | null) => void;
}

interface PanelProps {
  title: string;
  action?: ReactNode;
  /** 只在列印時顯示於標題旁（例如目前的篩選條件） */
  printNote?: string | null;
  children: ReactNode;
}

function Panel({ title, action, printNote, children }: PanelProps) {
  return (
    <section className="break-inside-avoid rounded border border-slate-200 bg-white">
      <header className="flex min-h-11 items-center justify-between gap-3 border-b border-slate-100 px-4 py-2">
        <h2 className="text-base font-semibold text-slate-900">
          {title}
          {printNote ? <span className="ml-3 hidden text-xs font-normal text-slate-600 print:inline">{printNote}</span> : null}
        </h2>
        {action}
      </header>
      <div className="px-4 py-3">{children}</div>
    </section>
  );
}

/** 篩選後沒有項目時：原本就沒有 →「無」；被篩掉 → 提示 */
function emptyText(total: number) {
  return <p className="text-slate-600">{total === 0 ? zhTW.common.none : t.noOwnerMatch}</p>;
}

/** 報告頁內容（第 11.3 節）：只接收 ViewModel */
export function ReportView({ vm, owner, onOwnerChange }: ReportViewProps) {
  const [activeTab, setActiveTab] = useState<ModuleKey>('market_demand');
  const detailsRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const blockers = vm.blockers.filter((b) => matchesOwner(b.owners, owner));
  const nextSteps = vm.nextSteps.filter((s) => matchesOwner(s.owners, owner));
  const ownerNote = owner !== null ? t.printOwnerNote(owner) : null;

  const showDetail = (key: ModuleKey) => {
    setActiveTab(key);
    detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-4">
      <FlowBar provided={vm.analysisProvided} total={vm.analysisTotal} />
      <DecisionSummary summary={vm.summary} />
      <div ref={cardsRef} className="scroll-mt-20">
        <ScorecardRow cards={vm.moduleCards} onShowDetail={showDetail} />
      </div>

      {/* D 區：1280px 以上主欄 2/3、側欄 1/3。
          grid-cols-1 與 min-w-0 讓欄寬不被表格最小寬度撐開，表格才會在框內橫向捲動 */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="min-w-0 space-y-4 xl:col-span-2">
          <Panel
            title={t.blockersTitle}
            printNote={ownerNote}
            action={<OwnerFilter options={vm.ownerOptions} selected={owner} onChange={onOwnerChange} />}
          >
            {blockers.length > 0 ? <BlockersTable blockers={blockers} /> : emptyText(vm.blockers.length)}
          </Panel>
          <Panel title={t.nextStepsTitle} printNote={ownerNote}>
            {nextSteps.length > 0 ? <NextStepsList steps={nextSteps} /> : emptyText(vm.nextSteps.length)}
          </Panel>
        </div>
        <div className="min-w-0 space-y-4">
          <Panel title={t.dataQualityTitle}>
            <DataQualityPanel dq={vm.dataQuality} />
          </Panel>
          <Panel title={t.dataGapsTitle}>
            <DataGapsPanel gaps={vm.dataGaps} />
          </Panel>
        </div>
      </div>

      <DetailTabs
        ref={detailsRef}
        details={vm.details}
        active={activeTab}
        onChange={setActiveTab}
        onBackToCards={() => cardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
      />
      <ReportFooter disclaimer={vm.disclaimer} />
    </div>
  );
}
