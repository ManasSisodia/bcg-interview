/**
 * App.jsx
 * -------
 * Root — login → landing → products | optimization
 *
 * Features:
 * - React Router (HashRouter) for /products and /optimization
 * - Demand forecast: disabled until products selected, shows only for selected
 * - Chart.js bar chart on optimization page
 * - Role-based UI
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip as ChartTooltip, Legend,
} from 'chart.js';

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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

/* ─── Inner App (needs router context) ─── */
function AppInner() {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState('login'); // login | landing | products | optimization
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

  // Selection tracking — accumulate full product objects across pages
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [selectedProductsMap, setSelectedProductsMap] = useState({});

  // Products with computed demand forecast + optimized price (calculated on click)
  const [forecastedProducts, setForecastedProducts] = useState([]);

  // RBAC
  const userRole = currentUser?.role || 'admin';
  const canCreate = userRole === 'admin' || userRole === 'supplier';
  const canEdit = userRole === 'admin' || userRole === 'supplier';
  const canDelete = userRole === 'admin';

  // Sync page state with router path
  useEffect(() => {
    const hash = location.pathname;
    if (hash === '/products' && page !== 'products') setPage('products');
    else if (hash === '/optimization' && page !== 'optimization') setPage('optimization');
  }, [location.pathname]);

  const navigateTo = (target) => {
    setPage(target);
    if (target === 'products') navigate('/products');
    else if (target === 'optimization') navigate('/optimization');
  };

  useEffect(() => {
    if (authService.isAuthenticated()) {
      setCurrentUser(authService.getUser());
      const hash = location.pathname;
      if (hash === '/products') setPage('products');
      else if (hash === '/optimization') setPage('optimization');
      else setPage('landing');
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
    if (page === 'products' || page === 'optimization') fetchCategories();
  }, [fetchCategories, page]);

  const handleLoginSuccess = (user) => { setCurrentUser(user); setPage('landing'); };
  const handleLogout = () => { authService.logout(); setCurrentUser(null); setProducts([]); setPage('login'); navigate('/'); };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => { setSearchQuery(value); setCurrentPageNum(1); }, 500);
  };

  const handleCategoryChange = (e) => { setCategoryFilter(e.target.value); setCurrentPageNum(1); };

  const handleAddProduct = async (formData) => {
    try { await productService.createProduct(formData); setShowAddModal(false); fetchProducts(); fetchCategories(); toast.success('Product added successfully'); }
    catch (err) { toast.error(err.response?.data?.detail || err.response?.data ? JSON.stringify(err.response.data) : 'Failed to add product'); }
  };

  const handleEditProduct = async (formData) => {
    try { await productService.updateProduct(editingProduct.id, formData); setEditingProduct(null); setShowAddModal(false); fetchProducts(); fetchCategories(); toast.success('Product updated successfully'); }
    catch (err) { toast.error(err.response?.data?.detail || 'Failed to update product'); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try { await productService.deleteProduct(id); fetchProducts(); fetchCategories(); toast.success('Product deleted'); }
    catch (err) { toast.error(err.response?.data?.detail || 'Failed to delete product'); }
  };

  const handleOpenEdit = (product) => { setEditingProduct(product); setShowAddModal(true); };
  const handleCloseModal = () => { setShowAddModal(false); setEditingProduct(null); };

  // When ProductTable fires onSelectionChange, merge into our cross-page map
  const handleSelectionChange = useCallback((ids) => {
    setSelectedProductIds(ids);
    setSelectedProductsMap((prev) => {
      const next = { ...prev };
      // Add newly selected products from current page
      ids.forEach((id) => {
        if (!next[id]) {
          const p = products.find((prod) => prod.id === id);
          if (p) next[id] = p;
        }
      });
      // Remove deselected products that are on the current page
      const currentPageIds = products.map((p) => p.id);
      currentPageIds.forEach((id) => {
        if (!ids.includes(id)) delete next[id];
      });
      return next;
    });
  }, [products]);

  // All selected products across all pages
  const allSelectedProducts = Object.values(selectedProductsMap);

  // ── Demand Forecast: compute values, save to DB, refresh table ──
  const handleDemandForecast = async () => {
    if (allSelectedProducts.length === 0) return;
    const computed = allSelectedProducts.map((p) => {
      const unitsSold = parseFloat(p.units_sold) || 0;
      const stock = parseFloat(p.stock_available) || 0;
      const cost = parseFloat(p.cost_price) || 0;
      const sell = parseFloat(p.selling_price) || 0;
      // Formula: demand_forecast = units_sold × 1.2 + stock_available × 0.1
      const demandForecast = Math.round(unitsSold * 1.2 + stock * 0.1);
      // Formula: optimized_price = cost + (sell - cost) × demand / (demand + stock)
      const optimizedPrice = stock + demandForecast > 0
        ? parseFloat((cost + (sell - cost) * (demandForecast / (demandForecast + stock))).toFixed(2))
        : parseFloat(sell.toFixed(2));
      return { ...p, demand_forecast: demandForecast, optimized_price: optimizedPrice };
    });

    // Save to database
    try {
      await productService.bulkForecast(
        computed.map((p) => ({ id: p.id, demand_forecast: p.demand_forecast, optimized_price: p.optimized_price }))
      );
    } catch (err) {
      toast.error('Failed to save forecast to database');
    }

    setForecastedProducts(computed);
    setShowForecastModal(true);
    toast.success(`Demand forecast calculated for ${computed.length} product(s)`);
    // Refresh table so DB values show up
    fetchProducts();
  };

  if (page === 'login') return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  if (page === 'landing') return <LandingPage onNavigate={navigateTo} />;

  const userName = currentUser?.username || 'Guest';
  const pageTitles = { products: 'Products', optimization: 'Optimization' };
  const headerTitles = { products: 'Create and Manage Product', optimization: 'Pricing Optimization' };

  /* ── Optimization chart data ── */
  const optimizationChartData = {
    labels: products.map((p) => p.name?.length > 18 ? p.name.slice(0, 15) + '...' : p.name),
    datasets: [
      { label: 'Cost Price', data: products.map((p) => parseFloat(p.cost_price) || 0), backgroundColor: 'rgba(107, 114, 128, 0.7)', borderColor: '#6B7280', borderWidth: 1, borderRadius: 4 },
      { label: 'Selling Price', data: products.map((p) => parseFloat(p.selling_price) || 0), backgroundColor: 'rgba(139, 92, 246, 0.7)', borderColor: '#8B5CF6', borderWidth: 1, borderRadius: 4 },
      { label: 'Optimized Price', data: products.map((p) => parseFloat(p.optimized_price) || 0), backgroundColor: 'rgba(20, 184, 166, 0.7)', borderColor: '#14B8A6', borderWidth: 1, borderRadius: 4 },
    ],
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#9CA3AF', font: { size: 12 }, usePointStyle: true, pointStyle: 'circle', padding: 20 } },
      tooltip: { backgroundColor: '#1F2937', titleColor: '#E5E7EB', bodyColor: '#E5E7EB', borderColor: '#243041', borderWidth: 1, cornerRadius: 8, padding: 12, callbacks: { label: (ctx) => `${ctx.dataset.label}: $${ctx.raw.toFixed(2)}` } },
    },
    scales: {
      x: { ticks: { color: '#9CA3AF', font: { size: 10 }, maxRotation: 45 }, grid: { color: '#243041', drawBorder: false } },
      y: { ticks: { color: '#9CA3AF', font: { size: 11 }, callback: (v) => `$${v}` }, grid: { color: '#243041', drawBorder: false } },
    },
  };

  /* ── Shared action bar for both pages ── */
  const renderActionBar = () => (
    <ActionBar
      showForecast={showForecastColumn}
      onToggleForecast={() => setShowForecastColumn(!showForecastColumn)}
      onSearchChange={handleSearchChange}
      categoryValue={categoryFilter}
      onCategoryChange={handleCategoryChange}
      categories={categories}
      onAddProduct={canCreate ? () => { setEditingProduct(null); setShowAddModal(true); } : undefined}
      onDemandForecast={handleDemandForecast}
      disableDemandForecast={Object.keys(selectedProductsMap).length === 0}
      onFilterApply={(f) => { setPriceFilter(f); setCurrentPageNum(1); }}
      onFilterClear={() => { setPriceFilter({ min_price: '', max_price: '' }); setCurrentPageNum(1); }}
      activeFilterCount={(priceFilter.min_price ? 1 : 0) + (priceFilter.max_price ? 1 : 0)}
      canCreate={canCreate}
      isOptimizationPage={page === 'optimization'}
    />
  );

  /* ── Products Page ── */
  const renderProductsPage = () => (
    <>
      {renderActionBar()}
      <main className="flex-1 flex flex-col min-h-0">
        {loading ? (
          <div className="flex-1 flex items-center justify-center"><div className="spinner" /></div>
        ) : (
          <ProductTable
            products={products}
            showForecast={showForecastColumn}
            onView={(p) => setViewingProduct(p)}
            onEdit={canEdit ? handleOpenEdit : undefined}
            onDelete={canDelete ? handleDeleteProduct : undefined}
            pagination={pagination}
            currentPage={currentPageNum}
            onPageChange={setCurrentPageNum}
            canEdit={canEdit}
            canDelete={canDelete}
            onSelectionChange={handleSelectionChange}
            initialSelectedRows={selectedProductIds}
          />
        )}
      </main>
    </>
  );

  /* ── Optimization Page — only shows forecasted products ── */
  const renderOptimizationPage = () => {
    // Use frontend-computed forecasts if available, otherwise fall back to DB data
    const optimProducts = forecastedProducts.length > 0
      ? forecastedProducts
      : products.filter((p) => parseFloat(p.demand_forecast) > 0);
    return (
      <>
        {renderActionBar()}
        <main className="flex-1 flex flex-col min-h-0 overflow-auto">
          {optimProducts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted gap-3">
              <span className="text-lg">No forecasted products yet</span>
              <span className="text-sm text-[#6B7280]">Go to Products page → select products → click Demand Forecast</span>
            </div>
          ) : (
            <div className="px-8 space-y-6 pb-8">
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead>Product Name</TableHead>
                      <TableHead>Product Category</TableHead>
                      <TableHead className="min-w-[220px]">Description</TableHead>
                      <TableHead>Cost Price</TableHead>
                      <TableHead>Selling Price</TableHead>
                      {showForecastColumn && <TableHead>Demand Forecast</TableHead>}
                      <TableHead>Optimized Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {optimProducts.map((p, idx) => (
                      <TableRow key={p.id} className={idx % 2 === 0 ? 'bg-card' : 'bg-[#0F1A2E]'}>
                        <TableCell className="text-[#E5E7EB] font-medium">{p.name}</TableCell>
                        <TableCell className="text-[#9CA3AF]">{p.category}</TableCell>
                        <TableCell className="text-[#9CA3AF] max-w-[280px]">
                          <span className="block whitespace-normal line-clamp-2">{p.description || '-'}</span>
                        </TableCell>
                        <TableCell className="text-[#9CA3AF]">$ {p.cost_price}</TableCell>
                        <TableCell className="text-[#E5E7EB]">$ {p.selling_price}</TableCell>
                        {showForecastColumn && (
                          <TableCell className="text-[#E5E7EB] font-medium">{p.demand_forecast}</TableCell>
                        )}
                        <TableCell>
                          <span className="font-semibold text-accent">$ {p.optimized_price}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </main>
      </>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navbar userName={userName} pageTitle={pageTitles[page] || ''} onLogout={handleLogout} />
      <PageHeaderBar title={headerTitles[page] || ''} onBack={() => { setPage('landing'); navigate('/'); }} />

      <Routes>
        <Route path="/products" element={renderProductsPage()} />
        <Route path="/optimization" element={renderOptimizationPage()} />
        <Route path="*" element={renderProductsPage()} />
      </Routes>

      {/* Modals */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
        editingProduct={editingProduct}
      />

      <DemandForecastModal
        isOpen={showForecastModal}
        onClose={() => setShowForecastModal(false)}
        products={forecastedProducts.length > 0 ? forecastedProducts : []}
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
                ['Optimized Price', `$ ${viewingProduct.optimized_price}`],
                ['Demand Forecast', viewingProduct.demand_forecast],
                ['Customer Rating', `${viewingProduct.customer_rating} / 5`],
                ['Description', viewingProduct.description || '-'],
                ['Available Stock', Number(viewingProduct.stock_available).toLocaleString()],
                ['Units Sold', Number(viewingProduct.units_sold).toLocaleString()],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="text-[#9CA3AF] text-sm w-32 shrink-0">{label}:</span>
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

/* ─── Root: wraps in HashRouter ─── */
export default function App() {
  return (
    <HashRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { background: '#1F2937', color: '#E5E7EB', border: '1px solid #243041', borderRadius: '10px', fontSize: '14px' },
          success: { iconTheme: { primary: '#14B8A6', secondary: '#E5E7EB' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#E5E7EB' } },
        }}
      />
      <AppInner />
    </HashRouter>
  );
}
