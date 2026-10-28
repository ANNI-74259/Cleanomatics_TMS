import { DragDropContext } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';
import { STATUSES } from '../../utils/constants';

// The 3 columns. onDragEnd runs when a card is dropped.
export default function KanbanBoard({ tasks, onDragEnd, onDelete }) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="board">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status.value}
            status={status}
            tasks={tasks.filter((task) => task.status === status.value)}
            onDelete={onDelete}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
