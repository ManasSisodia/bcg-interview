/* 
  DemandForecastPopup.jsx
  -----------------------
  A full-screen popup overlay that shows:
  1. A LINE CHART comparing "Product Demand" vs "Selling Price"
  2. A TABLE below the chart with product details + "Calculated Demand Forecast"
  
  This matches the mockup screenshot exactly.
  Uses the Recharts library for the line chart.
*/
import React from 'react';
import { X } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const DemandForecastPopup = ({ isOpen, onClose, products }) => {
  // Don't render if popup is closed
  if (!isOpen) return null;

  // Prepare data for the chart
  // Each product becomes a data point on the X-axis
  const chartData = products.map((p, index) => ({
    name: `Product ${index + 1}`,        // X-axis label
    demand: p.demand_forecast,            // Purple/blue line
    sellingPrice: Number(p.selling_price), // Green line
  }));

  return (
    /* Dark overlay */
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-8">
      {/* Popup container */}
      <div className="bg-dark-header border border-dark-border rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        
        {/* Header: Title + Close button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border">
          <h3 className="text-white text-lg font-semibold">Demand Forecast</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-red-btn flex items-center justify-center hover:bg-red-300 transition-colors"
          >
            <X size={16} className="text-white" />
          </button>
        </div>

        {/* ── LINE CHART ── */}
        <div className="p-6">
          <div className="bg-dark-bg rounded-lg p-4" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
                <XAxis
                  dataKey="name"
                  stroke="#9e9e9e"
                  fontSize={12}
                />
                <YAxis
                  stroke="#9e9e9e"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#2d2d2d',
                    border: '1px solid #3a3a3a',
                    borderRadius: '6px',
                    color: '#e0e0e0',
                  }}
                />
                <Legend />
                {/* Purple/blue line = Product Demand */}
                <Line
                  type="monotone"
                  dataKey="demand"
                  name="Product Demand"
                  stroke="#7c4dff"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                {/* Green line = Selling Price */}
                <Line
                  type="monotone"
                  dataKey="sellingPrice"
                  name="Selling Price"
                  stroke="#4db6ac"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── FORECAST TABLE ── */}
        <div className="px-6 pb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-dark-row border-b border-dark-border text-text-muted">
                  <th className="px-4 py-3 font-semibold">Product Name</th>
                  <th className="px-4 py-3 font-semibold">Product Category</th>
                  <th className="px-4 py-3 font-semibold">Cost Price</th>
                  <th className="px-4 py-3 font-semibold">Selling Price</th>
                  <th className="px-4 py-3 font-semibold">Available Stock</th>
                  <th className="px-4 py-3 font-semibold">Units Sold</th>
                  <th className="px-4 py-3 font-semibold">Calculated Demand Forecast</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr
                    key={product.id}
                    className={`${index % 2 === 0 ? 'bg-dark-row' : 'bg-dark-row-alt'} border-b border-dark-border`}
                  >
                    <td className="px-4 py-3 text-white">{product.name}</td>
                    <td className="px-4 py-3 text-text-muted">{product.category}</td>
                    <td className="px-4 py-3 text-text-muted">$ {product.cost_price}</td>
                    <td className="px-4 py-3 text-text-muted">$ {product.selling_price}</td>
                    <td className="px-4 py-3 text-text-muted">
                      {Number(product.stock_available).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {Number(product.units_sold).toLocaleString()}
                    </td>
                    {/* Green highlighted forecast value */}
                    <td className="px-4 py-3">
                      <span className="bg-green-highlight text-dark-bg px-2 py-1 rounded font-medium">
                        {product.demand_forecast}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
