import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TaskForm from '../components/tasks/TaskForm';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import { useToast } from '../components/ui/Toast';
import { useTaskStats } from '../context/TaskStatsContext';
import { getTask, updateTask } from '../api/taskApi';

export default function EditTaskPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { refreshStats } = useTaskStats();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const handleSubmit = async (payload) => {
    await updateTask(id, payload);
    showToast('Task updated');
    refreshStats();
    navigate('/');
  };

  let content;
  if (loading) {
    content = <div className="center"><Spinner /></div>;
  } else if (error) {
    content = <ErrorState message={error} onRetry={loadTask} />;
  } else {
    content = (
      <TaskForm
        initialValues={task}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
        onCancel={() => navigate('/')}
      />
    );
  }

  return (
    <>
      <Link to="/" className="back-link">
        <ArrowLeft size={18} /> Back to board
      </Link>
      <section className="card form-card">
        <h1 className="card__title" style={{ marginBottom: 20 }}>Edit Task</h1>
        {content}
      </section>
    </>
  );
}
