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

  // No active subscription - encourage free trial
  if (!subscription) {
    return (
      <Card className={`text-center py-12 ${className}`}>
        <div className="max-w-lg mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Ready to Start Investing?
          </h3>
          <p className="text-gray-600 mb-6">
            Get 7 days of premium access to explore investment opportunities, 
            advanced tools, and market insights. No credit card required!
          </p>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-purple-800 mb-2">Free Trial Includes:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-purple-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Unlimited inquiries</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Premium insights</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Advanced tools</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Priority support</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 justify-center">
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => window.location.href = '/subscriptions/plans'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Start Free Trial
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
          
          <p className="text-xs text-gray-500 mt-4">
            No commitment • Cancel anytime • Full access for 7 days
          </p>
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

          {/* Free Trial Highlight */}
          {status === STATUS.SUBSCRIPTION.TRIAL && endDate && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-bold text-blue-900">🎉 Free Trial Active!</h4>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      PREMIUM ACCESS
                    </span>
                  </div>
                  <p className="text-blue-800 mb-3">
                    You're enjoying full premium access until <strong>{formatDate(endDate)}</strong>. 
                    Explore all features and see how our platform can help grow your investments!
                  </p>
                  
                  {/* Trial Benefits */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Unlimited investment inquiries</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Premium market insights</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Advanced portfolio tools</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Priority customer support</span>
                    </div>
                  </div>

                  {/* Trial Countdown */}
                  <div className="bg-white/70 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-900">Trial Progress</span>
                      <span className="text-sm text-blue-700">
                        {(() => {
                          const now = new Date()
                          const end = new Date(endDate)
                          const start = new Date(startDate)
                          const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
                          const remainingDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
                          return `${Math.max(0, remainingDays)} of ${totalDays} days remaining`
                        })()}
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(() => {
                            const now = new Date()
                            const end = new Date(endDate)
                            const start = new Date(startDate)
                            const totalTime = end - start
                            const elapsedTime = now - start
                            return Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100))
                          })()}%` 
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => window.location.href = '/subscriptions/plans'}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Continue with Premium
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => window.location.href = '/investments/products'}
                    >
                      Explore Investments
                    </Button>
                  </div>

                  {autoRenew && plan.price && (
                    <p className="text-xs text-blue-600 mt-3">
                      💡 Auto-renewal is enabled. You'll be charged {formatPrice(plan.price)} when your trial expires.
                    </p>
                  )}
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
              onClick={() => window.location.href = '/subscriptions/plans'}
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