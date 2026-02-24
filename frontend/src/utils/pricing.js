/**
 * pricing.js
 * ----------
 * Pure utility functions for pricing calculations.
 * Extracted from component logic to enable independent testing and reuse.
 */

/**
 * Calculates demand forecast.
 * Formula: (units_sold * 1.2) + (stock_available * 0.1)
 */
export const calculateDemandForecast = (product) => {
  const unitsSold = parseInt(product.units_sold, 10) || 0;
  const stockAvailable = parseInt(product.stock_available, 10) || 0;
  return Math.round(unitsSold * 1.2 + stockAvailable * 0.1);
};

/**
 * Calculates optimized price.
 * Principle: Margin preservation. Cannot drop below a baseline margin.
 * Formula: cost_price + current_margin * (0.7 + 0.3 * demand_ratio)
 */
export const calculateOptimizedPrice = (product, newDemandForecast) => {
  const cPrice = parseFloat(product.cost_price) || 0;
  const sPrice = parseFloat(product.selling_price) || 0;

  if (cPrice >= sPrice) return cPrice; // Edge case: selling at a loss

  const originalMargin = sPrice - cPrice;
  const historicalSales = parseInt(product.units_sold, 10) || 1;

  // Ratio of expected future demand vs historical actual sales
  // Cap ratio between 0.5 (bad) and 2.0 (great) to prevent wild swings
  let ratio = newDemandForecast / historicalSales;
  ratio = Math.max(0.5, Math.min(ratio, 2.0));

  // Demand multiplier: 0.7 base + 0.3 variable based on demand
  const demandMultiplier = 0.7 + 0.3 * ratio;

  // Calculate new price, round to 2 decimals
  const newPrice = cPrice + originalMargin * demandMultiplier;
  return parseFloat(newPrice.toFixed(2));
};

/**
 * Applies both calculations to a product object.
 */
export const applyPricingOptimizations = (product) => {
  const demand_forecast = calculateDemandForecast(product);
  const optimized_price = calculateOptimizedPrice(product, demand_forecast);

  return {
    ...product,
    demand_forecast,
    optimized_price,
  };
};
