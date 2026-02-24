import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, HashRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Services
import authService from './services/authService';

// Layout & Pages
import { Navbar, PageHeaderBar } from './components/Layout';
import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';
import ProductsPage from './pages/ProductsPage';
import OptimizationPage from './pages/OptimizationPage';

// Styles
import './index.css';

/**
 * Main Application Shell
 * ----------------------
 * Responsible ONLY for:
 * 1. Global Authentication State
 * 2. Routing between top-level pages
 * 3. Shared layout headers
 */
function AppInner() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- Auth & Routing State ---
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState('login'); 

  // --- Initialization ---
  useEffect(() => {
    const user = authService.getUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // --- Route Syncing ---
  useEffect(() => {
    const hash = location.pathname;
    if (hash === '/products' && page !== 'products') {
      setPage('products');
    } else if (hash === '/optimization' && page !== 'optimization') {
      setPage('optimization');
    }
  }, [location.pathname, page]);

  // Initial redirect based on auth
  useEffect(() => {
    if (currentUser && page === 'login') {
      if (location.pathname === '/products') setPage('products');
      else if (location.pathname === '/optimization') setPage('optimization');
      else {
        setPage('landing');
        navigate('/');
      }
    } else if (!currentUser && page !== 'login') {
      setPage('login');
      navigate('/');
    }
  }, [currentUser, navigate, location.pathname, page]);

  // --- Auth Handlers ---
  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    setPage('landing');
    navigate('/');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setPage('login');
    navigate('/');
  };

  const navigateTo = (destination) => {
    setPage(destination);
    navigate(`/${destination}`);
  };

  // --- Rendering ---
  if (page === 'login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (page === 'landing') {
    return <LandingPage onNavigate={navigateTo} userName={currentUser?.username} />;
  }

  const pageTitles = { products: 'Products', optimization: 'Optimization' };
  const headerTitles = { 
    products: 'Create and Manage Product', 
    optimization: 'Pricing Optimization' 
  };

  const userRole = currentUser?.role || 'admin';

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navbar 
        userName={currentUser?.username} 
        pageTitle={pageTitles[page] || ''} 
        onLogout={handleLogout} 
      />
      <PageHeaderBar 
        title={headerTitles[page] || ''} 
        onBack={() => navigateTo('landing')} 
      />

      <Routes>
        <Route 
          path="/products" 
          element={<ProductsPage userRole={userRole} />} 
        />
        <Route 
          path="/optimization" 
          element={<OptimizationPage userRole={userRole} />} 
        />
        {/* Fallback route */}
        <Route 
          path="*" 
          element={<ProductsPage userRole={userRole} />} 
        />
      </Routes>
    </div>
  );
}

/* ─── Root: wraps in HashRouter ─── */
export default function App() {
  return (
    <HashRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1F2937',
            color: '#E5E7EB',
            border: '1px solid #243041',
            borderRadius: '10px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#14B8A6', secondary: '#E5E7EB' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#E5E7EB' },
          },
        }}
      />
      <AppInner />
    </HashRouter>
  );
}
