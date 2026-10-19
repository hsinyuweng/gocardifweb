import type { AppConfig } from '../config/appConfig';
import { DataSourceError, type DataSource } from './DataSource';
import { StaticDataSource } from './StaticDataSource';
import { ApiDataSource } from './ApiDataSource';
import { FallbackDataSource } from './FallbackDataSource';

/** dataSource 為 api 但 apiBaseUrl 為空：每次讀取都回報設定錯誤（第 6.3 節） */
class ConfigErrorDataSource implements DataSource {
  async listReports(): Promise<never> {
    throw new DataSourceError('config_error');
  }
  async getReport(): Promise<never> {
    throw new DataSourceError('config_error');
  }
  async getFeed(): Promise<never> {
    throw new DataSourceError('config_error');
  }
  async getMarketPulse(): Promise<never> {
    throw new DataSourceError('config_error');
  }
}

/** 頁面透過這裡取得資料來源（第 6.1 節：元件與頁面不得直接呼叫 fetch） */
export function getDataSource(config: AppConfig): DataSource {
  if (config.dataSource === 'static') return new StaticDataSource();
  if (config.apiBaseUrl.trim() === '') return new ConfigErrorDataSource();
  const api = new ApiDataSource(config.apiBaseUrl.trim());
  return config.fallbackToStatic ? new FallbackDataSource(api, new StaticDataSource()) : api;
}

export { DataSourceError } from './DataSource';
export type { DataSourceErrorKind } from './DataSource';
export { isOffline, subscribeConnection } from './connectionStatus';
export { normalizeReportIndex, normalizeReport, normalizeAppMeta } from './normalize';
export { loadAllReports, type AllReportsResult } from './allReports';
export { normalizeFeed, normalizeMarketPulse } from './normalizeMarket';
