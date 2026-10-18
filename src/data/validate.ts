import type { Report } from '../types/report';
import type { ReportIndex } from '../types/reportIndex';
import { DataSourceError } from './DataSource';

// 第 6.4 節：只檢查最基本結構，其餘欄位交給 normalize 容錯處理

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** schema_version 以「1.」開頭才算相符；不符時不拋錯，只標記旗標（第 9.7 節） */
export function isSchemaVersionSupported(version: unknown): boolean {
  return typeof version === 'string' && version.startsWith('1.');
}

export function validateReport(raw: unknown): Report {
  if (!isObject(raw)) throw new DataSourceError('invalid_format', '報告不是 JSON 物件');
  if (!isObject(raw.report_meta)) throw new DataSourceError('invalid_format', '缺少 report_meta');
  if (!isObject(raw.headline)) throw new DataSourceError('invalid_format', '缺少 headline');
  if (typeof raw.report_meta.report_id !== 'string') {
    throw new DataSourceError('invalid_format', 'report_meta.report_id 不是字串');
  }
  return raw as unknown as Report;
}

export function validateReportIndex(raw: unknown): ReportIndex {
  if (!isObject(raw)) throw new DataSourceError('invalid_format', '報告清單不是 JSON 物件');
  if (!Array.isArray(raw.reports)) throw new DataSourceError('invalid_format', '報告清單缺少 reports 陣列');
  return raw as unknown as ReportIndex;
}
