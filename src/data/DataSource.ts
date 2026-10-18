import type { Report } from '../types/report';
import type { ReportIndex } from '../types/reportIndex';

// 第 6.1 節
export interface DataSource {
  listReports(): Promise<ReportIndex>;
  getReport(reportId: string): Promise<Report>;
}

export type DataSourceErrorKind = 'network' | 'not_found' | 'invalid_format' | 'server';

export class DataSourceError extends Error {
  readonly kind: DataSourceErrorKind;
  /** 給使用者看的補充細節（例如哪個欄位不合格）；可為 null */
  readonly detail: string | null;

  constructor(kind: DataSourceErrorKind, detail: string | null = null) {
    super(detail ? `${kind}: ${detail}` : kind);
    this.name = 'DataSourceError';
    this.kind = kind;
    this.detail = detail;
  }
}

/** 共用的讀取＋解析流程，把各種失敗轉為對應的 DataSourceError */
export async function fetchJson(url: string): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(url, { cache: 'no-store' });
  } catch (e) {
    throw new DataSourceError('network', e instanceof Error ? e.message : null);
  }
  if (res.status === 404) throw new DataSourceError('not_found', url);
  if (!res.ok) throw new DataSourceError('server', `HTTP ${res.status}`);

  const text = await res.text();
  try {
    return JSON.parse(text) as unknown;
  } catch (e) {
    throw new DataSourceError('invalid_format', e instanceof Error ? e.message : null);
  }
}
