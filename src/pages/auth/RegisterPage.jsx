import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import RegisterForm from '../../components/auth/RegisterForm';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, isPhoneVerified } = useAuth();
  const [pageLoading, setPageLoading] = useState(false);

  // Get the intended destination and initial data from location state
  const from = location.state?.from || '/dashboard';
  const initialData = location.state?.initialData || {};

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      if (isPhoneVerified()) {
        navigate(from, { replace: true });
      } else {
        navigate('/verify-phone', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, isPhoneVerified, navigate, from]);

  const handleRegistrationSuccess = (response) => {
    setPageLoading(true);
    
    // After successful registration, navigate to phone verification
    navigate('/verify-phone', { 
      state: { 
        phone: response.user?.phone || response.phone,
        from: from,
        message: 'Registration successful! Please verify your phone number to continue.'
      },
      replace: true 
    });
  };

  // Show loading spinner while checking authentication or navigating
  if (isLoading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-secondary-600">
            {pageLoading ? 'Creating your account...' : 'Loading...'}
          </p>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold text-secondary-900">
            Capitalized
          </h1>
          <p className="text-secondary-600 mt-2">
            Start Your Investment Journey
          </p>
        </div>

        {/* Registration Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          {/* Show helpful message if coming from login attempt */}
          {(initialData.email || initialData.phone) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg"
            >
              <div className="flex items-start">
                <svg className="w-5 h-5 text-primary-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-primary-800 font-medium">
                    No account found
                  </p>
                  <p className="text-sm text-primary-700 mt-1">
                    We've pre-filled your {initialData.email ? 'email' : 'phone number'} below. Complete the form to create your account.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          <RegisterForm onSuccess={handleRegistrationSuccess} initialData={initialData} />
          
          {/* Additional Links */}
          <div className="mt-6 pt-6 border-t border-secondary-200">
            <div className="text-center">
              <p className="text-sm text-secondary-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  state={{ from: from }}
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mt-8 bg-white/80 backdrop-blur-sm rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-secondary-900 mb-4 text-center">
            Why Choose Capitalized?
          </h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm text-secondary-700">
              <svg className="w-4 h-4 text-success-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Secure and regulated investment platform
            </div>
            <div className="flex items-center text-sm text-secondary-700">
              <svg className="w-4 h-4 text-success-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Diverse investment opportunities
            </div>
            <div className="flex items-center text-sm text-secondary-700">
              <svg className="w-4 h-4 text-success-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Expert portfolio management
            </div>
            <div className="flex items-center text-sm text-secondary-700">
              <svg className="w-4 h-4 text-success-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              24/7 customer support
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
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-primary-600 hover:text-primary-700">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary-600 hover:text-primary-700">
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;