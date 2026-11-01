import { useRef, useState, type ReactNode } from 'react';
import type { BlockerViewModel, ModuleKey, ReportViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';
import { ReportHeader, ReportLead, ReportReasons } from './DecisionSummary';
import { AnswerCards } from './AnswerCards';
import { NextStepsList } from './NextStepsList';
import { DetailTabs } from './DetailTabs';
import { ReportFooter } from './ReportFooter';
import { CompetitorTable } from './CompetitorTable';
import { SourceDocuments } from './SourceDocuments';
import { SignalLabel } from '../common/SignalLabel';
import { NextStep } from '../story/NextStep';
import { DetailDivider, StorySection } from '../story/StorySection';

const t = zhTW.report;
const DETAILS_ID = 'report-details';
const GAPS_ID = 'report-gaps';
const COMPETITORS_ID = 'report-competitors';
const DOCS_ID = 'report-source-docs';
/** 建議下一步先列幾項 */
const STEP_LIMIT = 3;
const PRIMARY_SEVERITY = new Set(['critical', 'blocking']);

interface ReportViewProps {
  vm: ReportViewModel;
  /** 頁首右側的主要動作（加入追蹤清單大按鈕） */
  headerAction?: ReactNode;
}

const toggleClass = 'text-[13px] text-ink2 hover:text-ink hover:underline print:hidden';

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

/** 待解決事項：事項＋處理方式（不列負責單位與面向） */
function GapList({ items }: { items: BlockerViewModel[] }) {
  return (
    <ul className="divide-y divide-line">
      {items.map((b, i) => (
        <li key={b.id ?? `gap-${i}`} className="py-2.5">
          <p className="text-ink">
            {b.severityKey === 'critical' ? (
              <span className="mr-2 text-[13px]">
                <SignalLabel signal={b.severity} />
              </span>
            ) : null}
            {orDash(b.title)}
          </p>
          {b.action ? <p className="mt-0.5 text-[13px] text-ink2">{b.action}</p> : null}
        </li>
      ))}
    </ul>
  );
}

/**
 * 報告頁內容（2026-11-01 顯示資料整理）：只回答「這個商品適不適合引進」。
 * ① 頁首 ② 整體建議＋一句結論 ③ 三個問題的答案卡 ④ 判斷理由、還差什麼（阻斷項目）、建議下一步前 3 項
 * ⑤ 詳細資料：台灣競品比較、三面向分頁、其他注意事項、商品原始資料（收起）。列印時全部展開。
 */
export function ReportView({ vm, headerAction = null }: ReportViewProps) {
  const [activeTab, setActiveTab] = useState<ModuleKey>('market_demand');
  const [allSteps, setAllSteps] = useState(false);
  const detailsRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const primary = vm.blockers.filter((b) => PRIMARY_SEVERITY.has(b.severityKey ?? ''));
  const others = vm.blockers.filter((b) => !PRIMARY_SEVERITY.has(b.severityKey ?? ''));

  const showDetail = (key: ModuleKey) => {
    setActiveTab(key);
    detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-6">
      <ReportHeader
        summary={vm.summary}
        action={headerAction}
        docsLink={
          vm.sourceDocuments.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById(DOCS_ID);
                if (el instanceof HTMLDetailsElement) el.open = true;
                scrollTo(DOCS_ID);
              }}
              className="text-ink2 underline-offset-2 hover:text-ink hover:underline">
              {t.sourceDocs.headerLink(vm.sourceDocuments.length)}
            </button>
          ) : null
        }
      />
      <ReportLead summary={vm.summary} />
      <div ref={cardsRef} className="scroll-mt-28">
        <AnswerCards
          vm={vm}
          onMarket={() => showDetail('market_demand')}
          onBlockers={() => scrollTo(GAPS_ID)}
          onCompetitors={() => (vm.competitors ? scrollTo(COMPETITORS_ID) : showDetail('market_demand'))}
        />
      </div>

      <StorySection heading={t.reasonsTitle}>
        <ReportReasons summary={vm.summary} />
      </StorySection>

      <StorySection id={GAPS_ID} heading={t.gapsTitle(primary.length)}>
        {primary.length > 0 ? <GapList items={primary} /> : <p className="text-ink2">{t.noGaps}</p>}
      </StorySection>

      {vm.nextSteps.length > 0 ? (
        <StorySection heading={t.nextStepsTitle}>
          <NextStepsList steps={vm.nextSteps} limit={allSteps ? undefined : STEP_LIMIT} />
          {vm.nextSteps.length > STEP_LIMIT ? (
            <button type="button" onClick={() => setAllSteps((v) => !v)} className={toggleClass}>
              {allSteps ? t.collapse : t.showAllSteps(vm.nextSteps.length)}
            </button>
          ) : null}
        </StorySection>
      ) : null}

      <NextStep down={{ label: vm.competitors ? t.downDetailsWithCompetitors : t.downDetails, targetId: DETAILS_ID }} links={[]} />

      <DetailDivider id={DETAILS_ID} label={t.detailsDivider} />
      {vm.competitors ? (
        <div id={COMPETITORS_ID} className="scroll-mt-28">
          <CompetitorTable data={vm.competitors} />
        </div>
      ) : null}
      <DetailTabs
        ref={detailsRef}
        details={vm.details}
        active={activeTab}
        onChange={setActiveTab}
        onBackToCards={() => cardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
      />
      {others.length > 0 ? (
        <details className="rounded-xl border border-line bg-white px-7 py-4">
          <summary className="cursor-pointer text-[15px] text-ink marker:text-muted">{t.otherWarnings(others.length)}</summary>
          <div className="mt-2">
            <GapList items={others} />
          </div>
        </details>
      ) : null}
      {vm.sourceDocuments.length > 0 ? <SourceDocuments id={DOCS_ID} docs={vm.sourceDocuments} /> : null}
      <ReportFooter disclaimer={vm.disclaimer} />
    </div>
  );
}
