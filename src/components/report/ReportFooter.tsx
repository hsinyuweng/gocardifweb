import { zhTW } from '../../i18n/zh-TW';
import { orDash } from '../../lib/format';

/** F 區頁尾：disclaimer 原文 */
export function ReportFooter({ disclaimer }: { disclaimer: string | null }) {
  return (
    <footer className="break-inside-avoid border-t border-slate-200 pt-3 text-xs text-slate-500">
      <h2 className="font-medium text-slate-600">{zhTW.report.disclaimerTitle}</h2>
      <p className="mt-1">{orDash(disclaimer)}</p>
    </footer>
  );
}
