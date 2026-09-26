import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startCount = (page - 1) * limit + 1;
  const endCount = Math.min(page * limit, total);

  return (
    <section className="pagination-bar" aria-label="Pagination Navigation">
      <div>
        Showing <strong>{startCount}</strong> to{' '}
        <strong>{endCount}</strong> of{' '}
        <strong>{total}</strong> leads
      </div>

      <div className="pagination-controls">
        <button
          className="page-number-btn"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pNum => (
          <button
            key={pNum}
            className={`page-number-btn ${page === pNum ? 'active' : ''}`}
            onClick={() => onPageChange(pNum)}
          >
            {pNum}
          </button>
        ))}

        <button
          className="page-number-btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next Page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
}
