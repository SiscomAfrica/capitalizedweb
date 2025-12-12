import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, User, Gift, Sparkles, Clock } from 'lucide-react';
import ProfileCompletionForm from '../profile/ProfileCompletionForm';
import subscriptionClient from '../../api/subscriptionClient';
import useAuth from '../../hooks/useAuth';
import Button from '../common/Button';
import Card from '../common/Card';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * StreamlinedOnboarding Component
 * Implements the new flow: Register → Phone Verification → Profile Completion → Free Trial → Dashboard Access
 */
const StreamlinedOnboarding = () => {
  const { user, updateUser, isPhoneVerified } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [freeTrialActivated, setFreeTrialActivated] = useState(false);

  // Determine initial step based on user status
  useEffect(() => {
    if (!user) return;

    if (!isPhoneVerified()) {
      // Should not reach here - phone verification should be handled before this component
      navigate('/verify-phone');
      return;
    }

    if (user.profile_completed || user.profileCompleted) {
      setProfileCompleted(true);
      setCurrentStep(2); // Skip to free trial step
    }
  }, [user, isPhoneVerified, navigate]);

  const steps = [
    {
      id: 1,
      title: 'Complete Profile',
      description: 'Basic information to get started',
      icon: User,
      status: profileCompleted ? 'completed' : 'current'
    },
    {
      id: 2,
      title: 'Activate Free Trial',
      description: '7 days of premium access',
      icon: Gift,
      status: freeTrialActivated ? 'completed' : profileCompleted ? 'current' : 'pending'
    },
    {
      id: 3,
      title: 'Start Investing',
      description: 'Access your dashboard',
      icon: Sparkles,
      status: freeTrialActivated ? 'current' : 'pending'
    }
  ];

  // Handle profile completion
  const handleProfileComplete = async () => {
    try {
      setLoading(true);
      setError(null);

      // Update user data to reflect profile completion
      updateUser({ profile_completed: true, profileCompleted: true });
      
      setProfileCompleted(true);
      setCurrentStep(2);
      
      // Auto-proceed to free trial activation
      setTimeout(() => {
        handleActivateFreeTrial();
      }, 1000);
      
    } catch (err) {
      console.error('Profile completion error:', err);
      setError('Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Activate free trial
  const handleActivateFreeTrial = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await subscriptionClient.startFreeTrial();
      
      console.log('Free trial response:', response);
      
      if (response && (response.success || response.status === 'success' || response.message)) {
        setFreeTrialActivated(true);
        setCurrentStep(3);
        
        // Update user data to reflect trial activation
        updateUser({ 
          subscription_status: 'trial',
          has_active_subscription: true 
        });
        
        // Auto-redirect to dashboard after showing success
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        throw new Error(response?.message || 'Failed to activate free trial');
      }
      
    } catch (err) {
      console.error('Free trial activation error:', err);
      
      // Handle specific error cases
      if (err.response?.status === 409) {
        // User already has subscription - proceed to dashboard
        setFreeTrialActivated(true);
        setCurrentStep(3);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else if (err.response?.status === 403) {
        setError('Please complete your profile first to activate the free trial.');
        setCurrentStep(1);
      } else if (err.response?.status === 401) {
        setError('Please log in again to activate your free trial.');
      } else if (err.response?.status === 404) {
        setError('Free trial service is currently unavailable. You can still access the dashboard.');
        // Allow user to proceed to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else if (err.response?.status === 422) {
        setError('Your account is not eligible for a free trial at this time.');
      } else if (err.response?.status >= 500) {
        setError('Our servers are experiencing issues. You can still access the dashboard while we fix this.');
        // Allow user to proceed to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        const errorMessage = err.response?.data?.detail || 
                           err.response?.data?.message || 
                           err.message || 
                           'Failed to activate free trial. Please try again.';
        setError(`${errorMessage} You can still access the dashboard.`);
        
        // Provide option to skip to dashboard after 5 seconds
        setTimeout(() => {
          if (currentStep === 2) { // Still on trial step
            navigate('/dashboard');
          }
        }, 5000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Skip to dashboard (for users who want to explore without free trial)
  const handleSkipToDashboard = () => {
    navigate('/dashboard');
  };

  // Render step indicator
  const StepIndicator = ({ step, index }) => {
    const Icon = step.icon;
    const isCompleted = step.status === 'completed';
    const isCurrent = step.status === 'current';
    const isPending = step.status === 'pending';
    
    return (
      <div className="flex flex-col items-center">
        <div
          className={`
            w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
            ${isCompleted 
              ? 'bg-green-500 border-green-500 text-white shadow-lg' 
              : isCurrent 
                ? 'bg-blue-500 border-blue-500 text-white shadow-lg animate-pulse' 
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
        <div className="mt-2 text-center max-w-20">
          <p className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
            {step.title}
          </p>
          <p className="text-xs text-gray-400">
            {step.description}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Africa Investment Platform
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete your setup in just a few steps and get instant access to premium investment opportunities
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <div className="flex items-center space-x-8">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <StepIndicator step={step} index={index} />
                {index < steps.length - 1 && (
                  <ArrowRight 
                    className={`w-5 h-5 transition-colors ${
                      steps[index + 1].status !== 'pending' ? 'text-green-500' : 'text-gray-400'
                    }`} 
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto mb-6"
            >
              <ErrorMessage 
                message={error} 
                onClose={() => setError(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Profile Completion */}
            {currentStep === 1 && (
              <motion.div
                key="profile-completion"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="p-8 shadow-xl border-0">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                      Complete Your Profile
                    </h2>
                    <p className="text-gray-600">
                      We need some basic information to personalize your investment experience and ensure compliance.
                    </p>
                  </div>
                  
                  <ProfileCompletionForm
                    onSuccess={handleProfileComplete}
                    loading={loading}
                    showSkipOption={true}
                    onSkip={handleSkipToDashboard}
                  />
                </Card>
              </motion.div>
            )}

            {/* Step 2: Free Trial Activation */}
            {currentStep === 2 && (
              <motion.div
                key="free-trial"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="p-8 shadow-xl border-0 text-center">
                  <div className="mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Gift className="w-10 h-10 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                      Activate Your Free Trial
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Get 7 days of premium access to explore all our investment opportunities and platform features.
                    </p>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-6">
                      <h3 className="font-semibold text-purple-800 mb-3 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 mr-2" />
                        What's included in your free trial:
                      </h3>
                      <ul className="text-sm text-purple-700 space-y-2">
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          Browse all investment opportunities
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          Submit unlimited investment inquiries
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          Access premium market insights
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          Use advanced investment calculators
                        </li>
                      </ul>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-6">
                      <LoadingSpinner size="lg" />
                      <span className="ml-3 text-gray-600">Activating your free trial...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Button
                        onClick={handleActivateFreeTrial}
                        size="lg"
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        disabled={loading}
                      >
                        Activate Free Trial
                      </Button>
                      
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={handleSkipToDashboard}
                          className="text-gray-500 hover:text-gray-700 text-sm underline"
                        >
                          Skip and explore with basic access
                        </button>
                        
                        {error && (
                          <Button
                            onClick={handleSkipToDashboard}
                            variant="secondary"
                            size="sm"
                            className="mt-2"
                          >
                            Continue to Dashboard
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}

            {/* Step 3: Success & Dashboard Access */}
            {currentStep === 3 && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="p-8 shadow-xl border-0 text-center">
                  <div className="mb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </motion.div>
                    
                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="text-3xl font-bold text-gray-900 mb-3"
                    >
                      Welcome to Your Investment Journey!
                    </motion.h2>
                    
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      className="text-gray-600 mb-6"
                    >
                      Your free trial is now active. You have full access to our premium features for the next 7 days.
                    </motion.p>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-8"
                    >
                      <div className="flex items-center justify-center mb-3">
                        <Clock className="w-5 h-5 text-green-600 mr-2" />
                        <span className="font-semibold text-green-800">Trial expires in 7 days</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Make the most of your trial period. Explore investment opportunities, 
                        submit inquiries, and discover how our platform can help grow your wealth.
                      </p>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.0 }}
                  >
                    <Button
                      onClick={() => navigate('/dashboard')}
                      size="lg"
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      Access Your Dashboard
                    </Button>
                    
                    <p className="text-sm text-gray-500 mt-4">
                      Redirecting automatically in a few seconds...
                    </p>
                  </motion.div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-gray-500">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@africainvestment.com" className="text-blue-600 hover:underline">
              support@africainvestment.com
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default StreamlinedOnboarding;