import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, requireKYC = false }) => {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    isKYCApproved,
    isPhoneVerified
  } = useAuth();
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

  // Redirect to phone verification if phone is not verified
  if (!isPhoneVerified()) {
    return (
      <Navigate 
        to="/verify-phone" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // If KYC is required but not approved, redirect to KYC page
  if (requireKYC && !isKYCApproved()) {
    // Check if user has submitted KYC but it's pending
    if (user?.kycStatus === 'pending') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-secondary-50">
          <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-md">
            <div className="mb-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

    // Check if KYC was rejected
    if (user?.kycStatus === 'rejected') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-secondary-50">
          <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-md">
            <div className="mb-4">
              <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-secondary-900 mb-2">
                KYC Verification Required
              </h2>
              <p className="text-secondary-600 mb-4">
                Your previous KYC submission was not approved. Please resubmit your identity documents to access this feature.
              </p>
            </div>
            <Navigate 
              to="/profile?tab=kyc" 
              state={{ from: location.pathname }} 
              replace 
            />
          </div>
        </div>
      );
    }

    // No KYC submitted yet - redirect to profile/KYC page
    return (
      <Navigate 
        to="/profile?tab=kyc" 
        state={{ 
          from: location.pathname,
          message: 'Please complete your KYC verification to access this feature.'
        }} 
        replace 
      />
    );
  }

  // All checks passed - render the protected content
  return children;
};

export default ProtectedRoute;