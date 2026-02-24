import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import productService from '../services/productService';
import { applyPricingOptimizations } from '../utils/pricing';

/**
 * Hook to manage cross-page product selection and demand forecasting logic.
 */
export const useProductSelection = (currentProducts, refreshTable, setProducts) => {
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [selectedProductsMap, setSelectedProductsMap] = useState({});
  const [forecastedProducts, setForecastedProducts] = useState([]);
  const [showForecastModal, setShowForecastModal] = useState(false);

  // Keeps track of selected products across multiple pages
  const handleSelectionChange = useCallback((ids) => {
    setSelectedProductIds(ids);
    setSelectedProductsMap((prev) => {
      const next = { ...prev };
      
      // Add any newly selected products from the current page
      ids.forEach((id) => {
        if (!next[id]) {
          const product = currentProducts.find((p) => p.id === id);
          if (product) next[id] = product;
        }
      });
      
      // Remove any deselected products that are on the current page
      const currentPageIds = currentProducts.map((p) => p.id);
      currentPageIds.forEach((id) => {
        if (!ids.includes(id)) delete next[id];
      });
      
      return next;
    });
  }, [currentProducts]);

  // Performs calculations and persists back to the API
  const handleDemandForecast = async () => {
    const selectedList = Object.values(selectedProductsMap);
    if (!selectedList.length) return;

    // Apply formulas from utils
    const computed = selectedList.map(applyPricingOptimizations);

    // Save to database
    try {
      await productService.bulkForecast(
        computed.map((p) => ({ 
          id: p.id, 
          demand_forecast: p.demand_forecast, 
          optimized_price: p.optimized_price 
        }))
      );
      toast.success('Forecast saved to database successfully!');
    } catch (err) {
      toast.error('Calculated forecast, but failed to save to database');
    }

    setForecastedProducts(computed);
    setShowForecastModal(true);
    
    // Optimistically update the UI to instantly show changes on Current Page and Optimization Page
    if (setProducts) {
      setProducts((prev) => 
        prev.map((p) => {
          const updated = computed.find((c) => c.id === p.id);
          return updated ? { ...p, demand_forecast: updated.demand_forecast, optimized_price: updated.optimized_price } : p;
        })
      );
    }

    // Refresh the table to guarantee DB synchronization
    if (refreshTable) refreshTable();
  };

  return {
    selectedProductIds,
    selectedProductsMap,
    forecastedProducts,
    showForecastModal,
    setShowForecastModal,
    handleSelectionChange,
    handleDemandForecast,
  };
};
