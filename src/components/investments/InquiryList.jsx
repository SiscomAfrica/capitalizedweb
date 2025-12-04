import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  SortAsc, 
  SortDesc, 
  RefreshCw, 
  AlertCircle, 
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Copy,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import investmentClient from '../../api/investmentClient';
import useAuth from '../../hooks/useAuth';

const InquiryList = ({ onInquiryClick }) => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Status options
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'new', label: 'New Inquiry' },
    { value: 'pending', label: 'Pending Payment' },
    { value: 'paid', label: 'Paid' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'amount', label: 'Amount' },
    { value: 'productName', label: 'Product Name' },
    { value: 'status', label: 'Status' }
  ];

  // Fetch inquiries
  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user's email for filtering inquiries
      const userEmail = user?.email;
      
      if (!userEmail) {
        setError('Please log in to view your inquiries');
        setInquiries([]);
        return;
      }
      
      const response = await investmentClient.getInquiries({
        email: userEmail,
        status: filters.status || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });
      
      setInquiries(response || []);
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      setError(err.response?.data?.message || 'Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering and sorting
  const filteredAndSortedInquiries = useMemo(() => {
    let filtered = [...inquiries];

    // Apply client-side filters
    if (filters.status) {
      filtered = filtered.filter(inquiry => inquiry.status === filters.status);
    }

    // Apply client-side sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      // Handle date sorting
      if (filters.sortBy === 'createdAt') {
        aValue = new Date(a.created_at || a.createdAt);
        bValue = new Date(b.created_at || b.createdAt);
      } else {
        // Map camelCase to snake_case for API fields
        const fieldMap = {
          'amount': 'investment_amount',
          'productName': 'product_name',
          'status': 'status'
        };
        const apiField = fieldMap[filters.sortBy] || filters.sortBy;
        aValue = a[apiField] || a[filters.sortBy];
        bValue = b[apiField] || b[filters.sortBy];
      }

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
  }, [inquiries, filters]);

  // Load inquiries when user email is available or filters change
  useEffect(() => {
    if (user?.email) {
      fetchInquiries();
    }
  }, [user?.email, filters.status, filters.sortBy, filters.sortOrder]);

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
      status: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  // Handle retry
  const handleRetry = () => {
    fetchInquiries();
  };

  // Format currency with validation
  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '$0';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  // Format date with validation
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      console.error('Date formatting error:', error, 'for date:', dateString);
      return 'Invalid date';
    }
  };

  // Get status details
  const getStatusDetails = (status) => {
    switch (status) {
      case 'new':
        return {
          color: 'text-blue-700',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-200',
          icon: Clock,
          label: 'New Inquiry'
        };
      case 'pending':
        return {
          color: 'text-warning-700',
          bgColor: 'bg-warning-100',
          borderColor: 'border-warning-200',
          icon: Clock,
          label: 'Pending Payment'
        };
      case 'paid':
        return {
          color: 'text-success-700',
          bgColor: 'bg-success-100',
          borderColor: 'border-success-200',
          icon: CheckCircle,
          label: 'Paid'
        };
      case 'cancelled':
        return {
          color: 'text-error-700',
          bgColor: 'bg-error-100',
          borderColor: 'border-error-200',
          icon: XCircle,
          label: 'Cancelled'
        };
      default:
        return {
          color: 'text-secondary-700',
          bgColor: 'bg-secondary-100',
          borderColor: 'border-secondary-200',
          icon: AlertCircle,
          label: status || 'Unknown'
        };
    }
  };

  // Copy payment reference
  const copyPaymentReference = async (reference) => {
    try {
      await navigator.clipboard.writeText(reference);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle inquiry click
  const handleInquiryClick = (inquiry) => {
    if (onInquiryClick) {
      onInquiryClick(inquiry);
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
          
          {filters.status && (
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
            className="px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
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
          {filteredAndSortedInquiries.length} {filteredAndSortedInquiries.length === 1 ? 'inquiry' : 'inquiries'} found
        </p>
      </div>

      {/* Inquiries List */}
      {filteredAndSortedInquiries.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            No inquiries found
          </h3>
          <p className="text-secondary-600 mb-4">
            {filters.status 
              ? 'Try adjusting your filters or create a new investment inquiry.'
              : 'You haven\'t created any investment inquiries yet.'
            }
          </p>
          <Button
            variant="secondary"
            onClick={resetFilters}
          >
            {filters.status ? 'Clear Filters' : 'Browse Products'}
          </Button>
        </div>
      ) : (
        <motion.div layout className="space-y-4">
          <AnimatePresence>
            {filteredAndSortedInquiries.map((inquiry, index) => {
              const statusDetails = getStatusDetails(inquiry.status);
              const StatusIcon = statusDetails.icon;

              return (
                <motion.div
                  key={inquiry.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.05
                  }}
                >
                  <Card
                    onClick={() => handleInquiryClick(inquiry)}
                    className="hover:shadow-medium transition-shadow duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-secondary-900 mb-1">
                              {inquiry.investment_slug ? inquiry.investment_slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Investment Product'}
                            </h3>
                            <p className="text-sm text-secondary-600">
                              Created on {formatDate(inquiry.created_at || inquiry.createdAt)}
                            </p>
                          </div>
                          
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusDetails.bgColor} ${statusDetails.color} ${statusDetails.borderColor}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusDetails.label}
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <span className="text-secondary-500">Amount: </span>
                              <span className="font-semibold text-secondary-900">
                                {formatCurrency(inquiry.investment_amount)}
                              </span>
                              <span className="text-secondary-500">({inquiry.currency || 'USD'})</span>
                            </div>
                            {inquiry.total_expected_return && (
                              <div className="flex items-center gap-1">
                                <span className="text-secondary-500">Expected Return: </span>
                                <span className="font-semibold text-success-600">
                                  {formatCurrency(inquiry.total_expected_return)}
                                </span>
                              </div>
                            )}
                            {inquiry.duration_months && (
                              <div className="flex items-center gap-1">
                                <span className="text-secondary-500">Duration: </span>
                                <span className="text-secondary-700">
                                  {inquiry.duration_months} months
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {inquiry.paymentReference && (
                            <div className="flex items-center gap-2">
                              <span className="text-secondary-500">Ref: </span>
                              <code className="text-xs bg-secondary-100 px-2 py-1 rounded">
                                {inquiry.paymentReference}
                              </code>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyPaymentReference(inquiry.paymentReference);
                                }}
                                className="text-secondary-400 hover:text-secondary-600 transition-colors"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Payment Instructions */}
                        {inquiry.status === 'pending' && inquiry.paymentInstructions && (
                          <div className="mt-3 p-3 bg-warning-50 border border-warning-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <CreditCard className="h-4 w-4 text-warning-600 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-warning-800 mb-1">
                                  Payment Instructions
                                </p>
                                <p className="text-xs text-warning-700">
                                  {inquiry.paymentInstructions}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInquiryClick(inquiry);
                          }}
                          className="flex items-center gap-1"
                        >
                          View Details
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default InquiryList;