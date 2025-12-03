import React from 'react'
import { motion } from 'framer-motion'
import { Check, X, Star } from 'lucide-react'
import Button from '../common/Button'

/**
 * PlanComparison Component
 * Displays side-by-side comparison table of subscription plans
 */
const PlanComparison = ({ 
  plans = [], 
  onPlanSelect, 
  className = '' 
}) => {
  if (!plans || plans.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No plans available for comparison</p>
      </div>
    )
  }

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getBillingText = (period) => {
    switch (period) {
      case 'monthly':
        return '/month'
      case 'yearly':
        return '/year'
      default:
        return `/${period}`
    }
  }

  // Get all unique features across all plans
  const allFeatures = [...new Set(
    plans.flatMap(plan => plan.features || [])
  )]

  const handlePlanSelect = (planId) => {
    if (onPlanSelect) {
      onPlanSelect(planId)
    }
  }

  return (
    <div className={`${className}`}>
      {/* Mobile: Stacked Cards */}
      <div className="block lg:hidden space-y-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`
              bg-white rounded-lg border p-6 shadow-sm
              ${plan.isRecommended ? 'border-blue-500 shadow-lg' : 'border-gray-200'}
            `}
          >
            {/* Plan Header */}
            <div className="text-center mb-6">
              {plan.isRecommended && (
                <div className="inline-flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-3">
                  <Star className="w-3 h-3 fill-current" />
                  Recommended
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(plan.price)}
                </span>
                <span className="text-gray-600 text-sm">
                  {getBillingText(plan.billingPeriod)}
                </span>
              </div>
              {plan.trialDays && plan.trialDays > 0 && (
                <div className="mt-2">
                  <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    {plan.trialDays}-day free trial
                  </span>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Features:</h4>
              <ul className="space-y-2">
                {allFeatures.map((feature, featureIndex) => {
                  const hasFeature = plan.features?.includes(feature)
                  return (
                    <li key={featureIndex} className="flex items-center gap-3">
                      {hasFeature ? (
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${hasFeature ? 'text-gray-900' : 'text-gray-400'}`}>
                        {feature}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Action Button */}
            <Button
              variant={plan.isRecommended ? 'primary' : 'secondary'}
              size="lg"
              onClick={() => handlePlanSelect(plan.id)}
              className="w-full"
            >
              {plan.trialDays && plan.trialDays > 0 ? 'Start Free Trial' : 'Subscribe Now'}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Desktop: Comparison Table */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-900 bg-gray-50">
                  Features
                </th>
                {plans.map((plan) => (
                  <th key={plan.id} className="text-center py-4 px-6 bg-gray-50 min-w-[200px]">
                    <div className="relative">
                      {plan.isRecommended && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                          <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            Recommended
                          </div>
                        </div>
                      )}
                      <div className="mt-2">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-2xl font-bold text-gray-900">
                            {formatPrice(plan.price)}
                          </span>
                          <span className="text-gray-600 text-sm">
                            {getBillingText(plan.billingPeriod)}
                          </span>
                        </div>
                        {plan.trialDays && plan.trialDays > 0 && (
                          <div className="mt-2">
                            <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                              {plan.trialDays}-day free trial
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Feature Rows */}
              {allFeatures.map((feature, featureIndex) => (
                <motion.tr
                  key={featureIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: featureIndex * 0.05 }}
                  className={`border-b border-gray-200 ${featureIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <td className="py-4 px-6 font-medium text-gray-900">
                    {feature}
                  </td>
                  {plans.map((plan) => {
                    const hasFeature = plan.features?.includes(feature)
                    return (
                      <td key={plan.id} className="py-4 px-6 text-center">
                        {hasFeature ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    )
                  })}
                </motion.tr>
              ))}
              
              {/* Action Row */}
              <tr className="bg-white">
                <td className="py-6 px-6 font-medium text-gray-900">
                  Choose Plan
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} className="py-6 px-6 text-center">
                    <Button
                      variant={plan.isRecommended ? 'primary' : 'secondary'}
                      size="md"
                      onClick={() => handlePlanSelect(plan.id)}
                      className="w-full max-w-[160px]"
                    >
                      {plan.trialDays && plan.trialDays > 0 ? 'Start Trial' : 'Subscribe'}
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 mb-2">
          All plans include 24/7 customer support and can be cancelled anytime.
        </p>
        <p className="text-xs text-gray-500">
          Feature availability may vary. Contact support for detailed information.
        </p>
      </div>
    </div>
  )
}

export default PlanComparison