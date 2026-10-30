import type { FeedItemViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';

/** [新聞]／[法規] 小標籤（灰藍，不用燈號色） */
export function FeedKindTag({ kind }: { kind: FeedItemViewModel['kind'] }) {
  return (
    <span className="shrink-0 whitespace-nowrap rounded-md bg-line px-2 py-0.5 text-xs font-medium text-p-ink ring-1 ring-line">
      {kind === 'regulation' ? zhTW.home.regulationTag : zhTW.home.newsTag}
    </span>
  );
}
