import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { OWNER_PARAM } from '../../lib/ownerParam';
import type { ModuleKey, ReportViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { matchesOwner } from '../../lib/owner';
import { FlowBar } from './FlowBar';
import { ReportHeader, ReportLead, ReportReasons } from './DecisionSummary';
import { BlockerTile, ScorecardRow } from './ScorecardRow';
import { OwnerFilter } from './OwnerFilter';
import { BlockersTable } from './BlockersTable';
import { NextStepsList } from './NextStepsList';
import { DataQualityPanel } from './DataQualityPanel';
import { DataGapsPanel } from './DataGapsPanel';
import { DetailTabs } from './DetailTabs';
import { ReportFooter } from './ReportFooter';
import { CompetitorTable } from './CompetitorTable';
import { SourceDocuments } from './SourceDocuments';
import { NextStep } from '../story/NextStep';
import { DetailDivider, StorySection } from '../story/StorySection';

const t = zhTW.report;
const DETAILS_ID = 'report-details';
const BLOCKERS_ID = 'report-blockers';
const DOCS_ID = 'report-source-docs';
/** 建議下一步先列幾項 */
const STEP_LIMIT = 5;
/** 預設列出的嚴重度（其他收在「看全部」） */
const PRIMARY_SEVERITY = new Set(['critical', 'blocking']);

interface ReportViewProps {
  vm: ReportViewModel;
  /** 負責單位篩選；null 表示「全部」 */
  owner: string | null;
  onOwnerChange: (owner: string | null) => void;
  /** 進我的待辦時帶的 location.state（麵包屑回到這份報告） */
  tasksLinkState: unknown;
}

/** 篩選後沒有項目時：原本就沒有 →「無」；被篩掉 → 提示 */
function emptyText(total: number) {
  return <p className="text-ink2">{total === 0 ? zhTW.common.none : t.noOwnerMatch}</p>;
}

const toggleClass = 'text-[13px] text-ink2 hover:text-ink hover:underline print:hidden';

/**
 * 報告頁內容（第 11.3 節；2026-10-27 V4 照閱讀路徑重排，內容不刪）：
 * ① 頁首 ② 整體建議＋一句摘要 ③ 三面向＋待解決件數 ④ 判斷理由、待解決事項（先列重大與阻斷）
 * ⑤ 建議下一步（先列 5 項）＋往下看 → 細節：三面向分頁、資料品質、資料缺口。列印時全部展開。
 */
export function ReportView({ vm, owner, onOwnerChange, tasksLinkState }: ReportViewProps) {
  const [activeTab, setActiveTab] = useState<ModuleKey>('market_demand');
  const [allBlockers, setAllBlockers] = useState(false);
  const [allSteps, setAllSteps] = useState(false);
  const detailsRef = useRef<HTMLElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const blockers = vm.blockers.filter((b) => matchesOwner(b.owners, owner));
  const nextSteps = vm.nextSteps.filter((s) => matchesOwner(s.owners, owner));
  const ownerNote = owner !== null ? t.printOwnerNote(owner) : null;

  const counts = {
    critical: vm.blockers.filter((b) => b.severityKey === 'critical').length,
    blocking: vm.blockers.filter((b) => b.severityKey === 'blocking').length,
    warning: vm.blockers.filter((b) => b.severityKey !== 'critical' && b.severityKey !== 'blocking').length,
  };
  // 沒有重大與阻斷時直接全部列出，避免表格是空的
  const primaryCount = blockers.filter((b) => PRIMARY_SEVERITY.has(b.severityKey ?? '')).length;
  const hiddenCount = primaryCount > 0 && !allBlockers ? blockers.length - primaryCount : 0;

  const showDetail = (key: ModuleKey) => {
    setActiveTab(key);
    detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div ref={topRef} className="scroll-mt-28 space-y-6">
      <ReportHeader
        summary={vm.summary}
        flow={<FlowBar provided={vm.analysisProvided} total={vm.analysisTotal} />}
        docsLink={
          vm.sourceDocuments.length > 0 ? (
            <button
              type="button"
              onClick={() => document.getElementById(DOCS_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="text-ink2 underline-offset-2 hover:text-ink hover:underline"
            >
              {t.sourceDocs.headerLink(vm.sourceDocuments.length)}
            </button>
          ) : null
        }
      />
      <ReportLead summary={vm.summary} />
      <div ref={cardsRef} className="scroll-mt-20">
        <ScorecardRow
          cards={vm.moduleCards}
          onShowDetail={showDetail}
          extra={
            <BlockerTile
              counts={counts}
              onShow={() => document.getElementById(BLOCKERS_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            />
          }
        />
      </div>

      <StorySection heading={t.reasonsTitle}>
        <ReportReasons summary={vm.summary} />
      </StorySection>

      <StorySection
        id={BLOCKERS_ID}
        heading={
          <span className="flex w-full flex-wrap items-center justify-between gap-2">
            <span>
              {t.blockersTitle}
              {ownerNote ? <span className="ml-3 hidden text-xs font-normal text-ink2 print:inline">{ownerNote}</span> : null}
            </span>
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-normal">
              <OwnerFilter options={vm.ownerOptions} selected={owner} onChange={onOwnerChange} />
              {/* 我的待辦已從導覽收起（2026-10-27 V6），只從這裡進入 */}
              {owner !== null ? (
                <Link
                  to={`/tasks?${OWNER_PARAM}=${encodeURIComponent(owner)}`}
                  state={tasksLinkState}
                  className="text-[13px] text-ink2 hover:text-ink hover:underline print:hidden"
                >
                  {t.ownerAllProducts(owner)}
                </Link>
              ) : null}
            </span>
          </span>
        }
      >
        {blockers.length > 0 ? (
          <>
            <BlockersTable
              blockers={blockers}
              collapsed={hiddenCount > 0 ? (b) => !PRIMARY_SEVERITY.has(b.severityKey ?? '') : undefined}
            />
            {hiddenCount > 0 ? (
              <button type="button" onClick={() => setAllBlockers(true)} className={toggleClass}>
                {t.showAllBlockers(blockers.length, hiddenCount)}
              </button>
            ) : allBlockers && primaryCount < blockers.length ? (
              <button type="button" onClick={() => setAllBlockers(false)} className={toggleClass}>
                {t.collapse}
              </button>
            ) : null}
          </>
        ) : (
          emptyText(vm.blockers.length)
        )}
      </StorySection>

      <StorySection
        heading={
          <span>
            {t.nextStepsTitle}
            {ownerNote ? <span className="ml-3 hidden text-xs font-normal text-ink2 print:inline">{ownerNote}</span> : null}
          </span>
        }
      >
        {nextSteps.length > 0 ? (
          <>
            <NextStepsList steps={nextSteps} limit={allSteps ? undefined : STEP_LIMIT} />
            {nextSteps.length > STEP_LIMIT ? (
              <button type="button" onClick={() => setAllSteps((v) => !v)} className={toggleClass}>
                {allSteps ? t.collapse : t.showAllSteps(nextSteps.length)}
              </button>
            ) : null}
          </>
        ) : (
          emptyText(vm.nextSteps.length)
        )}
      </StorySection>

      <NextStep down={{ label: vm.competitors ? t.downDetailsWithCompetitors : t.downDetails, targetId: DETAILS_ID }} links={[]} />

      <DetailDivider id={DETAILS_ID} label={t.detailsDivider} />
      {vm.competitors ? <CompetitorTable data={vm.competitors} /> : null}
      <DetailTabs
        ref={detailsRef}
        details={vm.details}
        active={activeTab}
        onChange={setActiveTab}
        onBackToCards={() => cardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StorySection heading={t.dataQualityTitle}>
          <DataQualityPanel dq={vm.dataQuality} />
        </StorySection>
        <StorySection heading={t.dataGapsTitle}>
          <DataGapsPanel gaps={vm.dataGaps} />
        </StorySection>
      </div>
      {vm.sourceDocuments.length > 0 ? (
        <SourceDocuments
          id={DOCS_ID}
          docs={vm.sourceDocuments}
          onBack={() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        />
      ) : null}
      <ReportFooter disclaimer={vm.disclaimer} />
    </div>
  );
}
