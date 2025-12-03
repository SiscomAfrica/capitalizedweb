import React from 'react';
import { CheckCircle, Circle, Clock, XCircle } from 'lucide-react';
import useOnboarding from '../../hooks/useOnboarding';

/**
 * OnboardingProgress component that shows the user's progress through onboarding steps
 */
const OnboardingProgress = ({ className = '' }) => {
  const { steps, currentStep, progress } = useOnboarding();

  const getStepIcon = (stepKey, isCompleted, isCurrent) => {
    if (isCompleted) {
      return <CheckCircle className="w-5 h-5 text-success-600" />;
    }
    
    if (isCurrent) {
      if (stepKey === 'kyc' && currentStep === 'kyc_pending') {
        return <Clock className="w-5 h-5 text-warning-600" />;
      }
      if (stepKey === 'kyc' && currentStep === 'kyc_rejected') {
        return <XCircle className="w-5 h-5 text-error-600" />;
      }
      return <Circle className="w-5 h-5 text-primary-600 fill-current" />;
    }
    
    return <Circle className="w-5 h-5 text-secondary-300" />;
  };

  const getStepStatus = (stepKey, isCompleted, isCurrent) => {
    if (isCompleted) return 'completed';
    if (isCurrent) {
      if (stepKey === 'kyc' && currentStep === 'kyc_pending') return 'pending';
      if (stepKey === 'kyc' && currentStep === 'kyc_rejected') return 'rejected';
      return 'current';
    }
    return 'upcoming';
  };

  const onboardingSteps = [
    {
      key: 'phone',
      label: 'Phone Verified',
      completed: steps.phoneVerified,
      isCurrent: currentStep === 'phone_verification'
    },
    {
      key: 'profile',
      label: 'Profile Complete',
      completed: steps.profileCompleted,
      isCurrent: currentStep === 'profile_completion'
    },
    {
      key: 'kyc',
      label: 'KYC Process',
      completed: steps.kycApproved,
      isCurrent: ['kyc_submission', 'kyc_pending', 'kyc_rejected'].includes(currentStep)
    }
  ];

  return (
    <div className={`bg-white rounded-lg border border-secondary-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-secondary-900">Onboarding Progress</h3>
        <span className="text-sm text-secondary-600">{progress.percentage}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-secondary-200 rounded-full h-2 mb-4">
        <div 
          className="h-2 rounded-full bg-primary-500 transition-all duration-300"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {onboardingSteps.map((step, index) => {
          const status = getStepStatus(step.key, step.completed, step.isCurrent);
          
          return (
            <div key={step.key} className="flex items-center gap-3">
              {getStepIcon(step.key, step.completed, step.isCurrent)}
              
              <div className="flex-1">
                <div className={`text-sm font-medium ${
                  status === 'completed' ? 'text-success-700' :
                  status === 'current' ? 'text-primary-700' :
                  status === 'pending' ? 'text-warning-700' :
                  status === 'rejected' ? 'text-error-700' :
                  'text-secondary-500'
                }`}>
                  {step.label}
                </div>
                
                {status === 'pending' && (
                  <div className="text-xs text-warning-600">Under review</div>
                )}
                
                {status === 'rejected' && (
                  <div className="text-xs text-error-600">Resubmission required</div>
                )}
                

              </div>

              {/* Connection line to next step */}
              {index < onboardingSteps.length - 1 && (
                <div className="absolute left-6 mt-8 w-px h-4 bg-secondary-200" />
              )}
            </div>
          );
        })}
      </div>

      {/* Status Message */}
      {currentStep !== 'complete' && (
        <div className="mt-4 p-3 bg-primary-50 rounded-lg">
          <p className="text-sm text-primary-700">
            {currentStep === 'kyc_pending' && 'Your documents are being reviewed. You can access your dashboard while we process them.'}
            {currentStep === 'kyc_rejected' && 'Please resubmit your KYC documents with the required corrections.'}
            {currentStep === 'profile_completion' && 'Complete your profile to proceed to KYC verification.'}
            {currentStep === 'kyc_submission' && 'Complete the KYC process to access your dashboard.'}

          </p>
        </div>
      )}
    </div>
  );
};

export default OnboardingProgress;