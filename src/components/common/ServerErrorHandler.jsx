import React from 'react';
import { motion } from 'framer-motion';
import { Server, AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from './Button';

// Server error sanitizer - removes technical details from error messages
export const sanitizeErrorMessage = (error) => {
  // List of technical terms to remove or replace
  const technicalPatterns = [
    /stack trace/gi,
    /internal server error/gi,
    /database connection/gi,
    /sql error/gi,
    /exception/gi,
    /traceback/gi,
    /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, // IP addresses
    /\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b/gi, // UUIDs
    /\b[A-Z][a-zA-Z]*Exception\b/g, // Exception class names
    /\bat line \d+/gi,
    /\bin file .+/gi,
    /\berror code: \d+/gi,
  ];

  let sanitizedMessage = error?.message || 'An unexpected error occurred';

  // Remove technical patterns
  technicalPatterns.forEach(pattern => {
    sanitizedMessage = sanitizedMessage.replace(pattern, '');
  });

  // Clean up extra whitespace
  sanitizedMessage = sanitizedMessage.replace(/\s+/g, ' ').trim();

  // If the message is too technical or empty, use a generic message
  if (
    sanitizedMessage.length < 10 ||
    /^[A-Z_]+$/.test(sanitizedMessage) || // All caps constants
    /^\d+$/.test(sanitizedMessage) || // Just numbers
    sanitizedMessage.includes('undefined') ||
    sanitizedMessage.includes('null')
  ) {
    sanitizedMessage = 'Something went wrong on our end. Please try again later.';
  }

  return sanitizedMessage;
};

// Server error component
export const ServerError = ({
  error,
  onRetry,
  onGoHome,
  className = '',
  variant = 'card',
  showDetails = false,
}) => {
  const sanitizedMessage = sanitizeErrorMessage(error);
  
  // Determine error type and icon
  const getErrorType = () => {
    if (error?.status >= 500 && error?.status < 600) {
      return {
        icon: Server,
        title: 'Server Error',
        description: 'Our servers are experiencing issues. Please try again in a few moments.',
      };
    }
    
    return {
      icon: AlertTriangle,
      title: 'Something Went Wrong',
      description: sanitizedMessage,
    };
  };

  const { icon: Icon, title, description } = getErrorType();

  if (variant === 'page') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-20 h-20 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon className="w-10 h-10 text-error-600" />
          </div>
          
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            {title}
          </h1>
          
          <p className="text-gray-600 mb-8">
            {description}
          </p>
          
          <div className="space-y-3">
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="primary"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            
            <Button
              onClick={onGoHome || (() => window.location.href = '/')}
              variant="secondary"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
          
          {/* Show error details in development */}
          {showDetails && import.meta.env.DEV && error && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Error Details (Development Only)
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto max-h-32">
                <div className="mb-2">
                  <strong>Status:</strong> {error.status}
                </div>
                <div className="mb-2">
                  <strong>Message:</strong> {error.message}
                </div>
                {error.data && (
                  <div>
                    <strong>Data:</strong>
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(error.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </motion.div>
      </div>
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
        {description}
      </p>
      
      {onRetry && (
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

// Maintenance mode component
export const MaintenanceMode = ({
  message = 'We are currently performing scheduled maintenance. Please check back soon.',
  estimatedTime,
  className = '',
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div
        className={`max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-20 h-20 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Server className="w-10 h-10 text-warning-600" />
        </div>
        
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Under Maintenance
        </h1>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        
        {estimatedTime && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              <strong>Estimated completion:</strong> {estimatedTime}
            </p>
          </div>
        )}
        
        <Button
          onClick={() => window.location.reload()}
          variant="primary"
          className="w-full"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Check Again
        </Button>
      </motion.div>
    </div>
  );
};

// Hook for handling server errors
export const useServerErrorHandler = () => {
  const [serverError, setServerError] = React.useState(null);

  const handleServerError = (error) => {
    // Check if it's a server error (5xx status codes)
    if (error.status >= 500 && error.status < 600) {
      const sanitizedError = {
        ...error,
        message: sanitizeErrorMessage(error),
        type: 'server',
      };
      
      setServerError(sanitizedError);
      
      // Log the original error for debugging (in development)
      if (import.meta.env.DEV) {
        console.error('Server Error:', error);
      }
      
      return true; // Indicates error was handled
    }
    
    return false; // Indicates error was not handled
  };

  const clearError = () => {
    setServerError(null);
  };

  const retry = (retryFunction) => {
    clearError();
    if (retryFunction) {
      return retryFunction();
    }
  };

  return {
    serverError,
    handleServerError,
    clearError,
    retry,
  };
};

// HOC for wrapping components with server error handling
export const withServerErrorHandling = (Component) => {
  return function ServerErrorWrapper(props) {
    const { serverError, handleServerError, clearError, retry } = useServerErrorHandler();

    const handleError = (error) => {
      const wasHandled = handleServerError(error);
      if (!wasHandled && props.onError) {
        props.onError(error);
      }
    };

    if (serverError) {
      return (
        <ServerError
          error={serverError}
          onRetry={() => retry(props.onRetry)}
          onGoHome={() => window.location.href = '/'}
        />
      );
    }

    return (
      <Component
        {...props}
        onServerError={handleError}
      />
    );
  };
};

export default ServerError;