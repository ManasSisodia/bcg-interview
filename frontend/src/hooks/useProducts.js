import { useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import productService from '../services/productService';

/**
 * Hook to manage all product fetching, filtering, pagination, and CRUD logic.
 */
export const useProducts = ({ isOptimized = false } = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null });
  const [currentPageNum, setCurrentPageNum] = useState(1);
  
  // Search and Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState({ min_price: '', max_price: '' });
  const [categories, setCategories] = useState([]);
  
  const searchTimeout = useRef(null);

  // --- Data Fetching ---
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        page: currentPageNum,
        search: searchQuery,
        category: categoryFilter,
        is_optimized: isOptimized ? 'true' : '',
        ...priceFilter,
      };
      const data = await productService.getProducts(filters);
      setProducts(data.results);
      setPagination({ count: data.count, next: data.next, previous: data.previous });
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [currentPageNum, searchQuery, categoryFilter, priceFilter, isOptimized]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await productService.getCategories();
      let uniqueCats = [];
      if (Array.isArray(data.results)) {
        uniqueCats = [...new Set(data.results.map((p) => p.category).filter(Boolean))];
      }
      setCategories(uniqueCats.sort());
    } catch (err) {
      // Non-critical, fail silently regarding toast
    }
  }, []);

  // --- Event Handlers ---
  const handleSearchChange = useCallback((e) => {
    const val = e.target.value;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearchQuery(val);
      setCurrentPageNum(1); // Reset to page 1 on new search
    }, 500);
  }, []);

  const handleCategoryChange = useCallback((val) => {
    setCategoryFilter(val === 'all' ? '' : val);
    setCurrentPageNum(1);
  }, []);

  // --- CRUD Handlers ---
  const handleAddProduct = async (formData) => {
    try {
      await productService.createProduct(formData);
      toast.success('Product added successfully!');
      fetchProducts();
      return true; // Success flag for UI to close modal
    } catch (err) {
      toast.error('Failed to add product. Please check your inputs.');
      return false;
    }
  };

  const handleEditProduct = async (id, formData) => {
    try {
      await productService.updateProduct(id, formData);
      toast.success('Product updated successfully!');
      fetchProducts();
      return true;
    } catch (err) {
      toast.error('Failed to update product');
      return false;
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.deleteProduct(id);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  return {
    products,
    setProducts,
    loading,
    pagination,
    currentPageNum,
    setCurrentPageNum,
    searchQuery,
    categoryFilter,
    priceFilter,
    setPriceFilter,
    categories,
    fetchProducts,
    fetchCategories,
    handleSearchChange,
    handleCategoryChange,
    handleAddProduct,
    handleEditProduct,
    handleDeleteProduct,
  };
};
