/**
 * chartConfig.js
 * --------------
 * Configuration definitions and data transformers for Chart.js.
 */

export const getOptimizationChartData = (products) => {
  return {
    labels: products.map((p) => (p.name?.length > 18 ? p.name.slice(0, 15) + '...' : p.name)),
    datasets: [
      {
        label: 'Cost Price',
        data: products.map((p) => parseFloat(p.cost_price) || 0),
        backgroundColor: 'rgba(107, 114, 128, 0.7)',
        borderColor: '#6B7280',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Selling Price',
        data: products.map((p) => parseFloat(p.selling_price) || 0),
        backgroundColor: 'rgba(139, 92, 246, 0.7)',
        borderColor: '#8B5CF6',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Optimized Price',
        data: products.map((p) => parseFloat(p.optimized_price) || 0),
        backgroundColor: 'rgba(20, 184, 166, 0.7)',
        borderColor: '#14B8A6',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };
};

export const optimizationChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#9CA3AF',
        font: { size: 12 },
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20,
      },
    },
    tooltip: {
      backgroundColor: '#1F2937',
      titleColor: '#E5E7EB',
      bodyColor: '#E5E7EB',
      borderColor: '#243041',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      callbacks: { label: (ctx) => `${ctx.dataset.label}: $${ctx.raw.toFixed(2)}` },
    },
  },
  scales: {
    x: {
      ticks: { color: '#9CA3AF', font: { size: 10 }, maxRotation: 45 },
      grid: { color: '#243041', drawBorder: false },
    },
    y: {
      type: 'logarithmic',
      ticks: { 
        color: '#9CA3AF', 
        font: { size: 11 }, 
        callback: (v) => {
          // Only show important log ticks to avoid clutter
          if (v === 1 || v === 10 || v === 100 || v === 1000 || v === 10000 || v === 100000) {
            return `$${v}`;
          }
          return '';
        } 
      },
      grid: { color: '#243041', drawBorder: false },
    },
  },
};

export const getDemandForecastChartData = (products) => {
  return {
    labels: products.map((p) => (p.name?.length > 18 ? p.name.slice(0, 15) + '...' : p.name)),
    datasets: [
      {
        label: 'Product Demand',
        data: products.map((p) => parseFloat(p.demand_forecast) || 0),
        backgroundColor: 'rgba(139, 92, 246, 0.7)',
        borderColor: '#8B5CF6',
        borderWidth: 2,
        borderRadius: 4,
        tension: 0.4, // Smoother curve
        yAxisID: 'y1',
      },
      {
        label: 'Selling Price',
        data: products.map((p) => parseFloat(p.selling_price) || 0),
        backgroundColor: 'rgba(20, 184, 166, 0.7)',
        borderColor: '#14B8A6',
        borderWidth: 2,
        borderRadius: 4,
        tension: 0.4, // Smoother curve
        yAxisID: 'y',
      },
    ],
  };
};

export const demandForecastChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#9CA3AF',
        font: { size: 12 },
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20,
      },
    },
    tooltip: {
      backgroundColor: '#1F2937',
      titleColor: '#E5E7EB',
      bodyColor: '#E5E7EB',
      borderColor: '#243041',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      callbacks: {
        label: (ctx) => {
          if (ctx.dataset.label === 'Selling Price') {
            return `${ctx.dataset.label}: $${ctx.raw.toFixed(2)}`;
          }
          return `${ctx.dataset.label}: ${ctx.raw}`;
        },
      },
    },
  },
  scales: {
    x: {
      ticks: { color: '#9CA3AF', font: { size: 10 }, maxRotation: 45 },
      grid: { color: '#243041', drawBorder: false },
    },
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      title: { display: true, text: 'Price ($)', color: '#9CA3AF' },
      ticks: { color: '#9CA3AF', font: { size: 11 }, callback: (v) => `$${v}` },
      grid: { color: '#243041', drawBorder: false },
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      title: { display: true, text: 'Demand (Units)', color: '#9CA3AF' },
      ticks: { color: '#9CA3AF', font: { size: 11 } },
      grid: { drawOnChartArea: false }, // don't draw grid lines over the left y-axis
    },
  },
};
