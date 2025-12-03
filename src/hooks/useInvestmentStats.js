import { useState, useEffect } from 'react';
import investmentClient from '../api/investmentClient';
import { formatCurrency, formatPercentage, formatCompactCurrency, formatLargeNumber } from '../utils/investmentHelpers';

/**
 * Hook to fetch and manage investment statistics
 * @returns {Object} Statistics data and loading state
 */
const useInvestmentStats = () => {
  const [stats, setStats] = useState({
    averageReturn: 0,
    minInvestment: 0,
    totalProducts: 0,
    totalInvestors: 0,
    totalRaised: 0,
    activeProducts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate statistics from products data
  const calculateStatsFromProducts = (products) => {
    console.log('Calculating statistics from products:', products);
    
    if (!products || products.length === 0) {
      console.log('No products found, returning zero stats');
      return {
        averageReturn: 0,
        minInvestment: 0,
        totalProducts: 0,
        totalInvestors: 0,
        totalRaised: 0,
        activeProducts: 0
      };
    }

    const activeProducts = products.filter(product => product.status === 'active');
    console.log(`Found ${activeProducts.length} active products out of ${products.length} total`);
    
    // Calculate average return from all products (not just active)
    const productsWithReturns = products.filter(product => {
      const returnRate = parseFloat(product.expected_annual_return);
      return returnRate && returnRate > 0;
    });
    
    const totalReturn = productsWithReturns.reduce((sum, product) => {
      return sum + (parseFloat(product.expected_annual_return) || 0);
    }, 0);
    const averageReturn = productsWithReturns.length > 0 ? totalReturn / productsWithReturns.length : 0;

    // Find minimum investment from all products
    const minInvestments = products
      .map(product => parseFloat(product.minimum_investment) || 0)
      .filter(amount => amount > 0);
    const minInvestment = minInvestments.length > 0 ? Math.min(...minInvestments) : 0;

    // Calculate totals from all products
    const totalInvestors = products.reduce((sum, product) => {
      return sum + (parseInt(product.total_investors) || 0);
    }, 0);

    const totalRaised = products.reduce((sum, product) => {
      return sum + (parseFloat(product.total_raised) || 0);
    }, 0);

    const stats = {
      averageReturn,
      minInvestment,
      totalProducts: products.length,
      totalInvestors,
      totalRaised,
      activeProducts: activeProducts.length
    };

    console.log('Calculated statistics result:', stats);
    return stats;
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch dedicated statistics endpoint first
      try {
        console.log('Attempting to fetch statistics from dedicated endpoint...');
        const statsResponse = await investmentClient.getStatistics();
        console.log('Statistics fetched successfully:', statsResponse);
        setStats(statsResponse);
        return;
      } catch (statsError) {
        // Statistics endpoint not available (404 or other error), fall back to product calculation
        console.log('Statistics endpoint not available (this is expected), calculating from products data...');
        console.log('Statistics error details:', statsError.message);
      }

      // Fallback: fetch products and calculate statistics
      console.log('Fetching products to calculate statistics...');
      const productsResponse = await investmentClient.getProducts({
        page: 1,
        pageSize: 100 // Get more products for better statistics
      });

      const products = productsResponse.products || [];
      console.log(`Found ${products.length} products for statistics calculation`);
      
      const calculatedStats = calculateStatsFromProducts(products);
      console.log('Calculated statistics:', calculatedStats);
      setStats(calculatedStats);

    } catch (err) {
      console.error('Error fetching investment statistics:', err);
      setError(err.message || 'Failed to load investment statistics');
      
      // Set default values on error
      setStats({
        averageReturn: 0,
        minInvestment: 0,
        totalProducts: 0,
        totalInvestors: 0,
        totalRaised: 0,
        activeProducts: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Format statistics for display
  const formattedStats = {
    averageReturn: {
      value: formatPercentage(stats.averageReturn),
      label: 'Average Return',
      description: 'Across all active products',
      trend: stats.averageReturn > 15 ? 'up' : stats.averageReturn > 10 ? 'stable' : 'down'
    },
    minInvestment: {
      value: formatCurrency(stats.minInvestment),
      label: 'Min. Investment',
      description: 'Starting amount',
      trend: 'stable'
    },
    totalInvestors: {
      value: formatLargeNumber(stats.totalInvestors, 0),
      label: 'Total Investors',
      description: 'Across all products',
      trend: 'up'
    },
    totalRaised: {
      value: formatCompactCurrency(stats.totalRaised),
      label: 'Total Raised',
      description: 'Investment capital',
      trend: 'up'
    },
    activeProducts: {
      value: formatLargeNumber(stats.activeProducts, 0),
      label: 'Active Products',
      description: `${stats.totalProducts} total available`,
      trend: 'stable'
    }
  };

  return {
    stats,
    formattedStats,
    loading,
    error,
    refetch: fetchStats
  };
};

export default useInvestmentStats;