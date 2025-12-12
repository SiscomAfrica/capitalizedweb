import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PhoneVerification from '../../components/auth/PhoneVerification';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const VerifyPhonePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, user, isPhoneVerified } = useAuth();
  const [pageLoading, setPageLoading] = useState(false);

  // Get data from location state
  const phone = location.state?.phone || user?.phone;
  const from = location.state?.from || '/dashboard';
  const message = location.state?.message;

  // Redirect if not authenticated AND no phone number from registration
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !phone) {
      navigate('/login', { 
        state: { from: location.pathname },
        replace: true 
      });
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname, phone]);

  // Redirect if already phone verified
  useEffect(() => {
    if (isAuthenticated && !isLoading && isPhoneVerified()) {
      // Check if profile is completed to determine redirect
      const profileCompleted = user?.profile_completed || user?.profileCompleted;
      const redirectTo = profileCompleted ? '/dashboard' : '/onboarding/streamlined';
      
      navigate(redirectTo, { 
        replace: true,
        state: {
          message: 'Phone verification successful! Welcome to Africa Investment Platform.'
        }
      });
    }
  }, [isAuthenticated, isLoading, isPhoneVerified, navigate, user]);

  const handleVerificationSuccess = (response) => {
    setPageLoading(true);
    // The useEffect will handle the redirect when the auth state updates
  };

  // Show loading spinner while checking authentication or navigating
  if (isLoading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-secondary-600">
            {pageLoading ? 'Verifying your phone...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error if no phone number available and not authenticated
  if (!phone && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-md">
          <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-secondary-600 mb-4">
            Please sign in first to access phone verification.
          </p>
          <div className="space-y-3">
            <Link
              to="/login"
              state={{ from: '/verify-phone' }}
              className="block w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="block w-full bg-secondary-100 text-secondary-700 px-4 py-2 rounded-lg hover:bg-secondary-200 transition-colors"
            >
              Create Account
            </Link>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
            <p><strong>💡 Tip:</strong> Phone verification happens automatically after login if your phone isn't verified yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="mx-auto w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mb-4"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold text-secondary-900">
            Capitalized
          </h1>
          <p className="text-secondary-600 mt-2">
            Verify Your Phone Number
          </p>
        </div>

        {/* Success Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="mb-6 bg-success-50 border border-success-200 rounded-lg p-4 text-success-700 text-sm text-center"
          >
            {message}
          </motion.div>
        )}

        {/* Phone Verification Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <PhoneVerification 
            phone={phone} 
            onSuccess={handleVerificationSuccess} 
          />
          
          {/* Additional Actions */}
          <div className="mt-6 pt-6 border-t border-secondary-200">
            <div className="text-center space-y-3">
              <p className="text-sm text-secondary-600">
                Need to update your phone number?
              </p>
              <Link
                to="/profile"
                className="inline-block text-primary-600 hover:text-primary-700 font-medium transition-colors text-sm"
              >
                Update Profile
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mt-8 bg-white/80 backdrop-blur-sm rounded-lg p-6"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-primary-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-secondary-900">
                Security Notice
              </h3>
              <p className="text-xs text-secondary-600 mt-1">
                We use phone verification to secure your account and ensure you receive important notifications about your investments.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="text-center mt-8"
        >
          <p className="text-xs text-secondary-500">
            Having trouble?{' '}
            <Link to="/support" className="text-primary-600 hover:text-primary-700">
              Contact Support
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VerifyPhonePage;