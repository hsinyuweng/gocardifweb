import type { SourceRefViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';

/** 來源：名稱（有網址時是新分頁連結）＋「 · 資料日期 …」 */
export function SourceRefText({ source }: { source: SourceRefViewModel }) {
  const name = orDash(source.name ?? source.url);
  return (
    <>
      {source.url ? (
        <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-navy-700 hover:underline">
          {name}
        </a>
      ) : (
        name
      )}
      {source.asOf ? zhTW.report.details.asOf(source.asOf) : null}
    </>
  );
}
