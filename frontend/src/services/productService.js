/**
 * services/productService.js
 * --------------------------
 * Handles all product-related API calls.
 *
 * Methods:
 *   getProducts({ page, search, category })  — paginated list
 *   getProduct(id)                            — single product
 *   createProduct(data)                       — POST
 *   updateProduct(id, data)                   — PUT
 *   deleteProduct(id)                         — DELETE
 *   getCategories()                           — unique category list
 */
import api from './api';

const productService = {
  /**
   * Fetch paginated product list with optional search & category filter.
   * @param {Object} params — { page, search, category }
   * @returns {{ results: Array, count: number, next: string|null, previous: string|null }}
   */
  async getProducts({ page = 1, search = '', category = '', min_price = '', max_price = '' } = {}) {
    const params = new URLSearchParams();
    params.set('page', page);
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (min_price) params.set('min_price', min_price);
    if (max_price) params.set('max_price', max_price);

    const response = await api.get(`/products/?${params.toString()}`);
    const data = response.data;

    // Handle both paginated and non-paginated responses
    if (data.results) {
      return {
        results: data.results,
        count: data.count,
        next: data.next,
        previous: data.previous,
      };
    }
    return {
      results: Array.isArray(data) ? data : [],
      count: 0,
      next: null,
      previous: null,
    };
  },

  /**
   * Fetch a single product by ID.
   */
  async getProduct(id) {
    const response = await api.get(`/products/${id}/`);
    return response.data;
  },

  /**
   * Create a new product.
   */
  async createProduct(data) {
    const response = await api.post('/products/', data);
    return response.data;
  },

  /**
   * Update an existing product.
   */
  async updateProduct(id, data) {
    const response = await api.put(`/products/${id}/`, data);
    return response.data;
  },

  /**
   * Delete a product.
   */
  async deleteProduct(id) {
    await api.delete(`/products/${id}/`);
  },

  /**
   * Get unique category list from all products.
   */
  async getCategories() {
    const response = await api.get('/products/?page_size=100');
    const data = response.data;
    const products = data.results || data || [];
    return [...new Set(products.map((p) => p.category).filter(Boolean))];
  },

  /**
   * Bulk-update demand_forecast and optimized_price for multiple products.
   * @param {Array} products — [{ id, demand_forecast, optimized_price }, ...]
   */
  async bulkForecast(products) {
    const response = await api.post('/products/bulk-forecast/', { products });
    return response.data;
  },
};

export default productService;
