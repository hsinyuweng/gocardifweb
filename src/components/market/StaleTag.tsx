import { zhTW } from '../../i18n/zh-TW';

/** 後端標 stale 的指標：標題旁的淡色標籤「資料較舊」 */
export function StaleTag() {
  return (
    <span className="ml-2 inline-block rounded-md bg-line px-1.5 py-0.5 align-middle text-xs font-normal text-muted">
      {zhTW.market.stale}
    </span>
  );
}
