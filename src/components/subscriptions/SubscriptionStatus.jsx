import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle,
  RefreshCw 
} from 'lucide-react'
import { format } from 'date-fns'
import subscriptionClient from '../../api/subscriptionClient'
import Card from '../common/Card'
import Button from '../common/Button'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorMessage from '../common/ErrorMessage'
import { STATUS } from '../../utils/constants'

/**
 * SubscriptionStatus Component
 * Displays current subscription information and status
 */
const SubscriptionStatus = ({ onCancelClick, className = '' }) => {
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchSubscription = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const response = await subscriptionClient.getMySubscription()
      setSubscription(response)
    } catch (err) {
      console.error('Error fetching subscription:', err)
      
      // Handle case where user has no subscription
      if (err.response?.status === 404) {
        setSubscription(null)
      } else {
        setError(err.response?.data?.message || 'Failed to load subscription information')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchSubscription()
  }, [])

  const handleRefresh = () => {
    fetchSubscription(true)
  }

  const handleCancelSubscription = () => {
    if (onCancelClick && subscription) {
      onCancelClick(subscription.id)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case STATUS.SUBSCRIPTION.ACTIVE:
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case STATUS.SUBSCRIPTION.TRIAL:
        return <Clock className="w-5 h-5 text-blue-500" />
      case STATUS.SUBSCRIPTION.CANCELLED:
        return <XCircle className="w-5 h-5 text-red-500" />
      case STATUS.SUBSCRIPTION.EXPIRED:
        return <AlertCircle className="w-5 h-5 text-orange-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case STATUS.SUBSCRIPTION.ACTIVE:
        return 'text-green-700 bg-green-100'
      case STATUS.SUBSCRIPTION.TRIAL:
        return 'text-blue-700 bg-blue-100'
      case STATUS.SUBSCRIPTION.CANCELLED:
        return 'text-red-700 bg-red-100'
      case STATUS.SUBSCRIPTION.EXPIRED:
        return 'text-orange-700 bg-orange-100'
      default:
        return 'text-gray-700 bg-gray-100'
    }
  }

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch {
      return dateString
    }
  }

  const getBillingText = (period) => {
    switch (period) {
      case 'monthly':
        return 'Monthly'
      case 'yearly':
        return 'Yearly'
      default:
        return period
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading subscription information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8">
        <ErrorMessage 
          message={error}
          onRetry={handleRefresh}
        />
      </div>
    )
  }

  // No active subscription
  if (!subscription) {
    return (
      <Card className={`text-center py-12 ${className}`}>
        <div className="max-w-md mx-auto">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Active Subscription
          </h3>
          <p className="text-gray-600 mb-6">
            You don't have an active subscription. Browse our plans to get started with premium features.
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              variant="primary" 
              onClick={() => window.location.href = '/plans'}
            >
              View Plans
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleRefresh}
              loading={refreshing}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  const {
    id,
    planName,
    status,
    startDate,
    endDate,
    renewalDate,
    autoRenew,
    plan = {}
  } = subscription

  const isActive = status === STATUS.SUBSCRIPTION.ACTIVE || status === STATUS.SUBSCRIPTION.TRIAL
  const canCancel = isActive && status !== STATUS.SUBSCRIPTION.CANCELLED

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Subscription Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Current Subscription
              </h2>
              <div className="flex items-center gap-2">
                {getStatusIcon(status)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              loading={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          {/* Plan Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Plan Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-medium text-gray-900">{planName}</span>
                </div>
                {plan.price && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(plan.price)} / {getBillingText(plan.billingPeriod)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Auto-renew:</span>
                  <span className={`font-medium ${autoRenew ? 'text-green-600' : 'text-red-600'}`}>
                    {autoRenew ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Important Dates</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Started:</span>
                  <span className="font-medium text-gray-900">{formatDate(startDate)}</span>
                </div>
                {endDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {status === STATUS.SUBSCRIPTION.TRIAL ? 'Trial ends:' : 'Expires:'}
                    </span>
                    <span className="font-medium text-gray-900">{formatDate(endDate)}</span>
                  </div>
                )}
                {renewalDate && autoRenew && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Next billing:</span>
                    <span className="font-medium text-gray-900">{formatDate(renewalDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Trial Warning */}
          {status === STATUS.SUBSCRIPTION.TRIAL && endDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Trial Period Active</h4>
                  <p className="text-blue-800 text-sm">
                    Your free trial ends on {formatDate(endDate)}. 
                    {autoRenew && plan.price && (
                      <> You'll be charged {formatPrice(plan.price)} when the trial expires.</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cancellation Notice */}
          {status === STATUS.SUBSCRIPTION.CANCELLED && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900 mb-1">Subscription Cancelled</h4>
                  <p className="text-red-800 text-sm">
                    Your subscription has been cancelled and will expire on {formatDate(endDate)}. 
                    You'll continue to have access until then.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {canCancel && (
              <Button
                variant="danger"
                onClick={handleCancelSubscription}
                className="flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Cancel Subscription
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => window.location.href = '/plans'}
            >
              View All Plans
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Plan Features */}
      {plan.features && plan.features.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="p-6">
            <h3 className="font-medium text-gray-900 mb-4">Your Plan Includes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

export default SubscriptionStatus