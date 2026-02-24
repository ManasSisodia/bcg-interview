import React from 'react';
import { X } from 'lucide-react';

export const ProductDetailsModal = ({ viewingProduct, setViewingProduct }) => {
  if (!viewingProduct) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" 
      onClick={() => setViewingProduct(null)}
    >
      <div 
        className="bg-card rounded-xl w-full max-w-md border border-border shadow-2xl" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-[#E5E7EB]">Product Details</h3>
          <button 
            onClick={() => setViewingProduct(null)} 
            className="text-muted hover:text-[#E5E7EB] transition-all duration-200"
          >
            <X size={18} />
          </button>
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
  );
};
