import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Check, Sparkles, Clock, ArrowRight } from 'lucide-react'
import subscriptionClient from '../../api/subscriptionClient'
import useAuth from '../../hooks/useAuth'
import DashboardLayout from '../../components/layout/DashboardLayout'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import FreeTrialBanner from '../../components/subscriptions/FreeTrialBanner'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'

/**
 * PlansPage Component
 * Focuses on free trial activation - no subscription plans shown
 */
const PlansPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleStartFreeTrial = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await subscriptionClient.startFreeTrial()
      
      if (response.success) {
        alert('🎉 Free trial started successfully! You now have 7 days of premium access.')
        navigate('/subscriptions/my-subscription')
      }
      
    } catch (err) {
      console.error('Error starting free trial:', err)
      
      // Handle specific error cases
      if (err.response?.status === 409) {
        setError('You already have an active subscription or have used your free trial.')
      } else if (err.response?.status === 403) {
        setError('Please complete your profile first to start your free trial.')
      } else {
        setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to start free trial')
      }
    } finally {
      setLoading(false)
    }
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
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Start Your Investment Journey
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get 7 days of premium access to explore all investment opportunities. 
              No credit card required - start your free trial today.
            </p>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="p-6 text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600">Starting your free trial...</p>
              </Card>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <ErrorMessage 
                message={error}
                onRetry={() => setError(null)}
              />
            </motion.div>
          )}

          {/* Free Trial Offer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mb-16"
          >
            <Card className="overflow-hidden border-0 shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-1">
                <div className="bg-white rounded-lg p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      7-Day Free Trial
                    </h2>
                    <p className="text-lg text-gray-600 mb-8">
                      Experience the full power of our investment platform with complete access to all premium features.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-gray-700 font-medium">Unlimited investment inquiries</span>
                      </div>
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-gray-700 font-medium">Premium market insights & analysis</span>
                      </div>
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-gray-700 font-medium">Advanced portfolio tracking tools</span>
                      </div>
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-gray-700 font-medium">Priority customer support</span>
                      </div>
                    </div>
                    
                    <Button 
                      size="xl"
                      onClick={handleStartFreeTrial}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-3" />
                          Starting Trial...
                        </>
                      ) : (
                        <>
                          Start Free Trial Now
                          <ArrowRight className="w-6 h-6 ml-3" />
                        </>
                      )}
                    </Button>
                    
                    <p className="text-sm text-gray-500 mt-6">
                      No commitment • Cancel anytime • Full access for 7 days • No credit card required
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Features Highlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="mb-16"
          >
            <Card className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  What You Get During Your Free Trial
                </h2>
                <p className="text-gray-600">
                  Experience all premium features and see how our platform can accelerate your investment journey
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 mb-3">Premium Market Insights</h3>
                  <p className="text-gray-600 text-sm">
                    Get detailed market analysis, investment recommendations, and expert insights to make informed decisions
                  </p>
                </div>

                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 mb-3">Priority Support</h3>
                  <p className="text-gray-600 text-sm">
                    Get faster response times and dedicated support from our experienced investment team
                  </p>
                </div>

                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 mb-3">Advanced Analytics</h3>
                  <p className="text-gray-600 text-sm">
                    Access advanced portfolio analytics, risk assessment tools, and performance tracking
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Frequently Asked Questions
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    What happens after my 7-day free trial?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Your trial will automatically expire after 7 days. You can continue using basic features 
                    or upgrade to a premium plan to maintain full access.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Do I need to provide payment information?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    No! Our free trial requires no credit card or payment information. 
                    Simply complete your profile and start exploring.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Can I cancel my trial anytime?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Yes, you can cancel your trial at any time. There are no commitments or hidden fees.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    What investment opportunities are available?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    During your trial, you'll have access to browse all investment opportunities, 
                    submit inquiries, and use our analysis tools to evaluate potential investments.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

export default PlansPage