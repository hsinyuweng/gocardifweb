import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Outlet } from 'react-router';
import { AppShell } from '../components/layout/AppShell';
import type { BreadcrumbItem, TopBarNotice } from '../components/layout/TopBar';
import { useConfig } from '../config/ConfigContext';
import { getDataSource, isOffline, normalizeAppMeta, subscribeConnection } from '../data';
import { zhTW } from '../i18n/zh-TW';
import { PageChromeContext, type IndexState, type LayoutOutletContext } from './pageChrome';

/** 共用版面：讀取報告清單一次，提供給導覽列（更新時間、資料來源）與各頁面 */
export function RootLayout() {
  const config = useConfig();
  const [indexState, setIndexState] = useState<IndexState>({ status: 'loading' });
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([]);
  const [pageNotices, setPageNotices] = useState<TopBarNotice[]>([]);
  // api 模式改讀離線資料時為 true（第 6.3 節）
  const offline = useSyncExternalStore(subscribeConnection, isOffline);

  useEffect(() => {
    let alive = true;
    getDataSource(config)
      .listReports()
      .then((index) => alive && setIndexState({ status: 'ok', index }))
      .catch((error: unknown) => alive && setIndexState({ status: 'error', error }));
    return () => {
      alive = false;
    };
  }, [config]);

  const meta = useMemo(
    () => normalizeAppMeta(indexState.status === 'ok' ? indexState.index : null, config, offline),
    [indexState, config, offline],
  );
  const notices = useMemo<TopBarNotice[]>(
    () => (offline ? [{ tone: 'warning', text: zhTW.offlineNotice }, ...pageNotices] : pageNotices),
    [offline, pageNotices],
  );
  const chrome = useMemo(() => ({ setBreadcrumb, setPageNotices }), []);
  const outletContext: LayoutOutletContext = { indexState };

  return (
    <PageChromeContext.Provider value={chrome}>
      <AppShell meta={meta} showRoadmapNav={config.showRoadmapNav} breadcrumb={breadcrumb} notices={notices}>
        <Outlet context={outletContext} />
      </AppShell>
    </PageChromeContext.Provider>
  );
}
