import { useCallback, useEffect, useState } from 'react';

export type LoadState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; data: T }
  | { status: 'error'; error: unknown };

/**
 * 有頁面需要時才讀取一次（例如動態清單、市場脈動）。
 * loader 改變（設定改變）時重新讀取；loader 請用 useCallback 包住。
 */
export function useOnDemand<T>(loader: () => Promise<T>): [LoadState<T>, () => void] {
  const [requested, setRequested] = useState(false);
  const [state, setState] = useState<LoadState<T>>({ status: 'idle' });

  useEffect(() => {
    if (!requested) return;
    let alive = true;
    setState({ status: 'loading' });
    loader()
      .then((data) => alive && setState({ status: 'ok', data }))
      .catch((error: unknown) => alive && setState({ status: 'error', error }));
    return () => {
      alive = false;
    };
  }, [requested, loader]);

  const request = useCallback(() => setRequested(true), []);
  return [state, request];
}
