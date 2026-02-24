import React, { useEffect, useState } from 'react';
import { ActionBar } from '../components/Layout';
import ProductTable from '../components/ProductTable';
import AddProductModal from '../components/AddProductModal';
import { ProductDetailsModal } from '../components/ProductDetailsModal';
import DemandForecastModal from '../components/DemandForecastModal';
import { useProducts } from '../hooks/useProducts';
import { useProductSelection } from '../hooks/useProductSelection';

export default function ProductsPage({ userRole }) {
  const {
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
  } = useProducts();

  const {
    selectedProductIds,
    selectedProductsMap,
    forecastedProducts,
    showForecastModal,
    setShowForecastModal,
    handleSelectionChange,
    handleDemandForecast,
  } = useProductSelection(products, fetchProducts, setProducts);

  // Local UI state
  const [showForecastColumn, setShowForecastColumn] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);

  // RBAC permissions
  const canCreate = userRole === 'admin' || userRole === 'supplier';
  const canEdit = userRole === 'admin' || userRole === 'supplier';
  const canDelete = userRole === 'admin';

  // Fetch data on mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const onAddSubmit = async (formData) => {
    const success = await handleAddProduct(formData);
    if (success) setShowAddModal(false);
  };

  const onEditSubmit = async (formData) => {
    const success = await handleEditProduct(editingProduct.id, formData);
    if (success) setShowAddModal(false);
  };

  return (
    <>
      <ActionBar
        showForecast={showForecastColumn}
        onToggleForecast={() => setShowForecastColumn(!showForecastColumn)}
        onSearchChange={handleSearchChange}
        categoryValue={categoryFilter}
        onCategoryChange={handleCategoryChange}
        categories={categories}
        onAddProduct={
          canCreate
            ? () => {
                setEditingProduct(null);
                setShowAddModal(true);
              }
            : undefined
        }
        onDemandForecast={handleDemandForecast}
        disableDemandForecast={Object.keys(selectedProductsMap).length === 0}
        onFilterApply={(f) => {
          setPriceFilter(f);
          setCurrentPageNum(1);
        }}
        onFilterClear={() => {
          setPriceFilter({ min_price: '', max_price: '' });
          setCurrentPageNum(1);
        }}
        activeFilterCount={(priceFilter.min_price ? 1 : 0) + (priceFilter.max_price ? 1 : 0)}
        canCreate={canCreate}
        isOptimizationPage={false}
      />

      <main className="flex-1 flex flex-col min-h-0">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="spinner" />
          </div>
        ) : (
          <ProductTable
            products={products}
            showForecast={showForecastColumn}
            onView={setViewingProduct}
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

      {/* Modals */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={editingProduct ? onEditSubmit : onAddSubmit}
        editingProduct={editingProduct}
      />

      <DemandForecastModal
        isOpen={showForecastModal}
        onClose={() => setShowForecastModal(false)}
        products={forecastedProducts.length > 0 ? forecastedProducts : []}
      />

      <ProductDetailsModal 
        viewingProduct={viewingProduct} 
        setViewingProduct={setViewingProduct} 
      />
    </>
  );
}
