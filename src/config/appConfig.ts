// 執行期設定（第 6.3 節）：啟動時讀取 public/config.json，失敗時使用預設值。

export interface AppConfig {
  dataSource: 'static' | 'api';
  apiBaseUrl: string;
  fallbackToStatic: boolean;
  showRoadmapNav: boolean;
}

export const DEFAULT_CONFIG: AppConfig = {
  dataSource: 'static',
  apiBaseUrl: '',
  fallbackToStatic: true,
  showRoadmapNav: true,
};

/** 逐欄檢查型別；型別不符的欄位使用預設值 */
function mergeConfig(raw: unknown): AppConfig {
  if (typeof raw !== 'object' || raw === null) return DEFAULT_CONFIG;
  const r = raw as Record<string, unknown>;
  return {
    dataSource: r.dataSource === 'api' || r.dataSource === 'static' ? r.dataSource : DEFAULT_CONFIG.dataSource,
    apiBaseUrl: typeof r.apiBaseUrl === 'string' ? r.apiBaseUrl : DEFAULT_CONFIG.apiBaseUrl,
    fallbackToStatic:
      typeof r.fallbackToStatic === 'boolean' ? r.fallbackToStatic : DEFAULT_CONFIG.fallbackToStatic,
    showRoadmapNav: typeof r.showRoadmapNav === 'boolean' ? r.showRoadmapNav : DEFAULT_CONFIG.showRoadmapNav,
  };
}

export async function loadConfig(): Promise<AppConfig> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}config.json`, { cache: 'no-store' });
    if (!res.ok) return DEFAULT_CONFIG;
    return mergeConfig(await res.json());
  } catch {
    return DEFAULT_CONFIG;
  }
}
