import type { Report } from '../types/report';
import type { ReportIndex } from '../types/reportIndex';
import { fetchJson, type DataSource } from './DataSource';
import { validateReport, validateReportIndex } from './validate';

// 第 6.2 節 api 模式：端點見 docs/api-contract.md 第 2 節
export class ApiDataSource implements DataSource {
  private readonly base: string;

  constructor(apiBaseUrl: string) {
    // 容許 apiBaseUrl 結尾多一個或多個斜線
    this.base = `${apiBaseUrl.replace(/\/+$/, '')}/api/v1/reports`;
  }

  async listReports(): Promise<ReportIndex> {
    return validateReportIndex(await fetchJson(this.base));
  }

  async getReport(reportId: string): Promise<Report> {
    return validateReport(await fetchJson(`${this.base}/${encodeURIComponent(reportId)}`));
  }
}
