import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Plus, Eye, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import PortfolioSummary from '../../components/portfolio/PortfolioSummary';
import InvestmentList from '../../components/portfolio/InvestmentList';
import InvestmentDetail from '../../components/portfolio/InvestmentDetail';
import WithdrawalForm from '../../components/portfolio/WithdrawalForm';
import WithdrawalHistory from '../../components/portfolio/WithdrawalHistory';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import investmentClient from '../../api/investmentClient';
import { SUCCESS_MESSAGES } from '../../utils/constants';

const PortfolioPage = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [showInvestmentDetail, setShowInvestmentDetail] = useState(false);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(null);

  // Fetch portfolio data
  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await investmentClient.getPortfolio();
      setPortfolio(response.data || response);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      
      if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to view this portfolio.');
      } else {
        setError('Failed to load portfolio data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle retry
  const handleRetry = () => {
    fetchPortfolio();
  };

  // Handle view investment details
  const handleViewInvestmentDetails = (investment) => {
    setSelectedInvestment(investment);
    setShowInvestmentDetail(true);
  };

  // Handle close investment detail modal
  const handleCloseInvestmentDetail = () => {
    setShowInvestmentDetail(false);
    setSelectedInvestment(null);
  };

  // Handle open withdrawal form
  const handleOpenWithdrawalForm = () => {
    setShowWithdrawalForm(true);
  };

  // Handle close withdrawal form
  const handleCloseWithdrawalForm = () => {
    setShowWithdrawalForm(false);
    setWithdrawalSuccess(null);
  };

  // Handle withdrawal success
  const handleWithdrawalSuccess = (withdrawalId) => {
    setWithdrawalSuccess(withdrawalId);
    setShowWithdrawalForm(false);
    
    // Refresh portfolio data to update available balance
    fetchPortfolio();
    
    // Show success message for 5 seconds
    setTimeout(() => {
      setWithdrawalSuccess(null);
    }, 5000);
  };

  // Load portfolio on component mount
  useEffect(() => {
    fetchPortfolio();
  }, []);

  // Page animation variants
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.4,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-secondary-600">Loading your portfolio...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="max-w-4xl mx-auto">
            <Card>
              <ErrorMessage message={error} onRetry={handleRetry} />
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const hasInvestments = portfolio?.investments && portfolio.investments.length > 0;
  const availableBalance = portfolio?.availableForWithdrawal || 0;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <motion.div
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto space-y-6"
        >
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">Portfolio</h1>
              <p className="text-secondary-600">
                Track your investments and manage withdrawals
              </p>
            </div>
            
            {hasInvestments && availableBalance > 0 && (
              <Button
                onClick={handleOpenWithdrawalForm}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Request Withdrawal
              </Button>
            )}
          </div>

          {/* Withdrawal Success Message */}
          {withdrawalSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-success-50 border-success-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-success-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-success-900">
                      {SUCCESS_MESSAGES.WITHDRAWAL_REQUESTED}
                    </h4>
                    <p className="text-sm text-success-700">
                      Request ID: {withdrawalSuccess}. You will receive an email confirmation shortly.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Portfolio Summary */}
            {hasInvestments && (
              <motion.div variants={itemVariants}>
                <PortfolioSummary portfolio={portfolio} />
              </motion.div>
            )}

            {/* Empty State */}
            {!hasInvestments ? (
              <motion.div variants={itemVariants}>
                <Card className="text-center py-16">
                  <TrendingUp className="h-16 w-16 text-secondary-400 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                    Start Your Investment Journey
                  </h2>
                  <p className="text-secondary-600 mb-8 max-w-md mx-auto">
                    You don't have any investments yet. Browse our available products 
                    to start building your portfolio and generating returns.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={() => window.location.href = '/products'}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Browse Investment Products
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => window.location.href = '/dashboard'}
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <>
                {/* Investment List */}
                <motion.div variants={itemVariants}>
                  <Card>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-secondary-900">
                        Your Investments
                      </h2>
                      <span className="text-sm text-secondary-600">
                        {portfolio.investments.length} investment{portfolio.investments.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <InvestmentList
                      investments={portfolio.investments}
                      onViewDetails={handleViewInvestmentDetails}
                    />
                  </Card>
                </motion.div>

                {/* Withdrawal History */}
                <motion.div variants={itemVariants}>
                  <WithdrawalHistory />
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Investment Detail Modal */}
          <Modal
            isOpen={showInvestmentDetail}
            onClose={handleCloseInvestmentDetail}
            title="Investment Details"
            size="lg"
          >
            {selectedInvestment && (
              <InvestmentDetail investment={selectedInvestment} />
            )}
          </Modal>

          {/* Withdrawal Form Modal */}
          <Modal
            isOpen={showWithdrawalForm}
            onClose={handleCloseWithdrawalForm}
            title="Request Withdrawal"
            size="md"
          >
            <WithdrawalForm
              availableBalance={availableBalance}
              onSuccess={handleWithdrawalSuccess}
              onCancel={handleCloseWithdrawalForm}
            />
          </Modal>
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default PortfolioPage;