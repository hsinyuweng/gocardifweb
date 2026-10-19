import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router';
import './index.css';
import { ConfigProvider } from './config/ConfigContext';
import { zhTW } from './i18n/zh-TW';
import { RootLayout } from './pages/RootLayout';
import { MarketHomePage } from './pages/MarketHomePage';
import { OverviewPage } from './pages/OverviewPage';
import { ReportPage } from './pages/ReportPage';
import { TasksPage } from './pages/TasksPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { NewsPage } from './pages/NewsPage';
import { GuidePage } from './pages/GuidePage';
import { NotFoundPage } from './pages/NotFoundPage';

/** 舊網址 #/cases 轉到 #/research，保留篩選；replace 讓上一頁不會再被轉回來 */
function CasesRedirect() {
  const location = useLocation();
  return <Navigate to={{ pathname: '/research', search: location.search }} state={location.state} replace />;
}

// 路由（第 11.1 節）
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider fallback={<p className="p-6 text-slate-500">{zhTW.common.loading}</p>}>
      <HashRouter>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<MarketHomePage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="watchlist" element={<WatchlistPage />} />
            <Route path="research" element={<OverviewPage />} />
            <Route path="cases" element={<CasesRedirect />} />
            <Route path="report/:reportId" element={<ReportPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="guide" element={<GuidePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </ConfigProvider>
  </StrictMode>,
);
