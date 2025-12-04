import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { CreditCard, AlertCircle, CheckCircle, Copy } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import SubscriptionStatus from '../../components/subscriptions/SubscriptionStatus'
import CancelSubscription from '../../components/subscriptions/CancelSubscription'
import FreeTrialBanner from '../../components/subscriptions/FreeTrialBanner'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import { SUCCESS_MESSAGES } from '../../utils/constants'

/**
 * MySubscriptionPage Component
 * Displays user's subscription status and handles cancellation
 */
const MySubscriptionPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [subscriptionToCancel, setSubscriptionToCancel] = useState(null)
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false)
  const [paymentInstructions, setPaymentInstructions] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    // Check if we need to show payment instructions
    if (location.state?.showPaymentInstructions) {
      setShowPaymentInstructions(true)
      setPaymentInstructions(location.state.paymentInstructions)
      
      // Clear the state to prevent showing instructions on refresh
      navigate(location.pathname, { replace: true })
    }
  }, [location.state, navigate, location.pathname])

  const handleCancelClick = (subscriptionId) => {
    setSubscriptionToCancel(subscriptionId)
    setShowCancelModal(true)
  }

  const handleCancelSuccess = () => {
    setShowCancelModal(false)
    setSubscriptionToCancel(null)
    
    // Show success message
    alert(SUCCESS_MESSAGES.SUBSCRIPTION_CANCELLED)
    
    // Refresh the subscription status
    setRefreshKey(prev => prev + 1)
  }

  const handleCancelModalClose = () => {
    setShowCancelModal(false)
    setSubscriptionToCancel(null)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!')
    }).catch(() => {
      alert('Failed to copy to clipboard')
    })
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Free Trial Banner */}
          <FreeTrialBanner />

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Subscription
            </h1>
            <p className="text-gray-600">
              Manage your subscription and billing information
            </p>
          </motion.div>

          {/* Payment Instructions Modal */}
          {showPaymentInstructions && paymentInstructions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <Card className="p-6 border-blue-200 bg-blue-50">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-medium text-blue-900 mb-2">
                      Complete Your Payment
                    </h3>
                    <p className="text-blue-800 text-sm mb-4">
                      Your subscription has been created! Please complete the payment using the instructions below:
                    </p>
                    
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-3">Payment Instructions:</h4>
                      <div className="space-y-2 text-sm">
                        {paymentInstructions.mpesa && (
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-gray-600">M-Pesa Paybill:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium">{paymentInstructions.mpesa.paybill}</span>
                              <button
                                onClick={() => copyToClipboard(paymentInstructions.mpesa.paybill)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                        {paymentInstructions.accountNumber && (
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-gray-600">Account Number:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium">{paymentInstructions.accountNumber}</span>
                              <button
                                onClick={() => copyToClipboard(paymentInstructions.accountNumber)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                        {paymentInstructions.amount && (
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-gray-600">Amount:</span>
                            <span className="font-medium">${paymentInstructions.amount.toLocaleString()}</span>
                          </div>
                        )}
                        {paymentInstructions.reference && (
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-gray-600">Reference:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium">{paymentInstructions.reference}</span>
                              <button
                                onClick={() => copyToClipboard(paymentInstructions.reference)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-2 mb-4">
                      <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-blue-800 text-xs">
                        Your subscription will be activated once payment is confirmed. 
                        This usually takes a few minutes but may take up to 24 hours.
                      </p>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowPaymentInstructions(false)}
                    >
                      I've Made the Payment
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Subscription Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <SubscriptionStatus 
              key={refreshKey}
              onCancelClick={handleCancelClick}
            />
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mt-8"
          >
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  variant="secondary"
                  onClick={() => navigate('/subscriptions/plans')}
                  className="justify-start"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  View All Plans
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/portfolio')}
                  className="justify-start"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  View Portfolio
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/products')}
                  className="justify-start"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Browse Investments
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="mt-8"
          >
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Need Help?
              </h3>
              <div className="space-y-3">
                <p className="text-gray-600 text-sm">
                  If you have questions about your subscription or need assistance with payments, 
                  our support team is here to help.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open('mailto:support@siscom.africa', '_blank')}
                  >
                    Email Support
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open('tel:+254700000000', '_blank')}
                  >
                    Call Support
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Cancel Subscription Modal */}
        <CancelSubscription
          isOpen={showCancelModal}
          onClose={handleCancelModalClose}
          subscriptionId={subscriptionToCancel}
          subscriptionName="Premium Plan" // This should come from the subscription data
          onSuccess={handleCancelSuccess}
        />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

export default MySubscriptionPage