import { useMemo } from 'react';
import useAuth from './useAuth';

/**
 * Hook to manage user onboarding status and flow
 * Implements the streamlined flow: Register → Phone Verification → Profile Completion → Free Trial → Dashboard Access
 */
const useOnboarding = () => {
  const { user, isAuthenticated, isPhoneVerified } = useAuth();

  // Calculate onboarding status for streamlined flow
  const onboardingStatus = useMemo(() => {
    if (!isAuthenticated || !user) {
      return {
        isComplete: false,
        currentStep: 'login',
        nextStep: 'login',
        redirectTo: '/login',
        canAccessDashboard: false,
        canInvest: false,
        canSubscribe: false,
        steps: {
          phoneVerified: false,
          profileCompleted: false,
          freeTrialActivated: false
        }
      };
    }

    // Check each step in the streamlined flow
    const phoneVerified = isPhoneVerified();
    const profileCompleted = user.profile_completed || user.profileCompleted || false;
    
    // Check if user has any active subscription (including free trial)
    const hasActiveSubscription = user.subscription_status === 'active' || 
                                 user.subscription_status === 'trial' ||
                                 user.has_active_subscription === true;

    // Determine current step and next action based on streamlined flow
    let currentStep = 'complete';
    let nextStep = 'complete';
    let redirectTo = '/dashboard';
    let canAccessDashboard = false;
    let canInvest = false;
    let canSubscribe = false;

    if (!phoneVerified) {
      // Step 1: Phone Verification (should be handled before reaching onboarding)
      currentStep = 'phone_verification';
      nextStep = 'verify_phone';
      redirectTo = '/verify-phone';
    } else if (!profileCompleted) {
      // Step 2: Profile Completion
      currentStep = 'profile_completion';
      nextStep = 'complete_profile';
      redirectTo = '/onboarding/streamlined';
    } else {
      // Step 3: Profile completed - user can access dashboard and features
      canAccessDashboard = true;
      canInvest = true; // Can submit investment inquiries
      canSubscribe = true; // Can subscribe to plans
      
      if (!hasActiveSubscription) {
        // Step 4: Free trial available but not required for dashboard access
        currentStep = 'free_trial_available';
        nextStep = 'activate_free_trial';
        // Don't redirect - user can access dashboard without trial
      } else {
        // Step 5: Complete - user has subscription
        currentStep = 'complete';
        nextStep = 'complete';
      }
    }

    // Streamlined onboarding is complete when phone is verified and profile is completed
    // Free trial is optional but recommended
    const isComplete = phoneVerified && profileCompleted;

    return {
      isComplete,
      currentStep,
      nextStep,
      redirectTo,
      canAccessDashboard,
      canInvest,
      canSubscribe,
      steps: {
        phoneVerified,
        profileCompleted,
        freeTrialActivated: hasActiveSubscription
      },
      progress: {
        completed: [
          phoneVerified && 'phone_verification',
          profileCompleted && 'profile_completion',
          hasActiveSubscription && 'free_trial_activation'
        ].filter(Boolean),
        total: 2, // phone + profile (free trial is optional)
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
    user?.subscription_status,
    user?.has_active_subscription,
    isAuthenticated,
    isPhoneVerified
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
        return 'Complete your profile to access the dashboard and start investing';
      case 'activate_free_trial':
        return 'Activate your free trial to unlock premium features';
      case 'complete':
        return 'Welcome to your investment dashboard!';
      default:
        return 'Continue with the setup process';
    }
  };

  const getStepTitle = (step) => {
    switch (step) {
      case 'phone_verification':
        return 'Verify Phone Number';
      case 'profile_completion':
        return 'Complete Profile';
      case 'free_trial_available':
        return 'Free Trial Available';
      case 'complete':
        return 'Setup Complete';
      default:
        return 'Getting Started';
    }
  };

  const getStepDescription = (step) => {
    switch (step) {
      case 'phone_verification':
        return 'Verify your phone number with the OTP code sent to you';
      case 'profile_completion':
        return 'Provide basic information to personalize your investment experience';
      case 'free_trial_available':
        return 'Activate your 7-day free trial to access premium features';
      case 'complete':
        return 'You can now access all platform features and start investing';
      default:
        return 'Complete the setup to access your investment dashboard';
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