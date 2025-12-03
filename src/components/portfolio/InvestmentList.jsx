import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Filter, 
  ArrowUpDown,
  Eye,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const InvestmentList = ({ investments = [], onViewDetails }) => {
  const [sortBy, setSortBy] = useState('startDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');

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

  // Get status badge configuration
  const getStatusConfig = (status) => {
    const configs = {
      active: {
        label: 'Active',
        icon: Clock,
        className: 'bg-primary-100 text-primary-700 border-primary-200',
      },
      matured: {
        label: 'Matured',
        icon: CheckCircle,
        className: 'bg-success-100 text-success-700 border-success-200',
      },
      withdrawn: {
        label: 'Withdrawn',
        icon: XCircle,
        className: 'bg-secondary-100 text-secondary-700 border-secondary-200',
      },
    };
    return configs[status] || configs.active;
  };

  // Filter and sort investments
  const processedInvestments = useMemo(() => {
    let filtered = investments;

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(investment => investment.status === filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'startDate':
          aValue = new Date(a.startDate);
          bValue = new Date(b.startDate);
          break;
        case 'maturityDate':
          aValue = new Date(a.maturityDate);
          bValue = new Date(b.maturityDate);
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'productName':
          aValue = a.productName.toLowerCase();
          bValue = b.productName.toLowerCase();
          break;
        case 'currentValue':
          aValue = a.currentValue;
          bValue = b.currentValue;
          break;
        default:
          aValue = a.startDate;
          bValue = b.startDate;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [investments, sortBy, sortOrder, filterStatus]);

  // Handle sort change
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Handle view details
  const handleViewDetails = (investment) => {
    onViewDetails?.(investment);
  };

  if (investments.length === 0) {
    return (
      <Card className="text-center py-12">
        <TrendingUp className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-secondary-900 mb-2">
          No Investments Yet
        </h3>
        <p className="text-secondary-600 mb-4">
          Start your investment journey by browsing our available products.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Sort Controls */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-secondary-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm border border-secondary-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="matured">Matured</option>
              <option value="withdrawn">Withdrawn</option>
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
              <option value="startDate">Start Date</option>
              <option value="maturityDate">Maturity Date</option>
              <option value="amount">Amount</option>
              <option value="productName">Product Name</option>
              <option value="currentValue">Current Value</option>
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

      {/* Investment List */}
      <div className="space-y-3">
        {processedInvestments.map((investment, index) => {
          const statusConfig = getStatusConfig(investment.status);
          const StatusIcon = statusConfig.icon;
          const returns = investment.currentValue - investment.amount;
          const returnPercentage = ((returns / investment.amount) * 100).toFixed(2);
          const isPositiveReturn = returns >= 0;

          return (
            <motion.div
              key={investment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                onClick={() => handleViewDetails(investment)}
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Investment Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="font-semibold text-secondary-900">
                        {investment.productName}
                      </h3>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.className}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="flex items-center text-secondary-500 mb-1">
                          <DollarSign className="h-3 w-3 mr-1" />
                          Invested
                        </div>
                        <div className="font-medium text-secondary-900">
                          {formatCurrency(investment.amount)}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center text-secondary-500 mb-1">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Current Value
                        </div>
                        <div className="font-medium text-secondary-900">
                          {formatCurrency(investment.currentValue)}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center text-secondary-500 mb-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          Start Date
                        </div>
                        <div className="font-medium text-secondary-900">
                          {formatDate(investment.startDate)}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center text-secondary-500 mb-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          Maturity Date
                        </div>
                        <div className="font-medium text-secondary-900">
                          {formatDate(investment.maturityDate)}
                        </div>
                      </div>
                    </div>

                    {/* Returns Information */}
                    <div className="flex items-center justify-between pt-2 border-t border-secondary-100">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-xs text-secondary-500">Returns: </span>
                          <span className={`font-medium ${isPositiveReturn ? 'text-success-600' : 'text-error-600'}`}>
                            {formatCurrency(returns)} ({isPositiveReturn ? '+' : ''}{returnPercentage}%)
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(investment);
                        }}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {processedInvestments.length === 0 && filterStatus !== 'all' && (
        <Card className="text-center py-8">
          <Filter className="h-8 w-8 text-secondary-400 mx-auto mb-2" />
          <p className="text-secondary-600">
            No investments found with status "{filterStatus}".
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFilterStatus('all')}
            className="mt-2"
          >
            Clear Filter
          </Button>
        </Card>
      )}
    </div>
  );
};

export default InvestmentList;