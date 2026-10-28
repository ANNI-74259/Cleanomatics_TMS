import { Link } from 'react-router-dom';
import { Inbox } from 'lucide-react';
import Button from './Button';

// Shown when there is nothing to display.
// Give "actionTo" for a link button, or "onAction" for a normal button.
export default function EmptyState({ title, text, actionLabel, actionTo, onAction }) {
  return (
    <div className="state-box">
      <Inbox size={40} />
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn btn--primary">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}
