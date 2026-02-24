import React from 'react';
import { Button } from './ui/button';

export const TablePagination = ({ pagination, currentPage, onPageChange, dataLength }) => {
  const totalItems = pagination?.count || dataLength || 0;
  const pageSize = 10;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between py-4 shrink-0 px-2">
      <span className="text-[#9CA3AF] text-sm">
        Showing {startItem}–{endItem} of {totalItems}
      </span>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
          Prev
        </Button>
        {getPageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`d-${i}`} className="px-2 text-muted text-sm">…</span>
          ) : (
            <Button
              key={p}
              size="sm"
              variant={p === currentPage ? 'primary' : 'outline'}
              onClick={() => onPageChange(p)}
              className="w-8 h-8"
            >
              {p}
            </Button>
          )
        )}
        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default TablePagination;
