import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoginForm from '../../components/auth/LoginForm';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, isPhoneVerified } = useAuth();
  const [pageLoading, setPageLoading] = useState(false);

  // Get the intended destination from location state
  const from = location.state?.from || '/dashboard';

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

  const handleLoginSuccess = (response) => {
    setPageLoading(true);
    
    // Check if phone verification is needed
    if (response.user && !response.user.phone_verified) {
      navigate('/verify-phone', { 
        state: { 
          phone: response.user.phone,
          from: from 
        },
        replace: true 
      });
    } else {
      // Navigate to intended destination or dashboard
      navigate(from, { replace: true });
    }
  };

  // Show loading spinner while checking authentication or navigating
  if (isLoading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-secondary-600">
            {pageLoading ? 'Signing you in...' : 'Loading...'}
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
            Your Investment Platform
          </p>
        </div>

        {/* Login Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <LoginForm onSuccess={handleLoginSuccess} />
          
          {/* Additional Links */}
          <div className="mt-6 pt-6 border-t border-secondary-200">
            <div className="text-center space-y-2">
              <p className="text-sm text-secondary-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  state={{ from: from }}
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  Create one here
                </Link>
              </p>
              
              <p className="text-sm text-secondary-600">
                <Link
                  to="/forgot-password"
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  Forgot your password?
                </Link>
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
            By signing in, you agree to our{' '}
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

export default LoginPage;