import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { loadConfig, type AppConfig } from './appConfig';

const ConfigContext = createContext<AppConfig | null>(null);

/** 啟動時讀一次 config；讀取完成前不渲染子元件 */
export function ConfigProvider({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    let alive = true;
    loadConfig().then((c) => {
      if (alive) setConfig(c);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (config === null) return <>{fallback}</>;
  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

export function useConfig(): AppConfig {
  const config = useContext(ConfigContext);
  if (config === null) throw new Error('useConfig 必須在 ConfigProvider 內使用');
  return config;
}
