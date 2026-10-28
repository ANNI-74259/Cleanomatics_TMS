import Button from '../ui/Button';

// Previous / Next buttons for the list view (server-side pagination).
export default function Pagination({ page, totalPages, onChange }) {
  return (
    <nav className="pagination" aria-label="Pagination">
      <Button variant="ghost" onClick={() => onChange(page - 1)} disabled={page <= 1}>
        Previous
      </Button>
      <span>
        Page {page} of {totalPages}
      </span>
      <Button variant="ghost" onClick={() => onChange(page + 1)} disabled={page >= totalPages}>
        Next
      </Button>
    </nav>
  );
}
