import type { Report } from '../types/report';
import type { ReportIndex } from '../types/reportIndex';
import type { Feed } from '../types/feed';
import type { MarketPulse } from '../types/marketPulse';

// 第 6.1 節；getFeed、getMarketPulse 為市場總覽新增（2026-10-18 經確認）
export interface DataSource {
  listReports(): Promise<ReportIndex>;
  getReport(reportId: string): Promise<Report>;
  getFeed(): Promise<Feed>;
  getMarketPulse(): Promise<MarketPulse>;
}

/**
 * network、not_found、invalid_format、server：第 6.1 節。
 * config_error：config.json 設定不完整（階段 4 經確認新增），不觸發離線備援。
 */
export type DataSourceErrorKind = 'network' | 'not_found' | 'invalid_format' | 'server' | 'config_error';

export class DataSourceError extends Error {
  readonly kind: DataSourceErrorKind;
  /** 給使用者看的補充細節（例如哪個欄位不合格、後端回傳的 message）；可為 null */
  readonly detail: string | null;
  /** HTTP 狀態碼；非 HTTP 錯誤為 null */
  readonly status: number | null;

  constructor(kind: DataSourceErrorKind, detail: string | null = null, status: number | null = null) {
    super(detail ? `${kind}: ${detail}` : kind);
    this.name = 'DataSourceError';
    this.kind = kind;
    this.detail = detail;
    this.status = status;
  }
}

/** 讀取 api-contract 第 1 節的錯誤格式 { error: { code, message } }；不是此格式時回傳 null */
async function readErrorMessage(res: Response): Promise<string | null> {
  try {
    const body = (await res.json()) as { error?: { message?: unknown } };
    return typeof body?.error?.message === 'string' ? body.error.message : null;
  } catch {
    return null;
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
  if (!res.ok) {
    const message = await readErrorMessage(res);
    if (res.status === 404) throw new DataSourceError('not_found', message ?? url, 404);
    // 400 等其他 4xx 也歸為 server，但帶 status，備援只對 5xx 觸發
    throw new DataSourceError('server', message ?? `HTTP ${res.status}`, res.status);
  }
  // 本機開發伺服器（vite dev／preview）對不存在的檔案會回傳首頁 HTML 而非 404；資料端點不會回傳 HTML，視為不存在
  if (res.headers.get('content-type')?.includes('text/html')) throw new DataSourceError('not_found', url, 404);

  const text = await res.text();
  try {
    return JSON.parse(text) as unknown;
  } catch (e) {
    throw new DataSourceError('invalid_format', e instanceof Error ? e.message : null);
  }
}

/** 第 6.3 節：只有 network 與 5xx 的 server 錯誤會改讀靜態檔 */
export function shouldFallback(e: unknown): boolean {
  if (!(e instanceof DataSourceError)) return false;
  if (e.kind === 'network') return true;
  return e.kind === 'server' && (e.status === null || e.status >= 500);
}
