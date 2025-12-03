import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * ProtectedRoute component that only handles basic authentication
 * For onboarding flow enforcement, use OnboardingGuard
 */
const ProtectedRoute = ({ children }) => {
  const { 
    isAuthenticated, 
    isLoading, 
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

  // Basic authentication checks passed - render the protected content
  return children;
};

export default ProtectedRoute;