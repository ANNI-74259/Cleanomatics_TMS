import Modal from '../ui/Modal';
import Button from '../ui/Button';

// "Are you sure?" popup shown before a task is deleted.
export default function ConfirmDeleteModal({ task, busy, onConfirm, onCancel }) {
  return (
    <Modal title="Delete this task?" onClose={onCancel}>
      <p>
        "{task.title}" will be removed permanently. This cannot be undone.
      </p>
      <div className="modal__actions">
        <Button variant="ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={busy}>
          {busy ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </Modal>
  );
}
