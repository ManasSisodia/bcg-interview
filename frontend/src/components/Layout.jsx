/**
 * Layout.jsx
 * ----------
 * Navbar (h-16) with user dropdown, PageHeaderBar, ActionBar.
 * No duplicate Back/User — Back is only in PageHeaderBar, user only in Navbar.
 */
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Search, Filter, Plus, BarChart3, User, LogOut, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';

/* ─── Top Navbar (h-16) ─── */
export const Navbar = ({ userName = 'Guest', pageTitle = '', onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-card h-16 px-8 flex items-center justify-between border-b border-border shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-accent text-base font-semibold">Price Optimization Tool</h1>
        {pageTitle && (
          <>
            <div className="w-px h-5 bg-border" />
            <span className="text-[#9CA3AF] text-sm">{pageTitle}</span>
          </>
        )}
      </div>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 hover:opacity-80 transition-all duration-200"
        >
          <span className="text-[#9CA3AF] text-sm">
            Welcome, <span className="text-accent font-medium">{userName}</span>
          </span>
          <div className="w-8 h-8 rounded-full bg-elevated flex items-center justify-center">
            <User size={16} className="text-[#9CA3AF]" />
          </div>
          <ChevronDown size={14} className="text-[#9CA3AF]" />
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-44 rounded-lg border border-border bg-card shadow-xl z-50">
            <button
              onClick={() => { setDropdownOpen(false); onLogout(); }}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm text-[#9CA3AF] hover:text-[#E5E7EB] hover:bg-elevated transition-all duration-200 rounded-lg"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

/* ─── Page Header Bar ─── */
export const PageHeaderBar = ({ title, onBack }) => (
  <div className="px-8 py-5 flex items-center shrink-0">
    <div className="flex items-center gap-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-[#9CA3AF] hover:text-[#E5E7EB] text-sm transition-all duration-200"
      >
        <ChevronLeft size={16} />
        <span>Back</span>
      </button>
      <h2 className="text-2xl font-semibold text-[#E5E7EB]">{title}</h2>
    </div>
  </div>
);

/* ─── Action Bar ─── */
export const ActionBar = ({
  showForecast,
  onToggleForecast,
  onSearchChange,
  categoryValue,
  onCategoryChange,
  categories = [],
  onAddProduct,
  onDemandForecast,
  onFilterApply,
  onFilterClear,
  activeFilterCount = 0,
}) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const filterRef = useRef(null);

  // Close filter popover on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApply = () => {
    onFilterApply({ min_price: minPrice, max_price: maxPrice });
    setFilterOpen(false);
  };

  const handleClear = () => {
    setMinPrice('');
    setMaxPrice('');
    onFilterClear();
    setFilterOpen(false);
  };

  return (
    <div className="mx-8 mb-8 rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-6">
      {/* Left group — toggle only */}
      <div className="flex items-center gap-2">
        <Switch checked={showForecast} onCheckedChange={onToggleForecast} />
        <span className="text-[#9CA3AF] text-sm whitespace-nowrap">With Demand Forecast</span>
      </div>

      {/* Right group */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search products..."
            onChange={onSearchChange}
            className="pl-8 w-72 h-9"
          />
        </div>

        {/* Category */}
        <div className="flex items-center gap-2">
          <span className="text-[#9CA3AF] text-sm whitespace-nowrap">Category</span>
          <select
            value={categoryValue}
            onChange={onCategoryChange}
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-[#E5E7EB] min-w-[140px] transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="">All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Filter Button + Popover */}
        <div className="relative" ref={filterRef}>
          <Button
            variant={activeFilterCount > 0 ? 'primary' : 'secondary'}
            className="gap-1.5"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <Filter size={14} />
            <span>Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</span>
          </Button>

          {filterOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-card p-4 shadow-xl z-50 space-y-3">
              <h4 className="text-sm font-medium text-[#E5E7EB]">Price Range</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-[#9CA3AF]">Min Price</label>
                  <Input type="number" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[#9CA3AF]">Max Price</label>
                  <Input type="number" placeholder="999" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="h-8 text-xs" />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={handleClear} className="flex-1">Clear</Button>
                <Button variant="primary" size="sm" onClick={handleApply} className="flex-1">Apply</Button>
              </div>
            </div>
          )}
        </div>

        <Button variant="primary" onClick={onAddProduct} className="gap-1.5">
          <Plus size={14} />
          <span>Add New Products</span>
        </Button>

        <Button variant="secondary" onClick={onDemandForecast} className="gap-1.5">
          <BarChart3 size={14} />
          <span>Demand Forecast</span>
        </Button>
      </div>
    </div>
  );
};
