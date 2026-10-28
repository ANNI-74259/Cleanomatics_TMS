import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import PriorityTag from '../components/ui/PriorityTag';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import Button from '../components/ui/Button';
import ConfirmDeleteModal from '../components/tasks/ConfirmDeleteModal';
import { useToast } from '../components/ui/Toast';
import { useTaskStats } from '../context/TaskStatsContext';
import { getTask, deleteTask } from '../api/taskApi';
import { formatFullDate, formatDateTime } from '../utils/formatDate';

export default function TaskDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { refreshStats } = useTaskStats();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadTask = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setTask(await getTask(id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteTask(id);
      showToast('Task deleted');
      refreshStats();
      navigate('/');
    } catch (err) {
      showToast(err.message || 'Could not delete the task', 'error');
      setDeleting(false);
    }
  };

  let content;
  if (loading) {
    content = <div className="center"><Spinner /></div>;
  } else if (error) {
    content = <ErrorState message={error} onRetry={loadTask} />;
  } else {
    content = (
      <>
        <h1 className="card__title">{task.title}</h1>
        <div className="details__tags">
          <StatusBadge status={task.status} />
          <PriorityTag priority={task.priority} />
        </div>
        <p className="details__desc">{task.description}</p>

        <dl className="details__meta">
          <div>
            <dt>Due date</dt>
            <dd>{formatFullDate(task.dueDate)}</dd>
          </div>
          <div>
            <dt>Created</dt>
            <dd>{formatDateTime(task.createdAt)}</dd>
          </div>
          <div>
            <dt>Last updated</dt>
            <dd>{formatDateTime(task.updatedAt)}</dd>
          </div>
        </dl>

        <div className="form-actions">
          <Button variant="danger" onClick={() => setConfirming(true)}>
            <Trash2 size={16} /> Delete
          </Button>
          <Link to={`/tasks/${task.id}/edit`} className="btn btn--primary">
            <Pencil size={16} /> Edit
          </Link>
        </div>

        {confirming && (
          <ConfirmDeleteModal
            task={task}
            busy={deleting}
            onConfirm={confirmDelete}
            onCancel={() => setConfirming(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Link to="/" className="back-link">
        <ArrowLeft size={18} /> Back to board
      </Link>
      <section className="card form-card">{content}</section>
    </>
  );
}
