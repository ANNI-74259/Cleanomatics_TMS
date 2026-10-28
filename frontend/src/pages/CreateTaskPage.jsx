import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TaskForm from '../components/tasks/TaskForm';
import { useToast } from '../components/ui/Toast';
import { useTaskStats } from '../context/TaskStatsContext';
import { createTask } from '../api/taskApi';
import { STATUSES } from '../utils/constants';

export default function CreateTaskPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { refreshStats } = useTaskStats();

  // The "+" on a column opens this page with ?status=... already chosen
  const requestedStatus = searchParams.get('status');
  const status = STATUSES.some((s) => s.value === requestedStatus) ? requestedStatus : 'pending';

  // TaskForm shows the error if this throws
  const handleSubmit = async (payload) => {
    await createTask(payload);
    showToast('Task created');
    refreshStats();
    navigate('/');
  };

  return (
    <>
      <Link to="/" className="back-link">
        <ArrowLeft size={18} /> Back to board
      </Link>
      <section className="card form-card">
        <h1 className="card__title" style={{ marginBottom: 20 }}>New Task</h1>
        <TaskForm
          initialValues={{ status }}
          onSubmit={handleSubmit}
          submitLabel="Create task"
          onCancel={() => navigate('/')}
        />
      </section>
    </>
  );
}
