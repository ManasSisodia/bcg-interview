/**
 * ProductTable.jsx
 * ----------------
 * Product table with softer striping per refined spec.
 * Even: bg-card (#111827), Odd: bg-[#0F1A2E], hover: bg-[#162235]
 * Smaller muted checkboxes, gray action icons.
 */
import React, { useState, useEffect } from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from './ui/table';
import TablePagination from './TablePagination';

const ProductTable = ({
  products = [],
  showForecast = false,
  onView,
  onEdit,
  onDelete,
  pagination = {},
  currentPage = 1,
  onPageChange,
  canEdit = true,
  canDelete = true,
  onSelectionChange,
  initialSelectedRows = [],
}) => {
  const [selectedRows, setSelectedRows] = useState(initialSelectedRows);

  // Notify parent when selection changes
  useEffect(() => {
    if (onSelectionChange) onSelectionChange(selectedRows);
  }, [selectedRows, onSelectionChange]);

  const handleSelectAll = (e) => {
    setSelectedRows(e.target.checked ? products.map((p) => p.id) : []);
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const allSelected = products.length > 0 && selectedRows.length === products.length;

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
                      <button onClick={() => onView(product)} title="View" className="text-muted hover:text-[#E5E7EB] transition-all duration-200"><Eye size={16} /></button>
                      {canEdit && <button onClick={() => onEdit(product)} title="Edit" className="text-muted hover:text-[#E5E7EB] transition-all duration-200"><Pencil size={16} /></button>}
                      {canDelete && <button onClick={() => onDelete(product.id)} title="Delete" className="text-red-500 hover:text-red-400 transition-all duration-200"><Trash2 size={16} /></button>}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination 
        pagination={pagination}
        currentPage={currentPage}
        onPageChange={onPageChange}
        dataLength={products.length}
      />
    </div>
  );
};

export default ProductTable;
