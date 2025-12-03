import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Calculator, AlertCircle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import investmentClient from '../../api/investmentClient';
import { 
  formatCurrency, 
  formatPercentage, 
  parseProductData 
} from '../../utils/investmentHelpers';
import useAuth from '../../hooks/useAuth';

const InquiryForm = ({ product, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projectedReturns, setProjectedReturns] = useState(0);

  // Parse product data to ensure consistent format
  const productData = parseProductData(product);
  
  // Get authentication state
  const { user, isAuthenticated, getAccessToken } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    setValue,
    clearErrors
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      amount: productData.minimumInvestment || '',
      phone: '',
      message: ''
    }
  });

  const watchedAmount = watch('amount');

  // Calculate projected returns
  useEffect(() => {
    const amount = parseFloat(watchedAmount) || 0;
    if (amount > 0 && productData.expectedAnnualReturn) {
      setProjectedReturns((amount * productData.expectedAnnualReturn) / 100);
    } else {
      setProjectedReturns(0);
    }
  }, [watchedAmount, productData.expectedAnnualReturn]);

  // Validation rules
  const amountValidation = {
    required: 'Investment amount is required',
    min: {
      value: product?.minimumInvestment || 1000,
      message: `Minimum investment is ${formatCurrency(product?.minimumInvestment || 1000)}`
    },
    max: productData.maximumInvestment > 0 ? {
      value: productData.maximumInvestment,
      message: `Maximum investment is ${formatCurrency(productData.maximumInvestment)}`
    } : undefined,
    validate: {
      isNumber: (value) => {
        const num = parseFloat(value);
        return !isNaN(num) && num > 0 || 'Please enter a valid amount';
      }
    }
  };

  // Phone validation rules
  const phoneValidation = {
    pattern: {
      value: /^[\+]?[1-9][\d]{0,15}$/,
      message: 'Please enter a valid phone number'
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);

      // Debug authentication
      const token = getAccessToken();
      const storedToken = localStorage.getItem('africa_access_token');
      
      console.log('Authentication check:', {
        isAuthenticated,
        hasUser: !!user,
        hasToken: !!token,
        hasStoredToken: !!storedToken,
        tokenMatch: token === storedToken,
        userId: user?.id,
        userEmail: user?.email,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
      });

      if (!isAuthenticated || !token) {
        setError('You must be logged in to create an investment inquiry. Please refresh the page and try again.');
        return;
      }

      const inquiryData = {
        productId: productData.id,
        amount: parseFloat(data.amount),
        currency: 'USD',
        durationMonths: productData.duration || 0,
        message: data.message || '',
        phone: data.phone || '',
      };

      const response = await investmentClient.createInquiry(inquiryData);
      
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (err) {
      console.error('Error creating inquiry:', err);
      
      // Better error handling
      let errorMessage = 'Failed to create investment inquiry';
      
      if (err.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err.data?.detail) {
        errorMessage = err.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle amount input formatting
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setValue('amount', value);
    if (errors.amount) {
      clearErrors('amount');
    }
  };

  // Quick amount buttons
  const quickAmounts = [
    product?.minimumInvestment,
    product?.minimumInvestment * 2,
    product?.minimumInvestment * 5,
    product?.maximumInvestment
  ].filter(Boolean).filter((amount, index, arr) => arr.indexOf(amount) === index);

  const handleQuickAmount = (amount) => {
    setValue('amount', amount.toString());
    clearErrors('amount');
  };

  if (!product) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
        <p className="text-secondary-600">Product information not available</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Authentication Debug Info (temporary) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="bg-blue-50 border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Debug: Authentication Status</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
            <p>User: {user ? `✅ ${user.email || user.id}` : '❌ No user'}</p>
            <p>Token: {getAccessToken() ? '✅ Present' : '❌ Missing'}</p>
          </div>
        </Card>
      )}

      {/* Product Summary */}
      <Card>
        <div className="flex items-start gap-4">
          <img
            src={productData.featuredImage}
            alt={productData.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-secondary-900 mb-1">
              {productData.name}
            </h3>
            <p className="text-sm text-secondary-600 mb-2">
              {productData.investmentType.replace('-', ' ')} • {productData.duration} {productData.duration === 1 ? 'month' : 'months'}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-success-600 font-medium">
                {formatPercentage(productData.expectedAnnualReturn)} expected return
              </span>
              <span className="text-secondary-500">
                Medium risk
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Investment Form */}
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Investment Amount
            </h3>

            {/* Amount Input */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  {...register('amount', amountValidation)}
                  type="text"
                  placeholder="Enter investment amount"
                  onChange={handleAmountChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.amount
                      ? 'border-error-300 text-error-900 placeholder-error-300'
                      : 'border-secondary-300 text-secondary-900'
                  }`}
                />
              </div>

              {errors.amount && (
                <p className="text-sm text-error-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.amount.message}
                </p>
              )}

              {/* Investment Range */}
              <div className="flex items-center justify-between text-sm text-secondary-600">
                <span>Min: {formatCurrency(productData.minimumInvestment)}</span>
                {productData.maximumInvestment > 0 && (
                  <span>Max: {formatCurrency(productData.maximumInvestment)}</span>
                )}
              </div>

              {/* Quick Amount Buttons */}
              {quickAmounts.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-secondary-700 mb-2">
                    Quick amounts:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {quickAmounts.map((amount, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleQuickAmount(amount)}
                        className="px-3 py-1 text-sm border border-secondary-300 rounded-lg hover:border-primary-500 hover:text-primary-600 transition-colors"
                      >
                        {formatCurrency(amount)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Fields */}
              <div className="space-y-4">
                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    {...register('phone', phoneValidation)}
                    type="tel"
                    placeholder="Enter your phone number"
                    className="w-full px-3 py-3 border border-secondary-300 rounded-lg text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errors.phone && (
                    <p className="text-sm text-error-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    {...register('message')}
                    placeholder="Any additional information or questions..."
                    rows={3}
                    className="w-full px-3 py-3 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Calculation Preview */}
          {watchedAmount && !errors.amount && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-primary-50 border-primary-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Calculator className="h-5 w-5 text-primary-600" />
                  </div>
                  <h4 className="font-semibold text-primary-900">
                    Investment Projection
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-primary-600 mb-1">Investment Amount</p>
                    <p className="text-lg font-semibold text-primary-900">
                      {formatCurrency(parseFloat(watchedAmount) || 0)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-primary-600 mb-1">Expected Return</p>
                    <p className="text-lg font-semibold text-success-600">
                      {formatCurrency(projectedReturns)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-primary-600 mb-1">Total Value</p>
                    <p className="text-lg font-semibold text-primary-900">
                      {formatCurrency((parseFloat(watchedAmount) || 0) + projectedReturns)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-primary-100 rounded-lg">
                  <p className="text-xs text-primary-700 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Projected return of {formatPercentage(productData.expectedAnnualReturn)} over {productData.duration} {productData.duration === 1 ? 'month' : 'months'}
                  </p>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-error-600" />
                <p className="text-sm text-error-700">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={!isValid || loading}
              className="flex-1"
            >
              {loading ? 'Creating Inquiry...' : 'Create Investment Inquiry'}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
            )}
          </div>

          {/* Disclaimer */}
          <div className="p-4 bg-secondary-50 border border-secondary-200 rounded-lg">
            <p className="text-xs text-secondary-600">
              <strong>Disclaimer:</strong> This is an investment inquiry, not a final commitment. 
              You will receive payment instructions and terms after submitting this form. 
              All investments carry risk and projected returns are not guaranteed.
            </p>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};

export default InquiryForm;