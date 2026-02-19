/**
 * ProductTable.jsx
 * ----------------
 * Product table with softer striping per refined spec.
 * Even: bg-card (#111827), Odd: bg-[#0F1A2E], hover: bg-[#162235]
 * Smaller muted checkboxes, gray action icons.
 */
import React, { useState } from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from './ui/table';

const ProductTable = ({
  products = [],
  showForecast = false,
  onView,
  onEdit,
  onDelete,
  pagination = {},
  currentPage = 1,
  onPageChange,
}) => {
  const [selectedRows, setSelectedRows] = useState([]);

  const handleSelectAll = (e) => {
    setSelectedRows(e.target.checked ? products.map((p) => p.id) : []);
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const allSelected = products.length > 0 && selectedRows.length === products.length;

  const totalItems = pagination.count || products.length;
  const pageSize = 10;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

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
    <div className="flex flex-col flex-1 min-h-0 px-8">
      <div className="flex-1 overflow-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="w-12">
                <input type="checkbox" checked={allSelected} onChange={handleSelectAll} className="w-3.5 h-3.5 accent-accent cursor-pointer rounded border-border" />
              </TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Product Category</TableHead>
              <TableHead>Cost Price</TableHead>
              <TableHead>Selling Price</TableHead>
              <TableHead className="min-w-[220px]">Description</TableHead>
              <TableHead>Available Stock</TableHead>
              <TableHead>Units Sold</TableHead>
              {showForecast && <TableHead>Calculated Demand</TableHead>}
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showForecast ? 10 : 9} className="text-center text-muted py-16">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product, idx) => (
                <TableRow
                  key={product.id}
                  className={
                    selectedRows.includes(product.id)
                      ? 'bg-accent/5'
                      : idx % 2 === 0
                        ? 'bg-card'
                        : 'bg-[#0F1A2E]'
                  }
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(product.id)}
                      onChange={() => handleSelectRow(product.id)}
                      className="w-3.5 h-3.5 accent-accent cursor-pointer rounded border-border"
                    />
                  </TableCell>
                  <TableCell className="text-[#E5E7EB] font-medium">{product.name}</TableCell>
                  <TableCell className="text-[#9CA3AF]">{product.category}</TableCell>
                  <TableCell className="text-[#E5E7EB]">$ {product.cost_price}</TableCell>
                  <TableCell className="text-[#E5E7EB]">$ {product.selling_price}</TableCell>
                  <TableCell className="text-[#9CA3AF] max-w-[280px]">
                    <span className="block whitespace-normal line-clamp-2">{product.description || '-'}</span>
                  </TableCell>
                  <TableCell className="text-[#E5E7EB]">{Number(product.stock_available).toLocaleString()}</TableCell>
                  <TableCell className="text-[#E5E7EB]">{Number(product.units_sold).toLocaleString()}</TableCell>
                  {showForecast && (
                    <TableCell className="font-semibold text-accent">{product.demand_forecast || '-'}</TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => onView(product)} title="View" className="text-[#6B7280] hover:text-[#E5E7EB] transition-all duration-200"><Eye size={16} /></button>
                      <button onClick={() => onEdit(product)} title="Edit" className="text-[#6B7280] hover:text-[#E5E7EB] transition-all duration-200"><Pencil size={16} /></button>
                      <button onClick={() => onDelete(product.id)} title="Delete" className="text-red-500 hover:text-red-400 transition-all duration-200"><Trash2 size={16} /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between py-4 shrink-0">
          <span className="text-[#9CA3AF] text-sm">Showing {startItem}–{endItem} of {totalItems}</span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>Prev</Button>
            {getPageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={`d-${i}`} className="px-2 text-muted text-sm">…</span>
              ) : (
                <Button key={p} size="sm" variant={p === currentPage ? 'primary' : 'outline'} onClick={() => onPageChange(p)} className="w-8 h-8">{p}</Button>
              )
            )}
            <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
