import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import Button from './Button';
import { ErrorBanner } from './ErrorMessage';

// Network status detector
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Show reconnection message briefly
        setTimeout(() => setWasOffline(false), 3000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
};

// Network error component
export const NetworkError = ({
  onRetry,
  message = 'Connection Error',
  description = 'Please check your internet connection and try again.',
  className = '',
  showRetry = true,
  variant = 'card'
}) => {
  const { isOnline } = useNetworkStatus();

  if (variant === 'banner') {
    return (
      <ErrorBanner
        message={`${message}: ${description}`}
        onRetry={showRetry ? onRetry : undefined}
        className={className}
      />
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
        <WifiOff className="w-8 h-8 text-error-600" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {message}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-sm">
        {description}
      </p>

      {!isOnline && (
        <div className="flex items-center text-sm text-warning-600 mb-4">
          <AlertCircle className="w-4 h-4 mr-2" />
          You appear to be offline
        </div>
      )}
      
      {showRetry && onRetry && (
        <Button
          onClick={onRetry}
          variant="primary"
          className="inline-flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </motion.div>
  );
};

// Network status banner
export const NetworkStatusBanner = () => {
  const { isOnline, wasOffline } = useNetworkStatus();
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-50 bg-error-600 text-white px-4 py-2 text-center text-sm font-medium"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-center">
            <WifiOff className="w-4 h-4 mr-2" />
            You're currently offline. Some features may not work.
          </div>
        </motion.div>
      )}
      
      {showReconnected && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-50 bg-success-600 text-white px-4 py-2 text-center text-sm font-medium"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          transition={{ duration: 0.3 }}
        >
          Connection restored!
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// HOC for wrapping components with network error handling
export const withNetworkErrorHandling = (Component) => {
  return function NetworkErrorWrapper(props) {
    const [networkError, setNetworkError] = useState(null);
    const { isOnline } = useNetworkStatus();

    const handleNetworkError = (error) => {
      if (error.type === 'network' || !isOnline) {
        setNetworkError(error);
      }
    };

    const handleRetry = () => {
      setNetworkError(null);
      if (props.onRetry) {
        props.onRetry();
      }
    };

    if (networkError) {
      return (
        <NetworkError
          onRetry={handleRetry}
          message="Connection Error"
          description="Unable to connect to the server. Please check your internet connection and try again."
        />
      );
    }

    return (
      <Component
        {...props}
        onNetworkError={handleNetworkError}
      />
    );
  };
};

// Hook for handling network errors in API calls
export const useNetworkErrorHandler = () => {
  const { isOnline } = useNetworkStatus();
  const [networkError, setNetworkError] = useState(null);

  const handleError = (error) => {
    if (error.type === 'network' || (!isOnline && error.code === 'NETWORK_ERROR')) {
      setNetworkError({
        message: 'Connection Error',
        description: 'Please check your internet connection and try again.',
        originalError: error,
      });
      return true; // Indicates error was handled
    }
    return false; // Indicates error was not handled
  };

  const clearError = () => {
    setNetworkError(null);
  };

  const retry = (retryFunction) => {
    clearError();
    if (retryFunction) {
      return retryFunction();
    }
  };

  return {
    networkError,
    handleError,
    clearError,
    retry,
    isOnline,
  };
};

export default NetworkError;