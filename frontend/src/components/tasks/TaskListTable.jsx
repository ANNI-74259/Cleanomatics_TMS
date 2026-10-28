import { Link } from 'react-router-dom';
import { Eye, Flame, Pencil, Trash2 } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import PriorityTag from '../ui/PriorityTag';
import { formatShortDate } from '../../utils/formatDate';

// List view: a simple table with dotted row dividers.
export default function TaskListTable({ tasks, onDelete }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Deadline</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td className="task-name">
                <Link to={`/tasks/${task.id}`}>{task.title}</Link>{' '}
                {task.priority === 'high' && <Flame size={16} className="flame" aria-label="High priority" />}
              </td>
              <td><StatusBadge status={task.status} /></td>
              <td><PriorityTag priority={task.priority} /></td>
              <td>{formatShortDate(task.dueDate)}</td>
              <td>
                <div className="row-actions">
                  <Link to={`/tasks/${task.id}`} aria-label={`View ${task.title}`} title="View">
                    <Eye size={18} />
                  </Link>
                  <Link to={`/tasks/${task.id}/edit`} aria-label={`Edit ${task.title}`} title="Edit">
                    <Pencil size={18} />
                  </Link>
                  <button type="button" onClick={() => onDelete(task)} aria-label={`Delete ${task.title}`} title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
