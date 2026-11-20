import { ChevronIcon } from './Icons.jsx';

export default function Pagination({ page, totalPages, total, limit, onPage }) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <nav className="pagination" aria-label="Pagination">
      <span className="muted small">Showing {from}–{to} of {total}</span>
      <div className="pager">
        <button type="button" className="icon-btn" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <ChevronIcon dir="left" />
        </button>
        <span className="small">Page {page} of {totalPages}</span>
        <button type="button" className="icon-btn" onClick={() => onPage(page + 1)} disabled={page >= totalPages} aria-label="Next page">
          <ChevronIcon dir="right" />
        </button>
      </div>
    </nav>
  );
}
