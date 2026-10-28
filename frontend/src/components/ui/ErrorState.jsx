import { AlertTriangle } from 'lucide-react';
import Button from './Button';

// Shown when a request fails. The Retry button runs onRetry.
export default function ErrorState({ message, onRetry }) {
  return (
    <div className="state-box" role="alert">
      <AlertTriangle size={40} />
      <h3>Something went wrong</h3>
      <p>{message}</p>
      {onRetry && <Button onClick={onRetry}>Retry</Button>}
    </div>
  );
}
