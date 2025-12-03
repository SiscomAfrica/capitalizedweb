import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, SortAsc, SortDesc, RefreshCw, AlertCircle } from 'lucide-react';
import ProductCard from './ProductCard';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Button from '../common/Button';
import investmentClient from '../../api/investmentClient';

const ProductGrid = ({ onProductClick, initialFilters = {} }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    riskLevel: '',
    sortBy: 'expectedReturn',
    sortOrder: 'desc',
    ...initialFilters
  });
  const [showFilters, setShowFilters] = useState(false);

  // Available filter options
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'technology', label: 'Technology' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'energy', label: 'Energy' }
  ];

  const riskLevels = [
    { value: '', label: 'All Risk Levels' },
    { value: 'low', label: 'Low Risk' },
    { value: 'medium', label: 'Medium Risk' },
    { value: 'high', label: 'High Risk' }
  ];

  const sortOptions = [
    { value: 'expectedReturn', label: 'Expected Return' },
    { value: 'minimumInvestment', label: 'Minimum Investment' },
    { value: 'duration', label: 'Duration' },
    { value: 'name', label: 'Name' }
  ];

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch products from investment service
      console.log('Fetching from URL:', import.meta.env.VITE_INVESTMENT_SERVICE_URL);
      
      // Use direct fetch to bypass axios issues
      const params = new URLSearchParams();
      params.append('status', 'active');
      params.append('page', '1');
      params.append('page_size', '20');
      
      if (filters.sortBy) {
        const sortMapping = {
          'expectedReturn': 'expected_annual_return',
          'minimumInvestment': 'minimum_investment',
          'duration': 'investment_duration_months',
          'name': 'name'
        };
        params.append('sort_by', sortMapping[filters.sortBy] || filters.sortBy);
      }
      if (filters.sortOrder) {
        params.append('sort_order', filters.sortOrder);
      }
      
      const url = `${import.meta.env.VITE_INVESTMENT_SERVICE_URL}/products/?${params.toString()}`;
      
      // Get auth token if available
      const token = localStorage.getItem('africa_access_token');
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
        mode: 'cors',
        credentials: 'omit', // Don't send cookies
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Handle the API response structure: { products: [...], total, page, page_size, total_pages }
      const productsData = data.products || [];
      setProducts(productsData);
    } catch (err) {
      console.error('Error fetching products:', err);
      
      let errorMessage = 'Failed to load investment products';
      
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (err.message.includes('HTTP 404')) {
        errorMessage = 'Investment service not found. Please contact support.';
      } else if (err.message.includes('HTTP 500')) {
        errorMessage = 'Investment service error. Please try again later.';
      } else if (err.message.includes('CORS')) {
        errorMessage = 'Cross-origin request blocked. Please contact support.';
      } else {
        errorMessage = err.message || 'Failed to load investment products';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering and sorting
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Apply client-side filters
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    if (filters.riskLevel) {
      filtered = filtered.filter(product => product.riskLevel === filters.riskLevel);
    }

    // Apply client-side sorting
    filtered.sort((a, b) => {
      let aValue = a[filters.sortBy];
      let bValue = b[filters.sortBy];

      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [products, filters]);

  // Load products on mount and filter changes
  useEffect(() => {
    fetchProducts();
  }, []); // Only fetch on mount, use client-side filtering for real-time updates

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle sort order toggle
  const toggleSortOrder = () => {
    setFilters(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      category: '',
      riskLevel: '',
      sortBy: 'expectedReturn',
      sortOrder: 'desc'
    });
  };

  // Handle retry
  const handleRetry = () => {
    fetchProducts();
  };

  // Handle product click
  const handleProductClick = (productSlug) => {
    if (onProductClick) {
      onProductClick(productSlug);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          
          {(filters.category || filters.riskLevel) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={resetFilters}
              className="text-error-600 hover:text-error-700"
            >
              Clear
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="px-3 py-3 border border-secondary-300 rounded-lg text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                Sort by {option.label}
              </option>
            ))}
          </select>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleSortOrder}
            className="flex items-center gap-1"
          >
            {filters.sortOrder === 'asc' ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleRetry}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-secondary-50 rounded-lg p-4 border border-secondary-200"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-3 border border-secondary-300 rounded-lg text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Risk Level
                </label>
                <select
                  value={filters.riskLevel}
                  onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
                  className="w-full px-3 py-3 border border-secondary-300 rounded-lg text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {riskLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-secondary-600">
          {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'product' : 'products'} found
        </p>
        
      </div>

      {/* Products Grid */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            No products found
          </h3>
          <p className="text-secondary-600 mb-4">
            Try adjusting your filters or check back later for new investment opportunities.
          </p>
          <Button
            variant="secondary"
            onClick={resetFilters}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          <AnimatePresence>
            {filteredAndSortedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.05 // Stagger animation
                }}
              >
                <ProductCard
                  product={product}
                  onClick={handleProductClick}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default ProductGrid;