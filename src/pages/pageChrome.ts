import { createContext, useContext, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import type { BreadcrumbItem, TopBarNotice } from '../components/layout/TopBar';
import type { ReportIndex } from '../types/reportIndex';
import { DataSourceError, type AllReportsResult } from '../data';
import type { FeedViewModel, MarketPulseViewModel } from '../types/viewModel';
import type { LoadState } from './useOnDemand';
import { zhTW } from '../i18n/zh-TW';

// 頁面與 RootLayout 之間的小型共用狀態：麵包屑、頂部列提示、報告清單讀取結果

export interface PageChromeSetters {
  setBreadcrumb: (items: BreadcrumbItem[]) => void;
  setPageNotices: (notices: TopBarNotice[]) => void;
  /** 頂部列右側的頁面動作區（例如報告頁的加入追蹤清單）；頁面以 createPortal 放入 */
  actionSlot: HTMLElement | null;
}

export const PageChromeContext = createContext<PageChromeSetters>({
  setBreadcrumb: () => {},
  setPageNotices: () => {},
  actionSlot: null,
});

/** 頂部列右側的頁面動作區；尚未掛上時為 null */
export function usePageActionSlot(): HTMLElement | null {
  return useContext(PageChromeContext).actionSlot;
}

/** 頁面呼叫此 hook 設定頂部列麵包屑 */
export function useBreadcrumb(items: BreadcrumbItem[]) {
  const { setBreadcrumb } = useContext(PageChromeContext);
  const key = JSON.stringify(items);
  useEffect(() => {
    setBreadcrumb(JSON.parse(key) as BreadcrumbItem[]);
  }, [key, setBreadcrumb]);
}

/** 頁面呼叫此 hook 設定頂部列狀態提示；離開頁面時清除 */
export function usePageNotices(notices: TopBarNotice[]) {
  const { setPageNotices } = useContext(PageChromeContext);
  const key = JSON.stringify(notices);
  useEffect(() => {
    setPageNotices(JSON.parse(key) as TopBarNotice[]);
    return () => setPageNotices([]);
  }, [key, setPageNotices]);
}

export type IndexState =
  | { status: 'loading' }
  | { status: 'ok'; index: ReportIndex }
  | { status: 'error'; error: unknown };

/** 全部報告（我的待辦、我的單位選項）：有頁面或導覽列需要時才讀取 */
export type AllReportsState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; result: AllReportsResult }
  | { status: 'error'; error: unknown };

export interface LayoutOutletContext {
  indexState: IndexState;
  allReportsState: AllReportsState;
  requestAllReports: () => void;
  feedState: LoadState<FeedViewModel>;
  requestFeed: () => void;
  pulseState: LoadState<MarketPulseViewModel>;
  requestPulse: () => void;
}

export function useIndexState(): IndexState {
  return useOutletContext<LayoutOutletContext>().indexState;
}

/** 取得動態清單；第一次呼叫時開始讀取 */
export function useFeed(): LoadState<FeedViewModel> {
  const { feedState, requestFeed } = useOutletContext<LayoutOutletContext>();
  useEffect(() => requestFeed(), [requestFeed]);
  return feedState;
}

/** 取得市場脈動；第一次呼叫時開始讀取 */
export function useMarketPulse(): LoadState<MarketPulseViewModel> {
  const { pulseState, requestPulse } = useOutletContext<LayoutOutletContext>();
  useEffect(() => requestPulse(), [requestPulse]);
  return pulseState;
}

/** 取得全部報告；第一次呼叫時開始讀取 */
export function useAllReports(): AllReportsState {
  const { allReportsState, requestAllReports } = useOutletContext<LayoutOutletContext>();
  useEffect(() => requestAllReports(), [requestAllReports]);
  return allReportsState;
}

/** DataSourceError → 給使用者看的訊息（第 0 節第 9 點） */
export function errorText(err: unknown, notFoundMessage: string): { message: string; detail: string | null } {
  const e = zhTW.errors;
  if (err instanceof DataSourceError) {
    switch (err.kind) {
      case 'network':
        return { message: e.network, detail: null };
      case 'not_found':
        return { message: notFoundMessage, detail: null };
      case 'invalid_format':
        return { message: e.invalidFormat, detail: err.detail };
      case 'server':
        // 4xx（非 404）為請求錯誤，其餘為伺服器錯誤；detail 為後端回傳的 message
        return {
          message: err.status !== null && err.status < 500 ? e.badRequest : e.server,
          detail: err.detail,
        };
      case 'config_error':
        return { message: e.configError, detail: null };
    }
  }
  return { message: e.invalidFormat, detail: err instanceof Error ? err.message : null };
}
