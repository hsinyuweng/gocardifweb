import { zhTW } from '../../i18n/zh-TW';

const t = zhTW.report.nav;

interface ReportNavProps {
  /** 返回的頁面名稱，例如「競品研究」 */
  backLabel: string;
  onBack: () => void;
  /** 上一份／下一份；沒有時按鈕停用。position 為 null 時不顯示切換 */
  position: { index: number; total: number } | null;
  onPrev: (() => void) | null;
  onNext: (() => void) | null;
}

const btn =
  'inline-flex h-8 items-center gap-1 rounded-full border border-line bg-white px-3.5 text-[13.5px] text-ink transition-colors hover:border-p disabled:cursor-default disabled:text-muted disabled:hover:border-line';

/**
 * 報告頁最上方（2026-10-27 V3）：左「← 回競品研究」（依來源改字），右「‹ 上一份 3 / 9 下一份 ›」（照清單順序）。
 * 清單與報告頁頻繁切換用；列印時不顯示。
 */
export function ReportNav({ backLabel, onBack, position, onPrev, onNext }: ReportNavProps) {
  return (
    <nav aria-label={t.label} className="flex flex-wrap items-center justify-between gap-2 print:hidden">
      <button type="button" onClick={onBack} className={`${btn} font-medium`}>
        {t.back(backLabel)}
      </button>
      {position ? (
        <div className="flex items-center gap-2">
          <button type="button" onClick={onPrev ?? undefined} disabled={!onPrev} className={btn}>
            {t.prev}
          </button>
          <span className="text-xs text-muted tabular-nums">{t.position(position.index, position.total)}</span>
          <button type="button" onClick={onNext ?? undefined} disabled={!onNext} className={btn}>
            {t.next}
          </button>
        </div>
      ) : null}
    </nav>
  );
}
