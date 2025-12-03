import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useOnboarding from '../../hooks/useOnboarding';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * OnboardingGuard component that enforces the onboarding flow
 * Redirects users to the appropriate onboarding step if not completed
 */
const OnboardingGuard = ({ children, requireKYC = false }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { 
    canAccessDashboard, 
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

  // If KYC is specifically required and not approved, show appropriate message
  if (requireKYC && !steps.kycApproved) {
    if (currentStep === 'kyc_pending') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-secondary-50">
          <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-md">
            <div className="mb-4">
              <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-secondary-900 mb-2">
                KYC Verification Pending
              </h2>
              <p className="text-secondary-600 mb-4">
                Your identity documents are currently being reviewed. This process typically takes 1-2 business days.
              </p>
              <p className="text-sm text-secondary-500">
                You'll receive an email notification once your verification is complete.
              </p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }

    if (currentStep === 'kyc_rejected') {
      return (
        <Navigate 
          to="/onboarding/kyc" 
          state={{ 
            from: location.pathname,
            message: 'Your previous KYC submission was not approved. Please resubmit your documents.'
          }} 
          replace 
        />
      );
    }

    // KYC not submitted yet
    return (
      <Navigate 
        to="/onboarding/kyc" 
        state={{ 
          from: location.pathname,
          message: 'Please complete your KYC verification to access this feature.'
        }} 
        replace 
      />
    );
  }

  // Check if user needs to complete onboarding steps
  if (requiresOnboarding()) {
    // Allow access to onboarding pages themselves
    const onboardingPaths = ['/onboarding/profile', '/onboarding/kyc', '/verify-phone'];
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