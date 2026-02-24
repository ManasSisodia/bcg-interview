/**
 * DemandForecastModal.jsx
 * -----------------------
 * Demand Forecast — Chart.js Line chart (demand vs selling price).
 * Purple (#8B5CF6) demand, Teal (#14B8A6) selling price.
 * Highlighted forecast cells: bg-accent/20 text-accent.
 */
import React from 'react';
import { X } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, LogarithmicScale, PointElement, LineElement,
  Title, Tooltip as ChartTooltip, Legend, Filler,
} from 'chart.js';
import { getDemandForecastChartData, demandForecastChartOptions } from '../utils/chartConfig';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from './ui/table';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, LogarithmicScale, PointElement, LineElement, Title, ChartTooltip, Legend, Filler);

const DemandForecastModal = ({ isOpen, onClose, products = [] }) => {
  if (!isOpen) return null;

  const chartData = getDemandForecastChartData(products);

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
            <div style={{ height: '280px' }}>
              <Line data={chartData} options={demandForecastChartOptions} />
            </div>
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
                        {p.demand_forecast || 0}
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
