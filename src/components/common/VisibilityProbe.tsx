import { useEffect, useRef, type ReactNode } from 'react';

/** 頂部列高度：被它蓋住也算看不到 */
const TOP_BAR = 56;

/**
 * 包住一段內容，回報它是否在畫面內（2026-10-31：報告頁頁首的加入追蹤大按鈕捲出畫面後，頂部列才出現小按鈕）。
 * 不支援 IntersectionObserver 的環境一律回報「看得到」。
 */
export function VisibilityProbe({ onChange, children }: { onChange: (visible: boolean) => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const cb = useRef(onChange);
  cb.current = onChange;
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => cb.current(entry?.isIntersecting ?? true), {
      rootMargin: `-${TOP_BAR}px 0px 0px 0px`,
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cb.current(true);
    };
  }, []);
  return <div ref={ref}>{children}</div>;
}
