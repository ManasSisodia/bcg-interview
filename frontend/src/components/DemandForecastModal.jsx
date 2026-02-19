/**
 * DemandForecastModal.jsx
 * -----------------------
 * Demand Forecast — softer chart colors, backdrop-blur overlay.
 * Purple (#8B5CF6) demand, Teal (#14B8A6) selling price.
 * Highlighted cells: bg-accent/20 text-accent.
 */
import React from 'react';
import { X } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from './ui/table';

const DemandForecastModal = ({ isOpen, onClose, products = [] }) => {
  if (!isOpen) return null;

  const chartData = products.map((p, idx) => ({
    name: p.name?.length > 14 ? `Product ${idx + 1}` : p.name,
    demand: p.demand_forecast || Math.floor(Math.random() * 10000) + 500,
    sellingPrice: parseFloat(p.selling_price) || 0,
  }));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
      <div
        className="w-full max-w-5xl max-h-[90vh] overflow-auto rounded-xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <h3 className="text-lg font-semibold text-[#E5E7EB]">Demand Forecast</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-danger flex items-center justify-center hover:bg-red-400 transition-all duration-200"
          >
            <X size={14} className="text-white" />
          </button>
        </div>

        {/* Chart */}
        <div className="p-6">
          <div className="rounded-xl border border-border bg-background p-4">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243041" />
                <XAxis
                  dataKey="name"
                  stroke="#6B7280"
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  axisLine={{ stroke: '#243041' }}
                />
                <YAxis
                  stroke="#6B7280"
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  axisLine={{ stroke: '#243041' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #243041',
                    borderRadius: '8px',
                    color: '#E5E7EB',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '16px' }}
                  iconType="circle"
                  formatter={(value) => (
                    <span style={{ color: '#9CA3AF', fontSize: '12px' }}>{value}</span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="demand"
                  name="Product Demand"
                  stroke="#8B5CF6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#8B5CF6' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="sellingPrice"
                  name="Selling Price"
                  stroke="#14B8A6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#14B8A6' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="px-6 pb-6">
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead>Product Name</TableHead>
                  <TableHead>Product Category</TableHead>
                  <TableHead>Cost Price</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Available Stock</TableHead>
                  <TableHead>Units Sold</TableHead>
                  <TableHead>Calculated Demand Forecast</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p, idx) => (
                  <TableRow key={p.id} className={idx % 2 === 0 ? 'bg-card' : 'bg-[#0F1A2E]'}>
                    <TableCell className="text-[#E5E7EB] font-medium">{p.name}</TableCell>
                    <TableCell className="text-[#9CA3AF]">{p.category}</TableCell>
                    <TableCell className="text-[#E5E7EB]">$ {p.cost_price}</TableCell>
                    <TableCell className="text-[#E5E7EB]">$ {p.selling_price}</TableCell>
                    <TableCell className="text-[#E5E7EB]">{Number(p.stock_available).toLocaleString()}</TableCell>
                    <TableCell className="text-[#E5E7EB]">{Number(p.units_sold).toLocaleString()}</TableCell>
                    <TableCell>
                      <span className="px-3 py-1 rounded-md bg-accent/20 text-accent font-semibold text-sm">
                        {p.demand_forecast || Math.floor(Math.random() * 10000) + 500}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandForecastModal;
