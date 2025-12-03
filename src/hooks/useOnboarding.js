import { useMemo } from 'react';
import useAuth from './useAuth';

/**
 * Hook to manage user onboarding status and flow
 * Determines what steps the user needs to complete before accessing the dashboard
 */
const useOnboarding = () => {
  const { user, isAuthenticated } = useAuth();

  // Calculate onboarding status
  const onboardingStatus = useMemo(() => {
    if (!isAuthenticated || !user) {
      return {
        isComplete: false,
        currentStep: 'login',
        nextStep: 'login',
        redirectTo: '/login',
        canAccessDashboard: false,
        steps: {
          phoneVerified: false,
          profileCompleted: false,
          kycSubmitted: false,
          kycApproved: false
        }
      };
    }

    // Check each onboarding step
    const phoneVerified = user.phone_verified || user.phoneVerified || false;
    const profileCompleted = user.profile_completed || user.profileCompleted || false;
    const kycSubmitted = user.kyc_status !== 'not_submitted' && user.kyc_status !== undefined;
    const kycApproved = user.kyc_status === 'approved';
    const kycCompleted = user.kyc_status === 'completed';
    const kycSkipped = user.kyc_status === 'skipped';

    // Determine current step and next action
    let currentStep = 'complete';
    let nextStep = 'complete';
    let redirectTo = '/dashboard';
    let canAccessDashboard = false;

    if (!phoneVerified) {
      currentStep = 'phone_verification';
      nextStep = 'verify_phone';
      redirectTo = '/verify-phone';
    } else if (!profileCompleted) {
      currentStep = 'profile_completion';
      nextStep = 'complete_profile';
      redirectTo = '/onboarding/profile';
    } else {
      // Profile is completed - allow dashboard access
      // KYC is optional and can be completed later
      canAccessDashboard = true;
      
      if (!kycSubmitted) {
        currentStep = 'kyc_optional';
        nextStep = 'submit_kyc_optional';
        // Don't redirect - user can access dashboard
      } else if (user.kyc_status === 'pending') {
        currentStep = 'kyc_pending';
        nextStep = 'kyc_under_review';
      } else if (user.kyc_status === 'rejected') {
        currentStep = 'kyc_rejected';
        nextStep = 'resubmit_kyc';
      } else if (kycCompleted || kycSkipped || kycApproved) {
        currentStep = 'complete';
        nextStep = 'complete';
      }
    }

    // Core onboarding is complete when phone is verified and profile is completed
    // KYC is optional for dashboard access
    const isComplete = phoneVerified && profileCompleted;

    return {
      isComplete,
      currentStep,
      nextStep,
      redirectTo,
      canAccessDashboard,
      steps: {
        phoneVerified,
        profileCompleted,
        kycSubmitted,
        kycApproved
      },
      progress: {
        completed: [
          phoneVerified && 'phone_verification',
          profileCompleted && 'profile_completion',
          kycSubmitted && 'kyc_submission',
          kycApproved && 'kyc_approval'
        ].filter(Boolean),
        total: 2, // phone, profile (KYC is optional for dashboard access)
        percentage: Math.round(
          ([phoneVerified, profileCompleted].filter(Boolean).length / 2) * 100
        )
      }
    };
  }, [
    user?.id,
    user?.phone_verified,
    user?.phoneVerified,
    user?.profile_completed,
    user?.profileCompleted,
    user?.kyc_status,
    isAuthenticated
  ]);

  // Helper functions
  const requiresOnboarding = () => {
    return !onboardingStatus.canAccessDashboard;
  };

  const getNextStepMessage = () => {
    switch (onboardingStatus.nextStep) {
      case 'verify_phone':
        return 'Please verify your phone number to continue';
      case 'complete_profile':
        return 'Complete your profile to access the dashboard';
      case 'submit_kyc':
        return 'Complete your KYC process to access the dashboard';
      case 'kyc_under_review':
        return 'Your KYC documents are under review';
      case 'resubmit_kyc':
        return 'Please resubmit your KYC documents';

      case 'complete':
        return 'Onboarding complete! Welcome to your dashboard';
      default:
        return 'Continue with the onboarding process';
    }
  };

  const getStepTitle = (step) => {
    switch (step) {
      case 'phone_verification':
        return 'Verify Phone Number';
      case 'profile_completion':
        return 'Complete Profile';
      case 'kyc_submission':
        return 'Complete KYC Process';
      case 'kyc_pending':
        return 'KYC Under Review';
      case 'kyc_rejected':
        return 'KYC Resubmission Required';

      case 'complete':
        return 'Onboarding Complete';
      default:
        return 'Onboarding';
    }
  };

  const getStepDescription = (step) => {
    switch (step) {
      case 'phone_verification':
        return 'Verify your phone number with the OTP code sent to you';
      case 'profile_completion':
        return 'Provide your personal information including date of birth, country, city, and address';
      case 'kyc_submission':
        return 'Complete the KYC process (document upload is optional for now)';
      case 'kyc_pending':
        return 'Your documents are being reviewed by our team';
      case 'kyc_rejected':
        return 'Your previous submission was not approved. Please resubmit with correct documents';

      case 'complete':
        return 'You have successfully completed the onboarding process';
      default:
        return 'Complete the required steps to access your dashboard';
    }
  };

  return {
    ...onboardingStatus,
    requiresOnboarding,
    getNextStepMessage,
    getStepTitle,
    getStepDescription,
    user
  };
};

export default useOnboarding;