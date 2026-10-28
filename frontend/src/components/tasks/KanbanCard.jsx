import { Link } from 'react-router-dom';
import { Draggable } from '@hello-pangea/dnd';
import { CalendarDays, Eye, Flame, Pencil, Trash2 } from 'lucide-react';
import PriorityTag from '../ui/PriorityTag';
import { formatShortDate } from '../../utils/formatDate';
import { isOverdue } from '../../utils/stats';

// One draggable task card inside a column.
// The outer div is controlled by the drag library, the inner div is what we style.
export default function KanbanCard({ task, index, onDelete }) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          <div className={`kcard${snapshot.isDragging ? ' is-dragging' : ''}`}>
            <div className="kcard__top">
              <PriorityTag priority={task.priority} />
              <span className={`chip${isOverdue(task) ? ' chip--danger' : ''}`}>
                <CalendarDays size={14} />
                {formatShortDate(task.dueDate)}
              </span>
              {task.priority === 'high' && <Flame size={18} className="flame" aria-label="High priority" />}
            </div>

            <h3 className="kcard__title">{task.title}</h3>
            <p className="kcard__desc clamp-2">{task.description}</p>

            <div className="kcard__footer">
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
          </div>
        </div>
      )}
    </Draggable>
  );
}
