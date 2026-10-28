import { statusLabel } from '../../utils/constants';

export default function StatusBadge({ status }) {
  return <span className={`badge badge--${status}`}>{statusLabel(status)}</span>;
}
