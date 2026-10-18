import type { AppConfig } from '../config/appConfig';
import type { DataSource } from './DataSource';
import { StaticDataSource } from './StaticDataSource';

// 頁面透過這裡取得資料來源。
// 階段 1 只有 static 模式；ApiDataSource 與離線備援於階段 4 加入。
export function getDataSource(_config: AppConfig): DataSource {
  return new StaticDataSource();
}

export { DataSourceError } from './DataSource';
export type { DataSourceErrorKind } from './DataSource';
export { normalizeReportIndex, normalizeReport, normalizeAppMeta } from './normalize';
