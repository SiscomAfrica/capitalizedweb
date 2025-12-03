import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldX, LogOut, AlertCircle } from 'lucide-react';
import Button from './Button';
import Modal from './Modal';
import { useAuth } from '../../hooks/useAuth';

// Authentication error component
export const AuthError = ({
  error,
  onRetry,
  onLogin,
  className = '',
  variant = 'card'
}) => {
  const getErrorContent = () => {
    switch (error.type) {
      case 'unauthorized':
        return {
          icon: ShieldX,
          title: 'Session Expired',
          message: 'Your session has expired. Please log in again to continue.',
          action: 'Log In',
          actionHandler: onLogin,
        };
      case 'forbidden':
        return {
          icon: Shield,
          title: 'Access Denied',
          message: 'You do not have permission to perform this action.',
          action: 'Go Back',
          actionHandler: () => window.history.back(),
        };
      default:
        return {
          icon: AlertCircle,
          title: 'Authentication Error',
          message: error.message || 'An authentication error occurred.',
          action: 'Try Again',
          actionHandler: onRetry,
        };
    }
  };

  const { icon: Icon, title, message, action, actionHandler } = getErrorContent();

  if (variant === 'modal') {
    return (
      <Modal
        isOpen={true}
        onClose={() => {}}
        title={title}
        className="max-w-md"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon className="w-8 h-8 text-error-600" />
          </div>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          <Button
            onClick={actionHandler}
            variant="primary"
            className="w-full"
          >
            {action}
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <motion.div
      className={`
        flex flex-col items-center justify-center p-8 text-center
        bg-white rounded-lg shadow-sm border border-gray-200
        ${className}
      `.trim()}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-error-600" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-sm">
        {message}
      </p>
      
      <Button
        onClick={actionHandler}
        variant="primary"
        className="inline-flex items-center"
      >
        {action}
      </Button>
    </motion.div>
  );
};

// Session expiry modal
export const SessionExpiredModal = ({
  isOpen,
  onLogin,
  onClose
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          title="Session Expired"
          className="max-w-md"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-8 h-8 text-warning-600" />
            </div>
            
            <p className="text-gray-600 mb-6">
              Your session has expired for security reasons. Please log in again to continue.
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={onLogin}
                variant="primary"
                className="w-full"
              >
                Log In Again
              </Button>
              
              <Button
                onClick={onClose}
                variant="secondary"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

// Access denied component
export const AccessDenied = ({
  message = 'You do not have permission to access this resource.',
  onGoBack,
  className = ''
}) => {
  return (
    <motion.div
      className={`
        flex flex-col items-center justify-center min-h-96 p-8 text-center
        ${className}
      `.trim()}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-20 h-20 bg-error-100 rounded-full flex items-center justify-center mb-6">
        <Shield className="w-10 h-10 text-error-600" />
      </div>
      
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        Access Denied
      </h2>
      
      <p className="text-gray-600 mb-8 max-w-md">
        {message}
      </p>
      
      <div className="space-x-4">
        <Button
          onClick={onGoBack || (() => window.history.back())}
          variant="secondary"
        >
          Go Back
        </Button>
        
        <Button
          onClick={() => window.location.href = '/'}
          variant="primary"
        >
          Go Home
        </Button>
      </div>
    </motion.div>
  );
};

// Hook for handling authentication errors
export const useAuthErrorHandler = () => {
  const { logout } = useAuth();
  const [authError, setAuthError] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);

  const handleAuthError = (error) => {
    if (error.type === 'unauthorized' || error.status === 401) {
      // Clear tokens and show session expired modal
      logout();
      setShowSessionModal(true);
      return true; // Indicates error was handled
    }
    
    if (error.type === 'forbidden' || error.status === 403) {
      setAuthError({
        type: 'forbidden',
        message: 'You do not have permission to perform this action.',
        originalError: error,
      });
      return true; // Indicates error was handled
    }
    
    return false; // Indicates error was not handled
  };

  const clearError = () => {
    setAuthError(null);
  };

  const handleLogin = () => {
    setShowSessionModal(false);
    window.location.href = '/login';
  };

  const handleCloseModal = () => {
    setShowSessionModal(false);
  };

  return {
    authError,
    showSessionModal,
    handleAuthError,
    clearError,
    handleLogin,
    handleCloseModal,
  };
};

// HOC for wrapping components with auth error handling
export const withAuthErrorHandling = (Component) => {
  return function AuthErrorWrapper(props) {
    const {
      authError,
      showSessionModal,
      handleAuthError,
      clearError,
      handleLogin,
      handleCloseModal,
    } = useAuthErrorHandler();

    const handleError = (error) => {
      const wasHandled = handleAuthError(error);
      if (!wasHandled && props.onError) {
        props.onError(error);
      }
    };

    if (authError && authError.type === 'forbidden') {
      return (
        <AccessDenied
          message={authError.message}
          onGoBack={clearError}
        />
      );
    }

    return (
      <>
        <Component
          {...props}
          onAuthError={handleError}
        />
        
        <SessionExpiredModal
          isOpen={showSessionModal}
          onLogin={handleLogin}
          onClose={handleCloseModal}
        />
      </>
    );
  };
};

export default AuthError;