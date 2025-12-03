import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Wallet, 
  FileText, 
  CreditCard, 
  ArrowRight,
  Plus,
  Eye,
  Settings,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

// Components
import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

// Hooks and API
import useAuth from '../../hooks/useAuth';
import investmentClient from '../../api/investmentClient';
import subscriptionClient from '../../api/subscriptionClient';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    portfolio: null,
    inquiries: [],
    subscription: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch portfolio, inquiries, and subscription data in parallel
        const [portfolioResponse, inquiriesResponse, subscriptionResponse] = await Promise.allSettled([
          investmentClient.getPortfolio(),
          investmentClient.getInquiries(),
          subscriptionClient.getMySubscription()
        ]);

        setDashboardData({
          portfolio: portfolioResponse.status === 'fulfilled' ? portfolioResponse.value : null,
          inquiries: inquiriesResponse.status === 'fulfilled' ? inquiriesResponse.value : [],
          subscription: subscriptionResponse.status === 'fulfilled' ? subscriptionResponse.value : null
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Handle retry
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Re-trigger useEffect
    window.location.reload();
  };

  // Navigation handlers
  const handleBrowseProducts = () => {
    navigate('/investments/products');
  };

  const handleViewPortfolio = () => {
    navigate('/portfolio');
  };

  const handleManageSubscription = () => {
    navigate('/subscriptions/plans');
  };

  const handleViewInquiries = () => {
    navigate('/investments/inquiries');
  };

  // Calculate summary stats
  const portfolioSummary = dashboardData.portfolio ? {
    totalInvested: dashboardData.portfolio.totalInvested || 0,
    currentValue: dashboardData.portfolio.currentValue || 0,
    totalReturns: dashboardData.portfolio.totalReturns || 0,
    roi: dashboardData.portfolio.roi || 0,
    investmentCount: dashboardData.portfolio.investments?.length || 0
  } : null;

  const pendingInquiries = dashboardData.inquiries.filter(inquiry => inquiry.status === 'pending');
  const subscriptionStatus = dashboardData.subscription?.status || 'none';

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-96">
            <LoadingSpinner size="lg" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-96">
            <ErrorMessage message={error} onRetry={handleRetry} />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">
                Welcome back, {user?.full_name?.split(' ')[0] || user?.firstName || 'User'}!
              </h1>
              <p className="text-secondary-600 mt-1">
                Here's an overview of your investment journey
              </p>
            </div>
            
            {/* KYC Status Badge */}
            {user?.kyc_status && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                user.kyc_status === 'approved' 
                  ? 'bg-success-100 text-success-700'
                  : user.kyc_status === 'pending'
                  ? 'bg-warning-100 text-warning-700'
                  : 'bg-danger-100 text-danger-700'
              }`}>
                {user.kyc_status === 'approved' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                KYC {user.kyc_status}
              </div>
            )}
          </div>



          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Portfolio Summary */}
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary-100 rounded-lg">
                      <Wallet className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900">Portfolio</h3>
                      <p className="text-sm text-secondary-500">
                        {portfolioSummary?.investmentCount || 0} investments
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-secondary-600">Total Value</span>
                      <span className="font-semibold text-secondary-900">
                        ${(portfolioSummary?.currentValue || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-secondary-600">Returns</span>
                      <span className={`font-semibold ${
                        (portfolioSummary?.totalReturns || 0) >= 0 
                          ? 'text-success-600' 
                          : 'text-danger-600'
                      }`}>
                        {(portfolioSummary?.totalReturns || 0) >= 0 ? '+' : ''}
                        ${(portfolioSummary?.totalReturns || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-secondary-600">ROI</span>
                      <span className={`font-semibold ${
                        (portfolioSummary?.roi || 0) >= 0 
                          ? 'text-success-600' 
                          : 'text-danger-600'
                      }`}>
                        {(portfolioSummary?.roi || 0).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={handleViewPortfolio}
                className="w-full mt-4"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Portfolio
              </Button>
            </Card>

            {/* Active Subscription */}
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-success-100 rounded-lg">
                      <CreditCard className="h-6 w-6 text-success-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900">Subscription</h3>
                      <p className="text-sm text-secondary-500">
                        {subscriptionStatus === 'active' ? 'Active Plan' : 
                         subscriptionStatus === 'trial' ? 'Trial Period' :
                         'No Active Plan'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {dashboardData.subscription ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-secondary-600">Plan</span>
                          <span className="font-semibold text-secondary-900">
                            {dashboardData.subscription.planName}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-secondary-600">Status</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            subscriptionStatus === 'active' 
                              ? 'bg-success-100 text-success-700'
                              : subscriptionStatus === 'trial'
                              ? 'bg-primary-100 text-primary-700'
                              : 'bg-secondary-100 text-secondary-700'
                          }`}>
                            {subscriptionStatus}
                          </span>
                        </div>
                        {dashboardData.subscription.renewalDate && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-secondary-600">Renewal</span>
                            <span className="text-sm text-secondary-900">
                              {new Date(dashboardData.subscription.renewalDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-secondary-600">
                        Subscribe to unlock premium features and enhanced investment opportunities.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={handleManageSubscription}
                className="w-full mt-4"
              >
                <Settings className="h-4 w-4 mr-2" />
                {dashboardData.subscription ? 'Manage Subscription' : 'View Plans'}
              </Button>
            </Card>

            {/* Pending Inquiries */}
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-warning-100 rounded-lg">
                      <FileText className="h-6 w-6 text-warning-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900">Inquiries</h3>
                      <p className="text-sm text-secondary-500">
                        {pendingInquiries.length} pending
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {pendingInquiries.length > 0 ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-secondary-600">Total Amount</span>
                          <span className="font-semibold text-secondary-900">
                            ${pendingInquiries.reduce((sum, inquiry) => sum + inquiry.amount, 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-secondary-600">Latest</span>
                          <span className="text-sm text-secondary-900">
                            {pendingInquiries[0]?.productName || 'N/A'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-secondary-600">
                        No pending inquiries. Browse products to start investing.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={handleViewInquiries}
                className="w-full mt-4"
              >
                <FileText className="h-4 w-4 mr-2" />
                View Inquiries
              </Button>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-secondary-900">Quick Actions</h2>
                <p className="text-sm text-secondary-600">
                  Get started with your investment journey
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <Button
                variant="primary"
                onClick={handleBrowseProducts}
                className="flex items-center justify-center gap-3 p-6 h-auto"
              >
                <div className="p-3 bg-white/20 rounded-lg">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Browse Products</div>
                  <div className="text-sm opacity-90">Discover investment opportunities</div>
                </div>
                <ArrowRight className="h-5 w-5 ml-auto" />
              </Button>

              <Button
                variant="secondary"
                onClick={handleViewPortfolio}
                className="flex items-center justify-center gap-3 p-6 h-auto"
              >
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Wallet className="h-6 w-6 text-primary-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">View Portfolio</div>
                  <div className="text-sm text-secondary-600">Track your investments</div>
                </div>
                <ArrowRight className="h-5 w-5 ml-auto text-secondary-400" />
              </Button>

              <Button
                variant="secondary"
                onClick={handleManageSubscription}
                className="flex items-center justify-center gap-3 p-6 h-auto"
              >
                <div className="p-3 bg-success-100 rounded-lg">
                  <Plus className="h-6 w-6 text-success-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Manage Subscription</div>
                  <div className="text-sm text-secondary-600">Upgrade your plan</div>
                </div>
                <ArrowRight className="h-5 w-5 ml-auto text-secondary-400" />
              </Button>
            </div>
          </Card>
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardPage;