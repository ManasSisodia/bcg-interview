/**
 * App.jsx
 * -------
 * Root — login → landing → products | optimization
 *
 * SOLID: component/service per concern
 * KISS: string page state
 * DRY: centralized services, reusable shadcn primitives
 *
 * Premium SaaS style: soft dark, consistent spacing, no harsh contrasts.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';

import authService from './services/authService';
import productService from './services/productService';

import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';
import { Navbar, PageHeaderBar, ActionBar } from './components/Layout';
import ProductTable from './components/ProductTable';
import AddProductModal from './components/AddProductModal';
import DemandForecastModal from './components/DemandForecastModal';

import { Button } from './components/ui/button';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from './components/ui/table';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState('login');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const searchTimeout = useRef(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [showForecastModal, setShowForecastModal] = useState(false);
  const [showForecastColumn, setShowForecastColumn] = useState(false);
  const [priceFilter, setPriceFilter] = useState({ min_price: '', max_price: '' });

  useEffect(() => {
    if (authService.isAuthenticated()) {
      setCurrentUser(authService.getUser());
      setPage('landing');
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    if (!authService.isAuthenticated()) return;
    setLoading(true);
    try {
      const data = await productService.getProducts({
        page: currentPageNum,
        search: searchQuery,
        category: categoryFilter,
        min_price: priceFilter.min_price,
        max_price: priceFilter.max_price,
      });
      setProducts(data.results);
      setPagination({ count: data.count, next: data.next, previous: data.previous });
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPageNum, searchQuery, categoryFilter, priceFilter]);

  useEffect(() => {
    if (page === 'products' || page === 'optimization') fetchProducts();
  }, [fetchProducts, page]);

  const fetchCategories = useCallback(async () => {
    if (!authService.isAuthenticated()) return;
    try {
      const cats = await productService.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  useEffect(() => {
    if (page === 'products') fetchCategories();
  }, [fetchCategories, page]);

  const handleLoginSuccess = (user) => { setCurrentUser(user); setPage('landing'); };
  const handleLogout = () => { authService.logout(); setCurrentUser(null); setProducts([]); setPage('login'); };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => { setSearchQuery(value); setCurrentPageNum(1); }, 500);
  };

  const handleCategoryChange = (e) => { setCategoryFilter(e.target.value); setCurrentPageNum(1); };

  const handleAddProduct = async (formData) => {
    try { await productService.createProduct(formData); setShowAddModal(false); fetchProducts(); fetchCategories(); }
    catch (err) { alert(err.response?.data ? JSON.stringify(err.response.data) : 'Failed to add product'); }
  };

  const handleEditProduct = async (formData) => {
    try { await productService.updateProduct(editingProduct.id, formData); setEditingProduct(null); setShowAddModal(false); fetchProducts(); fetchCategories(); }
    catch (err) { alert(err.response?.data ? JSON.stringify(err.response.data) : 'Failed to update'); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try { await productService.deleteProduct(id); fetchProducts(); fetchCategories(); }
    catch (err) { alert('Failed to delete product'); }
  };

  const handleOpenEdit = (product) => { setEditingProduct(product); setShowAddModal(true); };
  const handleCloseModal = () => { setShowAddModal(false); setEditingProduct(null); };

  if (page === 'login') return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  if (page === 'landing') return <LandingPage onNavigate={setPage} />;

  const userName = currentUser?.username || 'Guest';

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navbar userName={userName} pageTitle={page === 'products' ? 'Products' : 'Optimization'} onLogout={handleLogout} />

      <PageHeaderBar
        title={page === 'products' ? 'Create and Manage Product' : 'Pricing Optimization'}
        onBack={() => setPage('landing')}
      />

      {page === 'products' && (
        <ActionBar
          showForecast={showForecastColumn}
          onToggleForecast={() => setShowForecastColumn(!showForecastColumn)}
          onSearchChange={handleSearchChange}
          categoryValue={categoryFilter}
          onCategoryChange={handleCategoryChange}
          categories={categories}
          onAddProduct={() => { setEditingProduct(null); setShowAddModal(true); }}
          onDemandForecast={() => setShowForecastModal(true)}
          onFilterApply={(f) => { setPriceFilter(f); setCurrentPageNum(1); }}
          onFilterClear={() => { setPriceFilter({ min_price: '', max_price: '' }); setCurrentPageNum(1); }}
          activeFilterCount={(priceFilter.min_price ? 1 : 0) + (priceFilter.max_price ? 1 : 0)}
        />
      )}

      <main className="flex-1 flex flex-col min-h-0">
        {loading ? (
          <div className="flex-1 flex items-center justify-center"><div className="spinner" /></div>
        ) : page === 'products' ? (
          <ProductTable
            products={products}
            showForecast={showForecastColumn}
            onView={(p) => setViewingProduct(p)}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteProduct}
            pagination={pagination}
            currentPage={currentPageNum}
            onPageChange={setCurrentPageNum}
          />
        ) : (
          <div className="flex-1 overflow-auto px-8">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead>Product Name</TableHead>
                    <TableHead>Product Category</TableHead>
                    <TableHead className="min-w-[220px]">Description</TableHead>
                    <TableHead>Cost Price</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Optimized Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p, idx) => (
                    <TableRow key={p.id} className={idx % 2 === 0 ? 'bg-card' : 'bg-[#0F1A2E]'}>
                      <TableCell className="text-[#E5E7EB] font-medium">{p.name}</TableCell>
                      <TableCell className="text-[#9CA3AF]">{p.category}</TableCell>
                      <TableCell className="text-[#9CA3AF] max-w-[280px]">
                        <span className="block whitespace-normal line-clamp-2">{p.description || '-'}</span>
                      </TableCell>
                      <TableCell className="text-[#E5E7EB]">$ {p.cost_price}</TableCell>
                      <TableCell className="text-[#E5E7EB]">$ {p.selling_price}</TableCell>
                      <TableCell className="font-semibold text-accent">$ {(p.selling_price * 0.95).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </main>



      <AddProductModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
        editingProduct={editingProduct}
      />

      <DemandForecastModal
        isOpen={showForecastModal}
        onClose={() => setShowForecastModal(false)}
        products={products}
      />

      {viewingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setViewingProduct(null)}>
          <div className="bg-card rounded-xl w-full max-w-md border border-border shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-[#E5E7EB]">Product Details</h3>
              <button onClick={() => setViewingProduct(null)} className="text-muted hover:text-[#E5E7EB] transition-all duration-200"><X size={18} /></button>
            </div>
            <div className="px-6 py-6 space-y-3">
              {[
                ['Name', viewingProduct.name],
                ['Category', viewingProduct.category],
                ['Cost Price', `$ ${viewingProduct.cost_price}`],
                ['Selling Price', `$ ${viewingProduct.selling_price}`],
                ['Description', viewingProduct.description || '-'],
                ['Available Stock', Number(viewingProduct.stock_available).toLocaleString()],
                ['Units Sold', Number(viewingProduct.units_sold).toLocaleString()],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="text-[#9CA3AF] text-sm w-28 shrink-0">{label}:</span>
                  <span className="text-[#E5E7EB] text-sm">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
