import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationProps } from './Pagination.types';
import styles from './Pagination.module.css';

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
  className = '',
  showInfo = true,
}) => {
  // Tự động ẩn thanh phân trang khi <= 1 trang hoặc tổng bản ghi <= kích thước trang
  if (totalPages <= 1 || (totalItems !== undefined && totalItems <= pageSize)) return null;

  const getPageNumbers = () => {
    const delta = 1;
    const range: number[] = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift(-1);
    }
    if (currentPage + delta < totalPages - 1) {
      range.push(-2);
    }

    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = totalItems ? Math.min(currentPage * pageSize, totalItems) : currentPage * pageSize;

  return (
    <div className={`${styles.container} ${className}`}>
      {showInfo && totalItems !== undefined && (
        <div className={styles.info}>
          Hiển thị từ <span className={styles.highlight}>{startItem}</span> đến{' '}
          <span className={styles.highlight}>{endItem}</span> trên tổng số{' '}
          <span className={styles.highlight}>{totalItems}</span> bản ghi
        </div>
      )}

      <ul className={styles.paginationList}>
        <li>
          <button
            type="button"
            className={styles.pageButton}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Trang trước"
          >
            <ChevronLeft size={16} />
          </button>
        </li>

        {getPageNumbers().map((pageNumber, idx) => {
          if (pageNumber < 0) {
            return (
              <li key={`ellipsis-${idx}`} className={styles.ellipsis}>
                …
              </li>
            );
          }

          const isActive = pageNumber === currentPage;
          return (
            <li key={pageNumber}>
              <button
                type="button"
                className={`${styles.pageButton} ${isActive ? styles.active : ''}`}
                onClick={() => onPageChange(pageNumber)}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            </li>
          );
        })}

        <li>
          <button
            type="button"
            className={styles.pageButton}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Trang sau"
          >
            <ChevronRight size={16} />
          </button>
        </li>
      </ul>
    </div>
  );
};
