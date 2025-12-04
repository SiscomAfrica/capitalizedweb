import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, User, CreditCard, Gift } from 'lucide-react';
import ProfileCompletionForm from '../profile/ProfileCompletionForm';
import subscriptionClient from '../../api/subscriptionClient';
import useAuth from '../../hooks/useAuth';
import Button from '../common/Button';
import Card from '../common/Card';
import ErrorMessage from '../common/ErrorMessage';

/**
 * SimpleKYCOnboarding Component
 * Handles the new simplified onboarding flow:
 * 1. Complete profile (simple KYC: name, phone, address, date of birth)
 * 2. Automatically activate 7-day free tier subscription
 */
const SimpleKYCOnboarding = ({ onComplete }) => {
  const { user, refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [freeTierActivated, setFreeTierActivated] = useState(false);

  const steps = [
    {
      id: 1,
      title: 'Complete Your Profile',
      description: 'Provide basic information to get started',
      icon: User
    },
    {
      id: 2,
      title: 'Activate Free Tier',
      description: 'Get 7 days of free access to our platform',
      icon: Gift
    },
    {
      id: 3,
      title: 'Start Investing',
      description: 'You\'re ready to explore investment opportunities',
      icon: CreditCard
    }
  ];

  // Handle profile completion
  const handleProfileComplete = async () => {
    try {
      setLoading(true);
      setError(null);

      // Refresh user data to get updated profile_completed status
      await refreshUser();
      
      // Move to next step
      setCurrentStep(2);
      
      // Automatically try to activate free tier
      await activateFreeTier();
      
    } catch (err) {
      console.error('Profile completion error:', err);
      setError('Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Activate free tier subscription
  const activateFreeTier = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await subscriptionClient.startFreeTrial();
      
      if (response.success) {
        setFreeTierActivated(true);
        setCurrentStep(3);
        
        // Refresh user data
        await refreshUser();
        
        // Complete onboarding after a short delay
        setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, 2000);
      } else {
        throw new Error(response.message || 'Failed to activate free tier');
      }
      
    } catch (err) {
      console.error('Free tier activation error:', err);
      
      // Handle specific error cases
      if (err.response?.status === 409) {
        setError('You have already used your free trial or have an active subscription.');
      } else if (err.response?.status === 403) {
        setError('Please complete your profile first to activate the free tier.');
      } else {
        setError(err.response?.data?.detail || 'Failed to activate free tier. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Skip onboarding (for users who want to explore without completing profile)
  const handleSkip = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Africa Investment Platform
          </h1>
          <p className="text-lg text-gray-600">
            Complete your profile and get 7 days of free access
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
                        ${isCompleted 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : isActive 
                            ? 'bg-blue-500 border-blue-500 text-white' 
                            : 'bg-white border-gray-300 text-gray-400'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-400 max-w-24">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-gray-400 mt-6" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Complete Your Profile
                  </h2>
                  <p className="text-gray-600">
                    We need some basic information to get you started. This helps us provide 
                    personalized investment recommendations and comply with regulations.
                  </p>
                </div>
                
                <ProfileCompletionForm
                  onSuccess={handleProfileComplete}
                  onSkip={handleSkip}
                />
              </Card>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-6 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Activating Your Free Tier
                  </h2>
                  <p className="text-gray-600">
                    We're setting up your 7-day free access to explore our investment platform.
                  </p>
                </div>

                {loading && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Activating free tier...</span>
                  </div>
                )}

                {!loading && !freeTierActivated && (
                  <Button
                    onClick={activateFreeTier}
                    className="w-full"
                    disabled={loading}
                  >
                    Activate Free Tier
                  </Button>
                )}
              </Card>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-6 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Welcome to Africa Investment Platform!
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Your free tier is now active. You have 7 days to explore our investment 
                    opportunities and platform features.
                  </p>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-green-800 mb-2">What's included in your free tier:</h3>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Browse all investment opportunities</li>
                      <li>• Submit investment inquiries</li>
                      <li>• Access investment calculators</li>
                      <li>• View market insights and reports</li>
                    </ul>
                  </div>
                </div>

                <Button
                  onClick={() => onComplete && onComplete()}
                  className="w-full"
                >
                  Start Exploring Investments
                </Button>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Skip Option (only on first step) */}
        {currentStep === 1 && (
          <div className="text-center mt-6">
            <button
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700 text-sm underline"
            >
              Skip for now and explore the platform
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleKYCOnboarding;