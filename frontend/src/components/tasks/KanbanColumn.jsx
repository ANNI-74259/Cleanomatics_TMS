import { Link } from 'react-router-dom';
import { Droppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import KanbanCard from './KanbanCard';
import useMediaQuery from '../../hooks/useMediaQuery';

// One column (Pending / In Progress / Completed). Cards can be dropped here.
export default function KanbanColumn({ status, tasks, onDelete }) {
  // On phones the cards sit in one horizontal row, so the drag library must know the direction
  const isMobile = useMediaQuery('(max-width: 699px)');

  return (
    <div className="column">
      <div className="column__head">
        <span className={`status-dot status-dot--${status.value}`} />
        <h3 className="column__name">{status.label}</h3>
        <span className="column__count">{tasks.length}</span>
        <Link
          to={`/tasks/new?status=${status.value}`}
          className="icon-btn icon-btn--sm"
          aria-label={`Add task to ${status.label}`}
          title="Add task"
        >
          <Plus size={18} />
        </Link>
      </div>

      <Droppable droppableId={status.value} direction={isMobile ? 'horizontal' : 'vertical'}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`column__body${snapshot.isDraggingOver ? ' is-over' : ''}`}
          >
            {tasks.map((task, index) => (
              <KanbanCard key={task.id} task={task} index={index} onDelete={onDelete} />
            ))}
            {provided.placeholder}

            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="empty-card">
                <span>No tasks here yet</span>
                <Link to={`/tasks/new?status=${status.value}`} className="btn btn--ghost">
                  <Plus size={16} /> Add New Task
                </Link>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
