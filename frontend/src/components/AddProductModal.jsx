/**
 * AddProductModal.jsx
 * -------------------
 * Add/Edit product modal per spec — uses shadcn Dialog.
 * Grid layout for price and stock fields, full-width textarea.
 * Buttons: Cancel (outline) + Add (primary).
 */
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

const INITIAL_FORM = {
  name: '',
  category: '',
  cost_price: '',
  selling_price: '',
  description: '',
  stock_available: '',
  units_sold: '',
};

const AddProductModal = ({ isOpen, onClose, onSubmit, editingProduct = null }) => {
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name || '',
        category: editingProduct.category || '',
        cost_price: editingProduct.cost_price || '',
        selling_price: editingProduct.selling_price || '',
        description: editingProduct.description || '',
        stock_available: editingProduct.stock_available || '',
        units_sold: editingProduct.units_sold || '',
      });
    } else {
      setForm(INITIAL_FORM);
    }
  }, [editingProduct, isOpen]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.cost_price || !form.selling_price) return;
    onSubmit(form);
  };

  const isEditing = !!editingProduct;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Products'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">Product Name</label>
            <Input name="name" placeholder="Enter Product Name" value={form.name} onChange={handleChange} required />
          </div>

          {/* Product Category */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">Product Category</label>
            <Input name="category" placeholder="Enter Product Category" value={form.category} onChange={handleChange} required />
          </div>

          {/* Cost + Selling side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">Cost Price</label>
              <Input name="cost_price" type="number" step="0.01" placeholder="xx,xxx,xxx" value={form.cost_price} onChange={handleChange} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">Selling Price</label>
              <Input name="selling_price" type="number" step="0.01" placeholder="xx,xxx,xxx" value={form.selling_price} onChange={handleChange} required />
            </div>
          </div>

          {/* Description — full width */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">Description</label>
            <Textarea name="description" placeholder="Enter Description" value={form.description} onChange={handleChange} rows={4} />
          </div>

          {/* Stock + Units side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">Available Stock</label>
              <Input name="stock_available" type="number" placeholder="xx,xxx,xxx" value={form.stock_available} onChange={handleChange} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white">Units Sold</label>
              <Input name="units_sold" type="number" placeholder="xx,xxx,xxx" value={form.units_sold} onChange={handleChange} />
            </div>
          </div>

          {/* Actions */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary">{isEditing ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
