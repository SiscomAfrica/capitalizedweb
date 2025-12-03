import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  Target,
  BarChart3,
  Info
} from 'lucide-react';
import Card from '../common/Card';

const InvestmentDetail = ({ investment }) => {
  if (!investment) {
    return null;
  }

  const {
    id,
    productName,
    amount,
    startDate,
    maturityDate,
    expectedReturn,
    currentValue,
    status,
    paymentSchedule = [],
  } = investment;

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
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate investment progress
  const calculateProgress = () => {
    const start = new Date(startDate);
    const end = new Date(maturityDate);
    const now = new Date();
    
    const totalDuration = end - start;
    const elapsed = now - start;
    
    if (elapsed <= 0) return 0;
    if (elapsed >= totalDuration) return 100;
    
    return Math.round((elapsed / totalDuration) * 100);
  };

  // Calculate returns
  const actualReturns = currentValue - amount;
  const actualReturnPercentage = ((actualReturns / amount) * 100).toFixed(2);
  const expectedReturnPercentage = ((expectedReturn / amount) * 100).toFixed(2);
  const isPositiveReturn = actualReturns >= 0;

  // Get status configuration
  const getStatusConfig = (status) => {
    const configs = {
      active: {
        label: 'Active Investment',
        icon: Clock,
        className: 'bg-primary-100 text-primary-700 border-primary-200',
        description: 'Your investment is currently active and generating returns.',
      },
      matured: {
        label: 'Matured',
        icon: CheckCircle,
        className: 'bg-success-100 text-success-700 border-success-200',
        description: 'Your investment has reached maturity. Returns are available for withdrawal.',
      },
      withdrawn: {
        label: 'Withdrawn',
        icon: XCircle,
        className: 'bg-secondary-100 text-secondary-700 border-secondary-200',
        description: 'Investment has been withdrawn and closed.',
      },
    };
    return configs[status] || configs.active;
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;
  const progress = calculateProgress();

  // Get payment status icon
  const getPaymentStatusIcon = (paymentStatus) => {
    switch (paymentStatus) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-success-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning-600" />;
      default:
        return <Clock className="h-4 w-4 text-secondary-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Investment Header */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900 mb-2">
              {productName}
            </h2>
            <p className="text-secondary-600">Investment ID: {id}</p>
          </div>
          
          <div className={`inline-flex items-center px-4 py-2 rounded-lg border ${statusConfig.className}`}>
            <StatusIcon className="h-5 w-5 mr-2" />
            <span className="font-medium">{statusConfig.label}</span>
          </div>
        </div>

        <div className="bg-secondary-50 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-secondary-500 mt-0.5" />
            <p className="text-sm text-secondary-700">{statusConfig.description}</p>
          </div>
        </div>

        {/* Investment Progress */}
        {status === 'active' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-secondary-700">Investment Progress</span>
              <span className="text-sm text-secondary-600">{progress}% Complete</span>
            </div>
            <div className="w-full bg-secondary-200 rounded-full h-2">
              <motion.div
                className="bg-primary-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between text-xs text-secondary-500 mt-1">
              <span>Started: {formatDate(startDate)}</span>
              <span>Matures: {formatDate(maturityDate)}</span>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-secondary-50 rounded-lg">
            <DollarSign className="h-6 w-6 text-secondary-600 mx-auto mb-2" />
            <div className="text-sm text-secondary-600 mb-1">Initial Investment</div>
            <div className="text-lg font-bold text-secondary-900">{formatCurrency(amount)}</div>
          </div>

          <div className="text-center p-4 bg-primary-50 rounded-lg">
            <BarChart3 className="h-6 w-6 text-primary-600 mx-auto mb-2" />
            <div className="text-sm text-secondary-600 mb-1">Current Value</div>
            <div className="text-lg font-bold text-primary-900">{formatCurrency(currentValue)}</div>
          </div>

          <div className="text-center p-4 bg-success-50 rounded-lg">
            <Target className="h-6 w-6 text-success-600 mx-auto mb-2" />
            <div className="text-sm text-secondary-600 mb-1">Expected Return</div>
            <div className="text-lg font-bold text-success-900">{formatCurrency(expectedReturn)}</div>
          </div>

          <div className={`text-center p-4 rounded-lg ${isPositiveReturn ? 'bg-success-50' : 'bg-error-50'}`}>
            <TrendingUp className={`h-6 w-6 mx-auto mb-2 ${isPositiveReturn ? 'text-success-600' : 'text-error-600'}`} />
            <div className="text-sm text-secondary-600 mb-1">Actual Returns</div>
            <div className={`text-lg font-bold ${isPositiveReturn ? 'text-success-900' : 'text-error-900'}`}>
              {formatCurrency(actualReturns)}
            </div>
            <div className={`text-xs ${isPositiveReturn ? 'text-success-700' : 'text-error-700'}`}>
              ({isPositiveReturn ? '+' : ''}{actualReturnPercentage}%)
            </div>
          </div>
        </div>
      </Card>

      {/* Projected Returns Comparison */}
      <Card>
        <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Return Analysis
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
            <span className="text-sm font-medium text-secondary-700">Expected Return Rate</span>
            <span className="text-sm font-bold text-secondary-900">{expectedReturnPercentage}%</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
            <span className="text-sm font-medium text-secondary-700">Actual Return Rate</span>
            <span className={`text-sm font-bold ${isPositiveReturn ? 'text-success-900' : 'text-error-900'}`}>
              {actualReturnPercentage}%
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
            <span className="text-sm font-medium text-secondary-700">Performance vs Expected</span>
            <span className={`text-sm font-bold ${actualReturns >= expectedReturn ? 'text-success-900' : 'text-warning-900'}`}>
              {actualReturns >= expectedReturn ? 'Outperforming' : 'Underperforming'}
            </span>
          </div>
        </div>
      </Card>

      {/* Payment Schedule */}
      {paymentSchedule && paymentSchedule.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Payment Schedule
          </h3>
          
          <div className="space-y-3">
            {paymentSchedule.map((payment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getPaymentStatusIcon(payment.status)}
                  <div>
                    <div className="font-medium text-secondary-900">
                      {formatDate(payment.date)}
                    </div>
                    <div className="text-sm text-secondary-600 capitalize">
                      {payment.status} Payment
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-secondary-900">
                    {formatCurrency(payment.amount)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-primary-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-primary-900">Total Scheduled</span>
              <span className="font-bold text-primary-900">
                {formatCurrency(paymentSchedule.reduce((sum, payment) => sum + payment.amount, 0))}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Investment Timeline */}
      <Card>
        <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Investment Timeline
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-success-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-success-600" />
            <div>
              <div className="font-medium text-success-900">Investment Started</div>
              <div className="text-sm text-success-700">{formatDate(startDate)}</div>
            </div>
          </div>
          
          {status === 'active' && (
            <div className="flex items-center gap-4 p-3 bg-primary-50 rounded-lg">
              <Clock className="h-5 w-5 text-primary-600" />
              <div>
                <div className="font-medium text-primary-900">Currently Active</div>
                <div className="text-sm text-primary-700">{progress}% of investment period completed</div>
              </div>
            </div>
          )}
          
          <div className={`flex items-center gap-4 p-3 rounded-lg ${status === 'matured' ? 'bg-success-50' : 'bg-secondary-50'}`}>
            {status === 'matured' ? (
              <CheckCircle className="h-5 w-5 text-success-600" />
            ) : (
              <Calendar className="h-5 w-5 text-secondary-600" />
            )}
            <div>
              <div className={`font-medium ${status === 'matured' ? 'text-success-900' : 'text-secondary-900'}`}>
                {status === 'matured' ? 'Investment Matured' : 'Maturity Date'}
              </div>
              <div className={`text-sm ${status === 'matured' ? 'text-success-700' : 'text-secondary-700'}`}>
                {formatDate(maturityDate)}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InvestmentDetail;