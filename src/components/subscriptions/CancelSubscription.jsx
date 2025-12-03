import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { XCircle, AlertTriangle, Check } from 'lucide-react'
import subscriptionClient from '../../api/subscriptionClient'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Card from '../common/Card'

/**
 * CancelSubscription Component
 * Handles subscription cancellation with confirmation modal and reason selection
 */
const CancelSubscription = ({ 
  isOpen, 
  onClose, 
  subscriptionId, 
  subscriptionName,
  onSuccess,
  className = '' 
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedReason, setSelectedReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [step, setStep] = useState('reason') // 'reason' | 'confirm' | 'success'

  const cancellationReasons = [
    { value: 'too_expensive', label: 'Too expensive' },
    { value: 'not_using', label: 'Not using the service enough' },
    { value: 'missing_features', label: 'Missing features I need' },
    { value: 'poor_experience', label: 'Poor user experience' },
    { value: 'found_alternative', label: 'Found a better alternative' },
    { value: 'temporary_pause', label: 'Temporary pause (will return later)' },
    { value: 'other', label: 'Other (please specify)' }
  ]

  const handleReasonSelect = (reason) => {
    setSelectedReason(reason)
    if (reason !== 'other') {
      setCustomReason('')
    }
  }

  const handleNext = () => {
    if (!selectedReason) {
      setError('Please select a reason for cancellation')
      return
    }
    
    if (selectedReason === 'other' && !customReason.trim()) {
      setError('Please provide a reason for cancellation')
      return
    }

    setError(null)
    setStep('confirm')
  }

  const handleCancel = async () => {
    if (!subscriptionId) {
      setError('Subscription ID is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const reason = selectedReason === 'other' ? customReason : selectedReason
      
      await subscriptionClient.cancelSubscription(subscriptionId, { reason })
      
      setStep('success')
      
      // Call success callback after a short delay to show success message
      setTimeout(() => {
        if (onSuccess) {
          onSuccess()
        }
      }, 2000)
      
    } catch (err) {
      console.error('Error cancelling subscription:', err)
      setError(err.response?.data?.message || 'Failed to cancel subscription')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setStep('reason')
      setSelectedReason('')
      setCustomReason('')
      setError(null)
      onClose()
    }
  }

  const getReasonLabel = (value) => {
    const reason = cancellationReasons.find(r => r.value === value)
    return reason ? reason.label : value
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'success' ? 'Subscription Cancelled' : 'Cancel Subscription'}
      className={className}
    >
      <div className="max-w-md mx-auto">
        {/* Step 1: Reason Selection */}
        {step === 'reason' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                <h3 className="text-lg font-medium text-gray-900">
                  We're sorry to see you go
                </h3>
              </div>
              <p className="text-gray-600 text-sm">
                Before you cancel your subscription to <strong>{subscriptionName}</strong>, 
                could you help us understand why you're leaving?
              </p>
            </div>

            {/* Reason Selection */}
            <div className="space-y-3 mb-6">
              {cancellationReasons.map((reason) => (
                <label
                  key={reason.value}
                  className={`
                    flex items-center p-3 border rounded-lg cursor-pointer transition-colors
                    ${selectedReason === reason.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="cancellation-reason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={(e) => handleReasonSelect(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`
                    w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center
                    ${selectedReason === reason.value 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                    }
                  `}>
                    {selectedReason === reason.value && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-gray-900 text-sm">{reason.label}</span>
                </label>
              ))}
            </div>

            {/* Custom Reason Input */}
            {selectedReason === 'other' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please tell us more:
                </label>
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Help us understand your reason for cancelling..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleClose}
                className="flex-1"
              >
                Keep Subscription
              </Button>
              <Button
                variant="primary"
                onClick={handleNext}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Confirmation */}
        {step === 'confirm' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <XCircle className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-medium text-gray-900">
                  Confirm Cancellation
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Are you sure you want to cancel your subscription? This action cannot be undone.
              </p>
            </div>

            {/* Summary */}
            <Card className="p-4 mb-6 bg-gray-50">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subscription:</span>
                  <span className="font-medium text-gray-900">{subscriptionName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Reason:</span>
                  <span className="font-medium text-gray-900">
                    {selectedReason === 'other' ? customReason : getReasonLabel(selectedReason)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">Important Notice</h4>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    <li>• Your subscription will remain active until the end of your billing period</li>
                    <li>• You'll lose access to premium features after cancellation</li>
                    <li>• No refunds will be issued for the current billing period</li>
                    <li>• You can resubscribe at any time</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setStep('reason')}
                disabled={loading}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                variant="danger"
                onClick={handleCancel}
                loading={loading}
                className="flex-1"
              >
                Cancel Subscription
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Subscription Cancelled
              </h3>
              <p className="text-gray-600 text-sm">
                Your subscription has been successfully cancelled. You'll continue to have access 
                to premium features until the end of your current billing period.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                We appreciate your feedback and hope to serve you again in the future. 
                If you change your mind, you can resubscribe at any time.
              </p>
            </div>

            <Button
              variant="primary"
              onClick={handleClose}
              className="w-full"
            >
              Close
            </Button>
          </motion.div>
        )}
      </div>
    </Modal>
  )
}

export default CancelSubscription