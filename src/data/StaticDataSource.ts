import type { Report } from '../types/report';
import type { ReportIndex } from '../types/reportIndex';
import { fetchJson, type DataSource } from './DataSource';
import { validateReport, validateReportIndex } from './validate';

// 第 6.2 節 static 模式：讀網站內 public/data/reports/
export class StaticDataSource implements DataSource {
  private readonly base = `${import.meta.env.BASE_URL}data/reports/`;

  async listReports(): Promise<ReportIndex> {
    return validateReportIndex(await fetchJson(`${this.base}index.json`));
  }

  async getReport(reportId: string): Promise<Report> {
    return validateReport(await fetchJson(`${this.base}${encodeURIComponent(reportId)}.json`));
  }
}
