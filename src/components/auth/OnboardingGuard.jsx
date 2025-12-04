import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useOnboarding from '../../hooks/useOnboarding';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * OnboardingGuard component that enforces the streamlined onboarding flow
 * Register → Phone Verification → Profile Completion → Free Trial → Dashboard Access
 */
const OnboardingGuard = ({ children, requireSubscription = false }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { 
    canAccessDashboard, 
    canInvest,
    canSubscribe,
    requiresOnboarding, 
    redirectTo, 
    currentStep,
    steps 
  } = useOnboarding();
  const location = useLocation();

  // Show loading spinner while authentication state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // If subscription is specifically required and user doesn't have one
  if (requireSubscription && !steps.freeTrialActivated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-md">
          <div className="mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">
              Subscription Required
            </h2>
            <p className="text-secondary-600 mb-4">
              This feature requires an active subscription. Start your free trial or choose a plan to continue.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/subscriptions/plans'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Plans & Start Free Trial
            </button>
            <button
              onClick={() => window.history.back()}
              className="text-secondary-600 hover:text-secondary-700 font-medium transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if user needs to complete onboarding steps
  if (requiresOnboarding()) {
    // Allow access to onboarding pages themselves
    const onboardingPaths = ['/onboarding/streamlined', '/onboarding/profile', '/verify-phone'];
    if (onboardingPaths.includes(location.pathname)) {
      return children;
    }

    // Redirect to the appropriate onboarding step
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // If user has completed onboarding but is on an onboarding page, redirect to dashboard
  if (canAccessDashboard && location.pathname.startsWith('/onboarding')) {
    return (
      <Navigate 
        to="/dashboard" 
        replace 
      />
    );
  }

  // All onboarding checks passed - render the protected content
  return children;
};

export default OnboardingGuard;