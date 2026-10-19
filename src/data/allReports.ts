import type { ReportIndex } from '../types/reportIndex';
import type { ReportViewModel } from '../types/viewModel';
import { DEFAULT_SORT_DIR, sortRows } from '../lib/overviewFilter';
import { orDash } from '../lib/format';
import type { DataSource } from './DataSource';
import { normalizeReport, normalizeReportIndex } from './normalize';

export interface AllReportsResult {
  /** 依競品研究頁預設順序（產出日期新到舊） */
  reports: ReportViewModel[];
  /** 讀取或格式檢查失敗的報告名稱 */
  failedNames: string[];
}

/**
 * 同時讀取清單中的所有報告（我的待辦、我的單位選項使用）。
 * 部分失敗時回傳其餘報告；全部失敗時丟出第一個錯誤。缺 report_id 的列在首頁也無法開啟，這裡略過。
 */
export async function loadAllReports(source: DataSource, index: ReportIndex): Promise<AllReportsResult> {
  const rows = sortRows(normalizeReportIndex(index).rows, 'generatedDate', DEFAULT_SORT_DIR.generatedDate).filter(
    (row) => row.reportId !== null,
  );
  const results = await Promise.allSettled(rows.map((row) => source.getReport(row.reportId!)));

  const reports: ReportViewModel[] = [];
  const failedNames: string[] = [];
  let firstError: unknown = null;
  results.forEach((res, i) => {
    if (res.status === 'fulfilled') {
      try {
        reports.push(normalizeReport(res.value));
        return;
      } catch (e) {
        firstError ??= e;
      }
    } else {
      firstError ??= res.reason;
    }
    failedNames.push(orDash(rows[i]!.name));
  });

  if (reports.length === 0 && firstError !== null) throw firstError;
  return { reports, failedNames };
}
