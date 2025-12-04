import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import subscriptionClient from '../../api/subscriptionClient'
import PlanCard from './PlanCard'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorMessage from '../common/ErrorMessage'
import Button from '../common/Button'

/**
 * PlanGrid Component
 * Fetches and displays subscription plans in a responsive grid layout
 */
const PlanGrid = ({ onPlanSelect, className = '' }) => {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retrying, setRetrying] = useState(false)

  const fetchPlans = async (isRetry = false) => {
    try {
      if (isRetry) {
        setRetrying(true)
      } else {
        setLoading(true)
      }
      setError(null)

      console.log('Fetching subscription plans...')
      
      try {
        const response = await subscriptionClient.getPlans({ activeOnly: true })
        console.log('Plans API response:', response)
        
        // Handle different response structures from backend
        let plansData = [];
        if (Array.isArray(response)) {
          plansData = response;
        } else if (response && Array.isArray(response.plans)) {
          plansData = response.plans;
        } else if (response && Array.isArray(response.data)) {
          plansData = response.data;
        } else if (response && response.results && Array.isArray(response.results)) {
          plansData = response.results;
        }
        
        console.log('Processed plans data:', plansData)
        
        // For now, we focus on free trial model - no subscription plans needed
        if (!plansData || plansData.length === 0) {
          console.log('No subscription plans - focusing on free trial model')
          setPlans([]) // Empty plans array - users should use free trial
        } else {
          setPlans(plansData)
        }
      } catch (apiError) {
        console.log('API error - focusing on free trial model:', apiError)
        // No fallback plans - focus on free trial
        setPlans([])
      }
    } catch (err) {
      console.error('Error fetching plans:', err)
      setError(err.response?.data?.message || err.message || 'Failed to load subscription plans')
    } finally {
      setLoading(false)
      setRetrying(false)
    }
  }



  useEffect(() => {
    fetchPlans()
  }, [])

  const handleRetry = () => {
    fetchPlans(true)
  }

  const handlePlanSelect = (planId) => {
    if (onPlanSelect) {
      onPlanSelect(planId)
    }
  }

  // Find recommended plan
  const recommendedPlan = plans.find(plan => plan.isRecommended)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorMessage 
          message={error}
          onRetry={handleRetry}
        />
      </div>
    )
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Start Your Free Trial Today
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              Get 7 days of premium access to explore all investment opportunities and platform features. 
              No credit card required!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">Unlimited investment inquiries</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">Premium market insights</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">Advanced portfolio tools</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">Priority customer support</span>
              </div>
            </div>
            
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => {
                // Trigger free trial activation
                if (onPlanSelect) {
                  onPlanSelect('free-trial')
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold"
            >
              Start Free Trial Now
            </Button>
            
            <p className="text-sm text-gray-500 mt-4">
              No commitment • Cancel anytime • Full access for 7 days
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.1 
            }}
          >
            <PlanCard
              plan={plan}
              onSelect={handlePlanSelect}
              isRecommended={plan.isRecommended || plan.id === recommendedPlan?.id}
              className="h-full"
            />
          </motion.div>
        ))}
      </div>

      {/* Retry Button (if there was an error but we have some plans) */}
      {retrying && (
        <div className="flex justify-center mt-6">
          <LoadingSpinner size="sm" />
          <span className="ml-2 text-gray-600">Refreshing plans...</span>
        </div>
      )}

      {/* Additional Info */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          All plans include our core features. Upgrade or downgrade anytime.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Prices are in US Dollars (USD). All subscriptions auto-renew unless cancelled.
        </p>
      </div>
    </div>
  )
}

export default PlanGrid