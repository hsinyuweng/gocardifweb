import type { SignalText } from '../../types/viewModel';
import { DOT_CLASS } from '../../lib/signalColor';
import { orDash } from '../../lib/format';

/** 燈號標籤：一律「色點＋文字」（第 9.2 節） */
export function SignalLabel({ signal }: { signal: SignalText }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span aria-hidden className={`inline-block size-2 shrink-0 rounded-full ${DOT_CLASS[signal.color]}`} />
      <span>{orDash(signal.text)}</span>
    </span>
  );
}
