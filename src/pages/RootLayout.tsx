import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Outlet } from 'react-router';
import { AppShell } from '../components/layout/AppShell';
import type { BreadcrumbItem, TopBarNotice } from '../components/layout/TopBar';
import { useConfig } from '../config/ConfigContext';
import {
  getDataSource,
  isOffline,
  loadAllReports,
  normalizeAppMeta,
  normalizeFeed,
  normalizeMarketPulse,
  subscribeConnection,
} from '../data';
import { zhTW } from '../i18n/zh-TW';
import { readOwnerPreference, subscribeOwnerPreference, writeOwnerPreference } from '../lib/ownerPreference';
import { countOwners } from '../lib/tasks';
import { useOnDemand } from './useOnDemand';
import { PageChromeContext, type AllReportsState, type IndexState, type LayoutOutletContext } from './pageChrome';

/** 共用版面：讀取報告清單一次，提供給導覽列（更新時間、資料來源）與各頁面 */
export function RootLayout() {
  const config = useConfig();
  const [indexState, setIndexState] = useState<IndexState>({ status: 'loading' });
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([]);
  const [pageNotices, setPageNotices] = useState<TopBarNotice[]>([]);
  // 頂部列的頁面動作區：掛上後才讓頁面放入內容
  const [actionSlot, setActionSlot] = useState<HTMLElement | null>(null);
  // api 模式改讀離線資料時為 true（第 6.3 節）
  const offline = useSyncExternalStore(subscribeConnection, isOffline);
  const myUnit = useSyncExternalStore(subscribeOwnerPreference, readOwnerPreference);
  // 全部報告只在需要時讀取一次（我的待辦、設定我的單位）
  const [allRequested, setAllRequested] = useState(false);
  const [allReportsState, setAllReportsState] = useState<AllReportsState>({ status: 'idle' });

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

  useEffect(() => {
    if (!allRequested) return;
    if (indexState.status === 'error') {
      setAllReportsState({ status: 'error', error: indexState.error });
      return;
    }
    if (indexState.status !== 'ok') return;
    let alive = true;
    setAllReportsState({ status: 'loading' });
    loadAllReports(getDataSource(config), indexState.index)
      .then((result) => alive && setAllReportsState({ status: 'ok', result }))
      .catch((error: unknown) => alive && setAllReportsState({ status: 'error', error }));
    return () => {
      alive = false;
    };
  }, [allRequested, indexState, config]);

  const requestAllReports = useCallback(() => setAllRequested(true), []);

  // 市場總覽資料（動態清單、市場脈動）：有頁面需要時才讀取
  const loadFeed = useCallback(async () => normalizeFeed(await getDataSource(config).getFeed()), [config]);
  const loadPulse = useCallback(
    async () => normalizeMarketPulse(await getDataSource(config).getMarketPulse()),
    [config],
  );
  const [feedState, requestFeed] = useOnDemand(loadFeed);
  const [pulseState, requestPulse] = useOnDemand(loadPulse);

  const meta = useMemo(
    () => normalizeAppMeta(indexState.status === 'ok' ? indexState.index : null, config, offline),
    [indexState, config, offline],
  );
  const notices = useMemo<TopBarNotice[]>(
    () => (offline ? [{ tone: 'warning', text: zhTW.offlineNotice }, ...pageNotices] : pageNotices),
    [offline, pageNotices],
  );
  const unitOptions = useMemo(
    () => (allReportsState.status === 'ok' ? countOwners(allReportsState.result.reports).map((c) => c.owner) : null),
    [allReportsState],
  );
  const chrome = useMemo(() => ({ setBreadcrumb, setPageNotices, actionSlot }), [actionSlot]);
  const outletContext: LayoutOutletContext = {
    indexState,
    allReportsState,
    requestAllReports,
    feedState,
    requestFeed,
    pulseState,
    requestPulse,
  };

  return (
    <PageChromeContext.Provider value={chrome}>
      <AppShell
        meta={meta}
        showRoadmapNav={config.showRoadmapNav}
        breadcrumb={breadcrumb}
        notices={notices}
        myUnit={{
          value: myUnit,
          options: unitOptions,
          onRequestOptions: requestAllReports,
          onChange: writeOwnerPreference,
        }}
        actionSlotRef={setActionSlot}
      >
        <Outlet context={outletContext} />
      </AppShell>
    </PageChromeContext.Provider>
  );
}
