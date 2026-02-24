import React, { useEffect, useState } from 'react';
import { ActionBar } from '../components/Layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import DemandForecastModal from '../components/DemandForecastModal';
import TablePagination from '../components/TablePagination';
import { useProducts } from '../hooks/useProducts';
import { useProductSelection } from '../hooks/useProductSelection';

export default function OptimizationPage({ userRole }) {
  // Use products hook just to get data, we ignore the CRUD methods on this page
  const {
    products,
    setProducts,
    searchQuery,
    categoryFilter,
    priceFilter,
    setPriceFilter,
    categories,
    fetchProducts,
    fetchCategories,
    handleSearchChange,
    handleCategoryChange,
    pagination,
    currentPageNum,
    setCurrentPageNum
  } = useProducts({ isOptimized: true });

  const {
    selectedProductsMap,
    forecastedProducts,
    showForecastModal,
    setShowForecastModal,
    handleSelectionChange,
    handleDemandForecast,
  } = useProductSelection(products, fetchProducts, setProducts);

  const [showForecastColumn, setShowForecastColumn] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  return (
    <>
      <ActionBar
        showForecast={showForecastColumn}
        onToggleForecast={() => setShowForecastColumn(!showForecastColumn)}
        onSearchChange={handleSearchChange}
        categoryValue={categoryFilter}
        onCategoryChange={handleCategoryChange}
        categories={categories}
        onFilterApply={(f) => {
          setPriceFilter(f);
          setCurrentPageNum(1);
        }}
        onFilterClear={() => {
          setPriceFilter({ min_price: '', max_price: '' });
          setCurrentPageNum(1);
        }}
        activeFilterCount={(priceFilter.min_price ? 1 : 0) + (priceFilter.max_price ? 1 : 0)}
        onDemandForecast={handleDemandForecast}
        disableDemandForecast={Object.keys(selectedProductsMap).length === 0}
        canCreate={userRole === 'admin' || userRole === 'supplier'}
        isOptimizationPage={true}
      />

      <main className="flex-1 flex flex-col min-h-0 overflow-auto">
        {products.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted gap-3">
            <span className="text-lg">No forecasted products available</span>
            <span className="text-sm text-muted">
              Go to Products page → select products → click Demand Forecast
            </span>
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
                  {products.map((p, idx) => (
                    <TableRow key={p.id} className={idx % 2 === 0 ? 'bg-card' : 'bg-[#0F1A2E]'}>
                      <TableCell className="text-[#E5E7EB] font-medium">{p.name}</TableCell>
                      <TableCell className="text-[#9CA3AF]">{p.category}</TableCell>
                      <TableCell className="text-[#9CA3AF] max-w-[280px]">
                        <span className="block whitespace-normal line-clamp-2">
                          {p.description || '-'}
                        </span>
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
            <TablePagination 
              pagination={pagination}
              currentPage={currentPageNum}
              onPageChange={setCurrentPageNum}
              dataLength={products.length}
            />
          </div>
        )}
      </main>
      
      {/* Modals */}
      <DemandForecastModal
        isOpen={showForecastModal}
        onClose={() => setShowForecastModal(false)}
        products={forecastedProducts.length > 0 ? forecastedProducts : []}
      />
    </>
  );
}
