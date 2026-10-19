import type { OwnerCount, ReportViewModel, TaskProductGroup, TaskSummary } from '../types/viewModel';
import { matchesOwner } from './owner';

// 我的待辦：跨報告彙整某負責單位的待解決事項與建議下一步（規格外功能，2026-10-18 經確認）

/** 各負責單位的件數（待解決事項＋建議下一步），依件數多到少；同數保持出現順序 */
export function countOwners(reports: ReportViewModel[]): OwnerCount[] {
  const counts = new Map<string, number>();
  for (const r of reports) {
    for (const item of [...r.blockers, ...r.nextSteps]) {
      for (const o of item.owners) counts.set(o, (counts.get(o) ?? 0) + 1);
    }
  }
  return [...counts].map(([owner, count]) => ({ owner, count })).sort((a, b) => b.count - a.count);
}

/**
 * 依商品分組；沒有項目的商品不列出。
 * reports 需已依競品研究頁順序排列；重大件數多的商品排前面，同數保持原順序。
 */
export function groupTasks(reports: ReportViewModel[], owner: string): TaskProductGroup[] {
  return reports
    .map((r) => {
      const blockers = r.blockers.filter((b) => matchesOwner(b.owners, owner));
      return {
        reportId: r.reportId,
        name: r.summary.name,
        issuer: r.summary.issuer,
        blockers,
        nextSteps: r.nextSteps.filter((s) => matchesOwner(s.owners, owner)),
        criticalCount: blockers.filter((b) => b.severityKey === 'critical').length,
      };
    })
    .filter((g) => g.blockers.length > 0 || g.nextSteps.length > 0)
    .sort((a, b) => b.criticalCount - a.criticalCount);
}

export function summarizeTasks(groups: TaskProductGroup[]): TaskSummary {
  return {
    blockerCount: groups.reduce((n, g) => n + g.blockers.length, 0),
    criticalCount: groups.reduce((n, g) => n + g.criticalCount, 0),
    nextStepCount: groups.reduce((n, g) => n + g.nextSteps.length, 0),
    productCount: groups.length,
  };
}
