import type { Report } from '../types/report';
import type { ReportIndex } from '../types/reportIndex';
import type { Feed } from '../types/feed';
import type { MarketPulse } from '../types/marketPulse';
import { fetchJson, type DataSource } from './DataSource';
import { validateFeed, validateMarketPulse, validateReport, validateReportIndex } from './validate';

// 第 6.2 節 api 模式：端點見 docs/api-contract.md 第 2 節
export class ApiDataSource implements DataSource {
  private readonly base: string;
  private readonly root: string;

  constructor(apiBaseUrl: string) {
    // 容許 apiBaseUrl 結尾多一個或多個斜線
    this.root = `${apiBaseUrl.replace(/\/+$/, '')}/api/v1`;
    this.base = `${this.root}/reports`;
  }

  async listReports(): Promise<ReportIndex> {
    return validateReportIndex(await fetchJson(this.base));
  }

  async getReport(reportId: string): Promise<Report> {
    return validateReport(await fetchJson(`${this.base}/${encodeURIComponent(reportId)}`));
  }

  async getFeed(): Promise<Feed> {
    return validateFeed(await fetchJson(`${this.root}/feed`));
  }

  async getMarketPulse(): Promise<MarketPulse> {
    return validateMarketPulse(await fetchJson(`${this.root}/market-pulse`));
  }
}
