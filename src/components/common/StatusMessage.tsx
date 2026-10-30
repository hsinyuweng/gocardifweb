import type { ReactNode } from 'react';

interface StatusMessageProps {
  tone: 'info' | 'error';
  message: string;
  /** 小字補充（例如格式錯誤的細節） */
  detail?: string | null;
  children?: ReactNode;
}

/** 載入中、錯誤、空狀態共用的訊息區塊 */
export function StatusMessage({ tone, message, detail, children }: StatusMessageProps) {
  const toneClass =
    tone === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-line bg-white text-ink2';
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-md border px-4 py-3 ${toneClass}`}>
      <p>{message}</p>
      {detail ? <p className="mt-1 text-xs opacity-80">{detail}</p> : null}
      {children ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}
