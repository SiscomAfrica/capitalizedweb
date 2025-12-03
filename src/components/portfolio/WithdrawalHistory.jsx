import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Calendar,
  DollarSign
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import investmentClient from '../../api/investmentClient';

const WithdrawalHistory = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('requestedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status configuration
  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: 'Pending',
        icon: Clock,
        className: 'bg-warning-100 text-warning-700 border-warning-200',
        description: 'Withdrawal request is being reviewed',
      },
      processing: {
        label: 'Processing',
        icon: RefreshCw,
        className: 'bg-primary-100 text-primary-700 border-primary-200',
        description: 'Withdrawal is being processed',
      },
      completed: {
        label: 'Completed',
        icon: CheckCircle,
        className: 'bg-success-100 text-success-700 border-success-200',
        description: 'Withdrawal has been completed successfully',
      },
      rejected: {
        label: 'Rejected',
        icon: XCircle,
        className: 'bg-error-100 text-error-700 border-error-200',
        description: 'Withdrawal request was rejected',
      },
    };
    return configs[status] || configs.pending;
  };

  // Fetch withdrawals
  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {
        sortBy,
        sortOrder,
      };
      
      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }
      
      const response = await investmentClient.getWithdrawals(filters);
      setWithdrawals(response.data || response || []);
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
      
      if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to view withdrawal history.');
      } else {
        setError('Failed to load withdrawal history. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle retry
  const handleRetry = () => {
    fetchWithdrawals();
  };

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilterStatus(newFilter);
  };

  // Handle sort change
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Load withdrawals on component mount and when filters change
  useEffect(() => {
    fetchWithdrawals();
  }, [filterStatus, sortBy, sortOrder]);

  if (loading) {
    return (
      <Card className="text-center py-12">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-secondary-600">Loading withdrawal history...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <ErrorMessage message={error} onRetry={handleRetry} />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-secondary-900">
          Withdrawal History
        </h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRetry}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters and Sort Controls */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-secondary-500" />
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="text-sm border border-secondary-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-secondary-500" />
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="text-sm border border-secondary-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="requestedAt">Request Date</option>
              <option value="processedAt">Processed Date</option>
              <option value="amount">Amount</option>
              <option value="status">Status</option>
            </select>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Withdrawal List */}
      {withdrawals.length === 0 ? (
        <Card className="text-center py-12">
          <DollarSign className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-secondary-900 mb-2">
            No Withdrawal History
          </h4>
          <p className="text-secondary-600">
            {filterStatus === 'all' 
              ? "You haven't made any withdrawal requests yet."
              : `No withdrawals found with status "${filterStatus}".`
            }
          </p>
          {filterStatus !== 'all' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleFilterChange('all')}
              className="mt-4"
            >
              Show All Withdrawals
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {withdrawals.map((withdrawal, index) => {
            const statusConfig = getStatusConfig(withdrawal.status);
            const StatusIcon = statusConfig.icon;

            return (
              <motion.div
                key={withdrawal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Withdrawal Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${statusConfig.className.split(' ')[0]}`}>
                            <StatusIcon className={`h-4 w-4 ${statusConfig.className.split(' ')[1]}`} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-secondary-900">
                              {formatCurrency(withdrawal.amount)}
                            </h4>
                            <p className="text-sm text-secondary-600">
                              Withdrawal Request #{withdrawal.id}
                            </p>
                          </div>
                        </div>
                        
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.className}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="flex items-center text-secondary-500 mb-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            Requested
                          </div>
                          <div className="font-medium text-secondary-900">
                            {formatDateTime(withdrawal.requestedAt)}
                          </div>
                        </div>

                        {withdrawal.processedAt && (
                          <div>
                            <div className="flex items-center text-secondary-500 mb-1">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Processed
                            </div>
                            <div className="font-medium text-secondary-900">
                              {formatDateTime(withdrawal.processedAt)}
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="flex items-center text-secondary-500 mb-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Status
                          </div>
                          <div className="font-medium text-secondary-900">
                            {statusConfig.description}
                          </div>
                        </div>
                      </div>

                      {/* Reason */}
                      {withdrawal.reason && (
                        <div className="pt-2 border-t border-secondary-100">
                          <div className="text-xs text-secondary-500 mb-1">Reason:</div>
                          <div className="text-sm text-secondary-700 italic">
                            "{withdrawal.reason}"
                          </div>
                        </div>
                      )}

                      {/* Rejection Reason */}
                      {withdrawal.status === 'rejected' && withdrawal.rejectionReason && (
                        <div className="pt-2 border-t border-error-200 bg-error-50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
                          <div className="flex items-start gap-2">
                            <XCircle className="h-4 w-4 text-error-600 mt-0.5" />
                            <div>
                              <div className="text-xs font-medium text-error-700 mb-1">
                                Rejection Reason:
                              </div>
                              <div className="text-sm text-error-700">
                                {withdrawal.rejectionReason}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WithdrawalHistory;