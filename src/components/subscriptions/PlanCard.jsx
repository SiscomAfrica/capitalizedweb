import React from 'react'
import { motion } from 'framer-motion'
import { Check, Star } from 'lucide-react'
import Button from '../common/Button'
import Card from '../common/Card'

/**
 * PlanCard Component
 * Displays subscription plan information with pricing, features, and trial info
 */
const PlanCard = ({ 
  plan, 
  onSelect, 
  isRecommended = false, 
  isLoading = false,
  className = '' 
}) => {
  if (!plan) {
    return null
  }

  const {
    id,
    name,
    description,
    price,
    billingPeriod,
    features,
    trialDays,
    isActive = true
  } = plan

  // Ensure features is always an array
  const featuresList = Array.isArray(features) 
    ? features 
    : features && typeof features === 'object' 
      ? Object.values(features).filter(Boolean)
      : []

  const handleSelect = () => {
    if (onSelect && isActive && !isLoading) {
      onSelect(id)
    }
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
        return 'per month'
      case 'yearly':
        return 'per year'
      default:
        return `per ${period}`
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative ${className}`}
    >
      <Card
        className={`
          h-full p-6 transition-all duration-300 hover:shadow-lg
          ${isRecommended 
            ? 'border-2 border-blue-500 shadow-lg' 
            : 'border border-gray-200 hover:border-gray-300'
          }
          ${!isActive ? 'opacity-60' : ''}
        `}
      >
        {/* Recommended Badge */}
        {isRecommended && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              Recommended
            </div>
          </div>
        )}

        {/* Plan Header */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
          {description && (
            <p className="text-gray-600 text-sm mb-4">{description}</p>
          )}
          
          {/* Pricing */}
          <div className="mb-4">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(price)}
              </span>
              <span className="text-gray-600 text-sm">
                {getBillingText(billingPeriod)}
              </span>
            </div>
            
            {/* Trial Information */}
            {trialDays && trialDays > 0 && (
              <div className="mt-2">
                <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  {trialDays}-day free trial
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Features List */}
        <div className="mb-6 flex-grow">
          <ul className="space-y-3">
            {featuresList.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Trial Terms */}
        {trialDays && trialDays > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Trial Terms:</strong> Start with a {trialDays}-day free trial. 
              You can cancel anytime during the trial period without being charged. 
              After the trial, you'll be automatically charged {formatPrice(price)} {getBillingText(billingPeriod)}.
            </p>
          </div>
        )}

        {/* Subscribe Button */}
        <Button
          variant={isRecommended ? 'primary' : 'secondary'}
          size="lg"
          onClick={handleSelect}
          disabled={!isActive || isLoading}
          loading={isLoading}
          className="w-full"
        >
          {!isActive 
            ? 'Not Available' 
            : trialDays && trialDays > 0 
              ? 'Start Free Trial' 
              : 'Subscribe Now'
          }
        </Button>

        {/* Additional Info */}
        {isActive && (
          <p className="text-xs text-gray-500 text-center mt-3">
            Cancel anytime. No hidden fees.
          </p>
        )}
      </Card>
    </motion.div>
  )
}

export default PlanCard