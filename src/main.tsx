import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router';
import './index.css';
import { ConfigProvider } from './config/ConfigContext';
import { zhTW } from './i18n/zh-TW';
import { RootLayout } from './pages/RootLayout';
import { OverviewPage } from './pages/OverviewPage';
import { ReportPage } from './pages/ReportPage';
import { GuidePage } from './pages/GuidePage';
import { NotFoundPage } from './pages/NotFoundPage';

// 路由（第 11.1 節）：新增頁面時只新增路由與頁面檔
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider fallback={<p className="p-6 text-slate-500">{zhTW.common.loading}</p>}>
      <HashRouter>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="report/:reportId" element={<ReportPage />} />
            <Route path="guide" element={<GuidePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </ConfigProvider>
  </StrictMode>,
);
