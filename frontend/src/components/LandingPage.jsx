/**
 * LandingPage.jsx
 * ---------------
 * Page 1 — Landing. Soft gradient bg, BCG X logo, two feature cards.
 * No oversaturated greens. Softer teal hover borders.
 */
import React from 'react';
import { Package, TrendingUp, ArrowRight } from 'lucide-react';
import { Card } from './ui/card';

const features = [
  {
    id: 'products',
    icon: Package,
    title: 'Create and\nManage Product',
    description: 'Add, edit, and manage your product catalog with full control over pricing, stock levels, and product details.',
  },
  {
    id: 'optimization',
    icon: TrendingUp,
    title: 'Pricing\nOptimization',
    description: 'Analyze market trends and optimize your product pricing to maximize revenue and maintain competitive positioning.',
  },
];

const LandingPage = ({ onNavigate }) => (
  <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#111827] to-[#0F172A] flex flex-col items-center justify-center px-8">
    <div className="mb-8">
      <span className="text-[#E5E7EB] text-2xl font-bold tracking-wider">
        BCG <span className="text-accent">X</span>
      </span>
    </div>

    <h1 className="text-[#E5E7EB] text-4xl font-semibold mb-3 text-center">
      Price Optimization Tool
    </h1>
    <p className="text-[#9CA3AF] text-sm text-center max-w-xl mb-12 leading-relaxed">
      Manage your product catalog and optimize pricing strategies with data-driven insights and demand forecasting.
    </p>

    <div className="flex gap-8 max-w-3xl w-full">
      {features.map(({ id, icon: Icon, title, description }) => (
        <Card
          key={id}
          className="flex-1 rounded-2xl p-8 bg-white border-transparent hover:border-accent transition-all duration-200 cursor-pointer group"
          onClick={() => onNavigate(id)}
        >
          <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mb-8">
            <Icon size={28} className="text-gray-700" />
          </div>
          <h2 className="text-gray-900 text-xl font-bold mb-3 whitespace-pre-line leading-tight">{title}</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">{description}</p>
          <ArrowRight size={22} className="text-gray-700 group-hover:translate-x-1 transition-transform duration-200" />
        </Card>
      ))}
    </div>
  </div>
);

export default LandingPage;
