import { zhTW } from '../../i18n/zh-TW';

const t = zhTW.report.flow;

/**
 * A 區流程（第 11.3 節 A；2026-10-27 V4 縮成商品名下方一行小字）：
 * 「✓ 資料蒐集完成 · ✓ 三面向分析 3／3 完成 · ✓ 統整建議完成 · 部門審查 規劃中」
 */
export function FlowBar({ provided, total }: { provided: number; total: number }) {
  const steps = [
    { label: t.collect, status: t.done, done: true },
    { label: t.analysis, status: t.analysisProgress(provided, total), done: provided === total },
    { label: t.synthesis, status: t.done, done: true },
    { label: t.review, status: zhTW.common.roadmap, done: false, planned: true },
  ];
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">
      {steps.map((s, i) => (
        <li key={s.label} className="inline-flex items-center gap-1">
          {i > 0 ? <span aria-hidden className="mr-1 text-line">·</span> : null}
          {s.done ? (
            <span aria-hidden className="text-p">
              ✓
            </span>
          ) : null}
          <span className={s.planned ? '' : 'text-ink2'}>{s.label}</span>
          <span>{s.status}</span>
        </li>
      ))}
    </ol>
  );
}
