'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div
      className={`pagination-container ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '0.75rem 0',
      }}
    >
      {totalItems !== undefined && pageSize !== undefined && (
        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          Hiển thị {(currentPage - 1) * pageSize + 1} -{' '}
          {Math.min(currentPage * pageSize, totalItems)} trong {totalItems} kết quả
        </span>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginLeft: 'auto' }}>
        {/* Nút Previous */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: currentPage <= 1 ? 'var(--color-text-light)' : 'var(--color-text)',
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            transition: 'background var(--transition-fast)',
          }}
          title="Trang trước"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Các số trang */}
        {pages.map((p, index) => {
          if (p === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.875rem',
                }}
              >
                ...
              </span>
            );
          }

          const pageNum = Number(p);
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-surface)',
                color: isActive ? 'var(--color-text-inverse)' : 'var(--color-text)',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Nút Next */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: currentPage >= totalPages ? 'var(--color-text-light)' : 'var(--color-text)',
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            transition: 'background var(--transition-fast)',
          }}
          title="Trang sau"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
