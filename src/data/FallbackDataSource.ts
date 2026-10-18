import type { Report } from '../types/report';
import type { ReportIndex } from '../types/reportIndex';
import { shouldFallback, type DataSource } from './DataSource';
import { setOffline } from './connectionStatus';

/**
 * 第 6.3 節：api 模式發生 network 或 server（5xx）錯誤時改讀靜態檔，並標記為離線。
 * 後端讀取成功時清除離線標記。
 */
export class FallbackDataSource implements DataSource {
  private readonly primary: DataSource;
  private readonly fallback: DataSource;

  constructor(primary: DataSource, fallback: DataSource) {
    this.primary = primary;
    this.fallback = fallback;
  }

  private async run<T>(read: (source: DataSource) => Promise<T>): Promise<T> {
    try {
      const result = await read(this.primary);
      setOffline(false);
      return result;
    } catch (e) {
      if (!shouldFallback(e)) throw e;
      setOffline(true);
      return read(this.fallback);
    }
  }

  listReports(): Promise<ReportIndex> {
    return this.run((s) => s.listReports());
  }

  getReport(reportId: string): Promise<Report> {
    return this.run((s) => s.getReport(reportId));
  }
}
