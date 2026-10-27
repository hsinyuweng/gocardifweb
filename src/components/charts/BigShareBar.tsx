// 一條大橫條，每段寫名稱與數字（純 CSS）。段太窄時文字自動截斷，滑鼠移上去看完整內容。

export interface BigShareSegment {
  key: string;
  /** 段內文字，例如「品牌公關 23」 */
  label: string;
  value: number;
  /** 完整說明（滑鼠提示） */
  title: string;
}

// 代表色由深到淡；第 5 段以後用框線色
const SEGMENT_CLASS = ['bg-p-mid text-ink', 'bg-p-pale text-ink', 'bg-p-faint text-ink2', 'bg-line text-ink2'];

export function BigShareBar({ segments, ariaLabel }: { segments: BigShareSegment[]; ariaLabel: string }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total <= 0) return null;
  return (
    <div role="img" aria-label={ariaLabel} className="flex h-[30px] w-full gap-[3px]">
      {segments.map((s, i) => (
        <div
          key={s.key}
          title={s.title}
          style={{ flexGrow: s.value, flexBasis: 0 }}
          className={`flex min-w-1 items-center overflow-hidden rounded-[7px] px-2.5 text-xs whitespace-nowrap ${
            SEGMENT_CLASS[Math.min(i, SEGMENT_CLASS.length - 1)]
          }`}
        >
          <span className="truncate">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
