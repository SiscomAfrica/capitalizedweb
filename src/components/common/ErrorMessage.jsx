import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import Button from './Button';

const ErrorMessage = ({
  message,
  onRetry,
  onDismiss,
  variant = 'default',
  size = 'md',
  showIcon = true,
  className = '',
  retryText = 'Try Again',
  dismissible = false,
  ...props
}) => {
  // Variant styles
  const variantStyles = {
    default: 'bg-error-50 border-error-200 text-error-800',
    solid: 'bg-error-600 border-error-600 text-white',
    minimal: 'bg-transparent border-transparent text-error-600'
  };

  // Size styles
  const sizeStyles = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
    lg: 'p-6 text-lg'
  };

  // Icon size styles
  const iconSizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const containerClasses = `
    flex items-start space-x-3 rounded-lg border
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${className}
  `.trim();

  const iconClasses = `flex-shrink-0 ${iconSizeStyles[size]} ${
    variant === 'solid' ? 'text-white' : 'text-error-500'
  }`;

  return (
    <motion.div
      className={containerClasses}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      role="alert"
      aria-live="polite"
      {...props}
    >
      {showIcon && (
        <AlertCircle className={iconClasses} />
      )}
      
      <div className="flex-1 min-w-0">
        <p className="font-medium leading-relaxed">
          {message}
        </p>
        
        {onRetry && (
          <div className="mt-3">
            <Button
              variant={variant === 'solid' ? 'secondary' : 'primary'}
              size="sm"
              onClick={onRetry}
              className="inline-flex items-center"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              {retryText}
            </Button>
          </div>
        )}
      </div>

      {dismissible && onDismiss && (
        <button
          type="button"
          className={`
            flex-shrink-0 ml-2 p-1 rounded-md transition-colors duration-200
            ${variant === 'solid' 
              ? 'text-white hover:bg-error-700 focus:bg-error-700' 
              : 'text-error-400 hover:text-error-600 hover:bg-error-100 focus:bg-error-100'
            }
            focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2
          `.trim()}
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
};

// Inline error message for forms
export const InlineError = ({
  message,
  className = '',
  ...props
}) => {
  if (!message) return null;

  return (
    <motion.div
      className={`flex items-center mt-1 text-sm text-error-600 ${className}`}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
      <span>{message}</span>
    </motion.div>
  );
};

// Banner error message
export const ErrorBanner = ({
  message,
  onRetry,
  onDismiss,
  className = '',
  ...props
}) => {
  return (
    <motion.div
      className={`
        bg-error-600 text-white px-4 py-3 shadow-lg
        ${className}
      `.trim()}
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
      role="alert"
      {...props}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p className="font-medium">{message}</p>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {onRetry && (
            <button
              type="button"
              className="text-white hover:text-error-100 underline text-sm font-medium transition-colors duration-200"
              onClick={onRetry}
            >
              Try Again
            </button>
          )}
          
          {onDismiss && (
            <button
              type="button"
              className="text-white hover:text-error-100 p-1 rounded transition-colors duration-200"
              onClick={onDismiss}
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ErrorMessage;