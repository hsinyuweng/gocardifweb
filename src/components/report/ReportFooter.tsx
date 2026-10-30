import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';

/** F 區頁尾：disclaimer 原文 */
export function ReportFooter({ disclaimer }: { disclaimer: string | null }) {
  return (
    <footer className="break-inside-avoid border-t border-line pt-3 text-xs text-muted">
      <h2 className="font-medium text-ink2">{zhTW.report.disclaimerTitle}</h2>
      <p className="mt-1">{orDash(disclaimer)}</p>
    </footer>
  );
}
