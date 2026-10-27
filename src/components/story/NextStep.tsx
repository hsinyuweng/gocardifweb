import { Link } from 'react-router';
import { zhTW } from '../../i18n/zh-TW';

export interface NextStepLink {
  to: string;
  label: string;
  state?: unknown;
}

interface NextStepProps {
  /** 同頁細節：「往下看：… ↓」，只捲動、不改網址 */
  down?: { label: string; targetId: string };
  links: NextStepLink[];
  /** 右側一行說明（例如缺什麼資料） */
  note?: string | null;
}

const pill = 'rounded-full border border-p-pale bg-p-faint px-3 py-0.5 text-ink hover:border-p';

/** 閱讀路徑 ⑤「下一步」：白底細框條，同頁細節＋相關分頁的連結 */
export function NextStep({ down, links, note }: NextStepProps) {
  return (
    <nav
      aria-label={zhTW.market.nextStep}
      className="flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-xl border border-p-pale bg-white px-[18px] py-3 text-[13.5px] text-ink2"
    >
      <span className="mr-1 font-medium text-ink">{zhTW.market.nextStep}</span>
      {down ? (
        <button
          type="button"
          onClick={() => document.getElementById(down.targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className={`${pill} border-dashed`}
        >
          {down.label}
        </button>
      ) : null}
      {links.map((l) => (
        <Link key={l.to} to={l.to} state={l.state} className={pill}>
          {l.label}
        </Link>
      ))}
      {note ? <span className="text-[12.5px] text-muted md:ml-auto">{note}</span> : null}
    </nav>
  );
}
