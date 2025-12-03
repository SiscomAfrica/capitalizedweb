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
      setPlans(plansData)
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
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Plans Available
          </h3>
          <p className="text-gray-600 mb-4">
            There are currently no subscription plans available. Please check back later.
          </p>
          <Button 
            variant="secondary" 
            onClick={handleRetry}
            loading={retrying}
            className="inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
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