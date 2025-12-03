import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, AlertCircle, CheckCircle, Info } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import investmentClient from '../../api/investmentClient';

const WithdrawalForm = ({ availableBalance = 0, onSuccess, onCancel }) => {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Parse currency input
  const parseCurrency = (value) => {
    // Remove currency symbols and commas, keep only numbers and decimal point
    const cleaned = value.replace(/[^\d.]/g, '');
    return parseFloat(cleaned) || 0;
  };

  // Format input value for display
  const formatInputValue = (value) => {
    if (!value) return '';
    const numericValue = parseCurrency(value);
    return numericValue.toLocaleString('en-KE');
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const numericAmount = parseCurrency(amount);

    if (!amount || numericAmount <= 0) {
      newErrors.amount = 'Please enter a valid withdrawal amount';
    } else if (numericAmount > availableBalance) {
      newErrors.amount = `Amount cannot exceed available balance of ${formatCurrency(availableBalance)}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle amount input change
  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    
    // Clear amount error when user starts typing
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: null }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const numericAmount = parseCurrency(amount);
      const withdrawalData = {
        amount: numericAmount,
        reason: reason.trim() || undefined,
      };

      const response = await investmentClient.createWithdrawal(withdrawalData);
      
      // Call success callback with withdrawal request ID
      onSuccess?.(response.id || response);
      
      // Reset form
      setAmount('');
      setReason('');
      setErrors({});
      
    } catch (error) {
      console.error('Withdrawal request failed:', error);
      
      // Handle different error types
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.detail) {
          setErrors({ submit: errorData.detail });
        } else if (errorData.errors) {
          setErrors(errorData.errors);
        } else {
          setErrors({ submit: 'Invalid withdrawal request. Please check your input.' });
        }
      } else if (error.response?.status === 401) {
        setErrors({ submit: 'Your session has expired. Please log in again.' });
      } else if (error.response?.status === 403) {
        setErrors({ submit: 'You do not have permission to make withdrawals.' });
      } else {
        setErrors({ submit: 'Failed to submit withdrawal request. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle max amount button
  const handleMaxAmount = () => {
    setAmount(availableBalance.toString());
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: null }));
    }
  };

  const numericAmount = parseCurrency(amount);
  const isValidAmount = numericAmount > 0 && numericAmount <= availableBalance;

  return (
    <Card>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">
          Request Withdrawal
        </h3>
        <p className="text-sm text-secondary-600">
          Withdraw funds from your available balance. Processing typically takes 1-3 business days.
        </p>
      </div>

      {/* Available Balance Display */}
      <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary-600" />
            <span className="font-medium text-primary-900">Available Balance</span>
          </div>
          <span className="text-xl font-bold text-primary-900">
            {formatCurrency(availableBalance)}
          </span>
        </div>
      </div>

      {availableBalance <= 0 ? (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-warning-500 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-secondary-900 mb-2">
            No Funds Available
          </h4>
          <p className="text-secondary-600 mb-4">
            You don't have any funds available for withdrawal at this time.
          </p>
          <Button variant="secondary" onClick={onCancel}>
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-secondary-700 mb-2">
              Withdrawal Amount *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-secondary-500 text-sm">$</span>
              </div>
              <input
                type="text"
                id="amount"
                value={formatInputValue(amount)}
                onChange={handleAmountChange}
                placeholder="0"
                className={`block w-full pl-12 pr-20 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.amount ? 'border-error-300 bg-error-50' : 'border-secondary-300'
                }`}
                disabled={loading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleMaxAmount}
                  disabled={loading}
                  className="text-xs"
                >
                  Max
                </Button>
              </div>
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-error-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.amount}
              </p>
            )}
            {isValidAmount && (
              <p className="mt-1 text-sm text-success-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Valid withdrawal amount
              </p>
            )}
          </div>

          {/* Reason Input (Optional) */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-secondary-700 mb-2">
              Reason for Withdrawal (Optional)
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for withdrawal..."
              rows={3}
              className="block w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={loading}
              maxLength={500}
            />
            <p className="mt-1 text-xs text-secondary-500">
              {reason.length}/500 characters
            </p>
          </div>

          {/* Processing Information */}
          <div className="bg-secondary-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-secondary-500 mt-0.5" />
              <div className="text-sm text-secondary-700">
                <p className="font-medium mb-1">Processing Information:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Withdrawal requests are processed within 1-3 business days</li>
                  <li>• Funds will be transferred to your registered bank account</li>
                  <li>• You will receive an email confirmation once processed</li>
                  <li>• Processing fees may apply based on your account type</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-error-50 border border-error-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-error-600" />
                <p className="text-sm text-error-700">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-secondary-200">
            <Button
              type="submit"
              loading={loading}
              disabled={!isValidAmount || loading}
              className="flex-1"
            >
              {loading ? 'Processing...' : `Withdraw ${numericAmount > 0 ? formatCurrency(numericAmount) : 'Amount'}`}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
};

export default WithdrawalForm;