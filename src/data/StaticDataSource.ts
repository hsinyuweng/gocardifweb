import type { Report } from '../types/report';
import type { ReportIndex } from '../types/reportIndex';
import type { Feed } from '../types/feed';
import type { MarketPulse } from '../types/marketPulse';
import { fetchJson, type DataSource } from './DataSource';
import { validateFeed, validateMarketPulse, validateReport, validateReportIndex } from './validate';

// 第 6.2 節 static 模式：讀網站內 public/data/reports/；市場總覽資料在 public/data/
export class StaticDataSource implements DataSource {
  private readonly base = `${import.meta.env.BASE_URL}data/reports/`;
  private readonly dataBase = `${import.meta.env.BASE_URL}data/`;

  async listReports(): Promise<ReportIndex> {
    return validateReportIndex(await fetchJson(`${this.base}index.json`));
  }

  async getReport(reportId: string): Promise<Report> {
    return validateReport(await fetchJson(`${this.base}${encodeURIComponent(reportId)}.json`));
  }

  async getFeed(): Promise<Feed> {
    return validateFeed(await fetchJson(`${this.dataBase}feed.json`));
  }

  async getMarketPulse(): Promise<MarketPulse> {
    return validateMarketPulse(await fetchJson(`${this.dataBase}market-pulse.json`));
  }
}
