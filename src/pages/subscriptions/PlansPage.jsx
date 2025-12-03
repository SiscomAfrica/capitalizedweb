import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Check, Star } from 'lucide-react'
import subscriptionClient from '../../api/subscriptionClient'
import useAuth from '../../hooks/useAuth'
import DashboardLayout from '../../components/layout/DashboardLayout'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import PlanGrid from '../../components/subscriptions/PlanGrid'
import PlanComparison from '../../components/subscriptions/PlanComparison'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import { SUCCESS_MESSAGES } from '../../utils/constants'

/**
 * PlansPage Component
 * Displays subscription plans with grid and comparison views
 */
const PlansPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showComparison, setShowComparison] = useState(false)
  const [plans, setPlans] = useState([])

  const handlePlanSelect = async (planId) => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Find the selected plan to check if it has a trial
      const selectedPlan = plans.find(plan => plan.id === planId)
      const hasFreeTrial = selectedPlan?.trialDays && selectedPlan.trialDays > 0

      let response

      if (hasFreeTrial) {
        // Check if user already has a subscription
        try {
          const existingSubscription = await subscriptionClient.getMySubscription()
          if (existingSubscription?.subscription) {
            // User already has a subscription, create paid subscription
            response = await subscriptionClient.createSubscription({ planId })
          } else {
            // Start free trial
            response = await subscriptionClient.startFreeTrial()
          }
        } catch (error) {
          // If error getting subscription (likely 404), start trial
          if (error.status === 404) {
            response = await subscriptionClient.startFreeTrial()
          } else {
            throw error
          }
        }
      } else {
        // Create regular subscription
        response = await subscriptionClient.createSubscription({ planId })
      }
      
      // Show success message
      if (hasFreeTrial && response.success) {
        alert('Free trial started successfully!')
      } else {
        alert(SUCCESS_MESSAGES.SUBSCRIPTION_CREATED)
      }
      
      // Navigate to subscription status
      navigate('/my-subscription')
      
    } catch (err) {
      console.error('Error creating subscription:', err)
      setError(err.response?.data?.message || 'Failed to create subscription')
    } finally {
      setLoading(false)
    }
  }

  const handlePlansLoaded = (loadedPlans) => {
    setPlans(loadedPlans)
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Unlock premium features and take your investment journey to the next level. 
              All plans include 24/7 support and can be cancelled anytime.
            </p>
          </motion.div>

          {/* View Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <div className="bg-gray-100 p-1 rounded-lg">
              <Button
                variant={!showComparison ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setShowComparison(false)}
                className="mr-1"
              >
                Grid View
              </Button>
              <Button
                variant={showComparison ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setShowComparison(true)}
              >
                Compare Plans
              </Button>
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="p-6 text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600">Creating your subscription...</p>
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

          {/* Plans Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {showComparison ? (
              <PlanComparison 
                plans={plans}
                onPlanSelect={handlePlanSelect}
              />
            ) : (
              <PlanGrid 
                onPlanSelect={handlePlanSelect}
                onPlansLoaded={handlePlansLoaded}
              />
            )}
          </motion.div>

          {/* Features Highlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="mt-16"
          >
            <Card className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Why Choose Our Premium Plans?
                </h2>
                <p className="text-gray-600">
                  Get access to exclusive features designed to maximize your investment potential
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Star className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Premium Insights</h3>
                  <p className="text-gray-600 text-sm">
                    Get detailed market analysis and investment recommendations from our experts
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Priority Support</h3>
                  <p className="text-gray-600 text-sm">
                    Get faster response times and dedicated support from our investment team
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Advanced Tools</h3>
                  <p className="text-gray-600 text-sm">
                    Access advanced portfolio analytics and investment tracking tools
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
            className="mt-16"
          >
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Frequently Asked Questions
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Can I cancel my subscription anytime?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Yes, you can cancel your subscription at any time. You'll continue to have access 
                    to premium features until the end of your current billing period.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Do you offer refunds?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    We offer a full refund within 7 days of your initial subscription. 
                    After that, no refunds are provided for the current billing period.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Can I upgrade or downgrade my plan?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Yes, you can change your plan at any time. Changes will take effect 
                    at the start of your next billing cycle.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    What payment methods do you accept?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    We accept M-Pesa, bank transfers, and major credit/debit cards. 
                    All payments are processed securely.
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