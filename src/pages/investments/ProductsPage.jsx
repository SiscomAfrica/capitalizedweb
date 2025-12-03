import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Target, Users, DollarSign, RefreshCw, ChevronDown, ChevronUp, Package } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ProductGrid from '../../components/investments/ProductGrid';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import useInvestmentStats from '../../hooks/useInvestmentStats';

const ProductsPage = () => {
  const navigate = useNavigate();
  const { formattedStats, loading: statsLoading, error: statsError, refetch } = useInvestmentStats();
  const [showAllStats, setShowAllStats] = useState(false);

  // Handle product click
  const handleProductClick = (productSlug) => {
    navigate(`/investments/products/${productSlug}`);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">
                Investment Products
              </h1>
              <p className="text-secondary-600 mt-1">
                Discover investment opportunities that match your financial goals
              </p>
            </div>
        
          </div>

         

          {/* Additional Stats (Expandable) */}
          {!statsLoading && !statsError && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-secondary-900">
                  Investment Overview
                </h3>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAllStats(!showAllStats)}
                  className="flex items-center gap-2"
                >
                  {showAllStats ? 'Show Less' : 'Show More Stats'}
                  {showAllStats ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <AnimatePresence>
                {showAllStats && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    {/* Active Products */}
                    <Card>
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <Package className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-secondary-500">{formattedStats.activeProducts.label}</p>
                          <p className="text-xl font-semibold text-secondary-900">
                            {formattedStats.activeProducts.value}
                          </p>
                          <p className="text-xs text-purple-600">{formattedStats.activeProducts.description}</p>
                        </div>
                      </div>
                    </Card>

                    {/* Placeholder for future stats */}
                    <Card>
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-secondary-100 rounded-lg">
                          <TrendingUp className="h-6 w-6 text-secondary-600" />
                        </div>
                        <div>
                          <p className="text-sm text-secondary-500">Success Rate</p>
                          <p className="text-xl font-semibold text-secondary-900">98.5%</p>
                          <p className="text-xs text-secondary-600">Investment completion</p>
                        </div>
                      </div>
                    </Card>

                    <Card>
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-secondary-100 rounded-lg">
                          <Target className="h-6 w-6 text-secondary-600" />
                        </div>
                        <div>
                          <p className="text-sm text-secondary-500">Avg. Duration</p>
                          <p className="text-xl font-semibold text-secondary-900">36 months</p>
                          <p className="text-xs text-secondary-600">Investment period</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Products Grid */}
          <ProductGrid onProductClick={handleProductClick} />
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ProductsPage;