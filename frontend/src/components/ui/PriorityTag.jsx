import { priorityLabel } from '../../utils/constants';

export default function PriorityTag({ priority }) {
  return <span className={`tag tag--${priority}`}>{priorityLabel(priority)}</span>;
}
