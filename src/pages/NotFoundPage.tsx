import { Link } from 'react-router';
import { StatusMessage } from '../components/common/StatusMessage';
import { zhTW } from '../i18n/zh-TW';
import { useBreadcrumb } from './pageChrome';

export function NotFoundPage() {
  useBreadcrumb([{ label: zhTW.placeholder.notFound }]);
  return (
    <StatusMessage tone="info" message={zhTW.placeholder.notFound}>
      <Link to="/" className="text-p-ink underline hover:text-p-ink">
        {zhTW.common.backToHome}
      </Link>
    </StatusMessage>
  );
}
