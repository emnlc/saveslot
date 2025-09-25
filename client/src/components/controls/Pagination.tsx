interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  delta?: number;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  delta = 1,
}: PaginationProps) => {
  const getPaginationRange = (current: number, total: number) => {
    const range: (number | string)[] = [];

    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= current - delta && i <= current + delta)
      ) {
        range.push(i);
      } else if (range[range.length - 1] !== "...") {
        range.push("...");
      }
    }

    return range;
  };

  const paginationRange = getPaginationRange(currentPage, totalPages);

  return (
    <div className="join mt-8 flex justify-center items-center gap-1">
      {/* Previous button */}
      <button
        className="btn btn-sm md:btn-md"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &lt;
      </button>

      {/* Page numbers */}
      {paginationRange.map((pageNum, i) =>
        pageNum === "..." ? (
          <span key={`ellipsis-${i}`} className="text-base-content/60 px-4">
            ...
          </span>
        ) : (
          <button
            key={pageNum}
            className={`btn btn-sm md:btn-md ${currentPage === pageNum ? "btn-active text-primary" : ""}`}
            onClick={() => onPageChange(pageNum as number)}
          >
            {pageNum}
          </button>
        )
      )}

      {/* Next button */}
      <button
        className="btn btn-sm md:btn-md"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        &gt;
      </button>
    </div>
  );
};

export default Pagination;
