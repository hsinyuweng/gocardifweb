import { useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router';
import { AppShell } from '../components/layout/AppShell';
import type { BreadcrumbItem } from '../components/layout/TopBar';
import { useConfig } from '../config/ConfigContext';
import { getDataSource, normalizeAppMeta } from '../data';
import { BreadcrumbContext, type IndexState, type LayoutOutletContext } from './pageChrome';

/** 共用版面：讀取報告清單一次，提供給導覽列（更新時間）與各頁面 */
export function RootLayout() {
  const config = useConfig();
  const [indexState, setIndexState] = useState<IndexState>({ status: 'loading' });
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([]);

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
    () => normalizeAppMeta(indexState.status === 'ok' ? indexState.index : null, config),
    [indexState, config],
  );
  const outletContext: LayoutOutletContext = { indexState };

  return (
    <BreadcrumbContext.Provider value={setBreadcrumb}>
      <AppShell meta={meta} showRoadmapNav={config.showRoadmapNav} breadcrumb={breadcrumb} notices={[]}>
        <Outlet context={outletContext} />
      </AppShell>
    </BreadcrumbContext.Provider>
  );
}
