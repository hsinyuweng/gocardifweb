import { createContext, useContext, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import type { BreadcrumbItem } from '../components/layout/TopBar';
import type { ReportIndex } from '../types/reportIndex';
import { DataSourceError } from '../data';
import { zhTW } from '../i18n/zh-TW';

// 頁面與 RootLayout 之間的小型共用狀態：麵包屑、報告清單讀取結果

export const BreadcrumbContext = createContext<(items: BreadcrumbItem[]) => void>(() => {});

/** 頁面呼叫此 hook 設定頂部列麵包屑 */
export function useBreadcrumb(items: BreadcrumbItem[]) {
  const setBreadcrumb = useContext(BreadcrumbContext);
  const key = JSON.stringify(items);
  useEffect(() => {
    setBreadcrumb(JSON.parse(key) as BreadcrumbItem[]);
  }, [key, setBreadcrumb]);
}

export type IndexState =
  | { status: 'loading' }
  | { status: 'ok'; index: ReportIndex }
  | { status: 'error'; error: unknown };

export interface LayoutOutletContext {
  indexState: IndexState;
}

export function useIndexState(): IndexState {
  return useOutletContext<LayoutOutletContext>().indexState;
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
        return { message: e.server, detail: err.detail };
    }
  }
  return { message: e.invalidFormat, detail: err instanceof Error ? err.message : null };
}
