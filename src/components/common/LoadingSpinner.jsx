import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  className = '',
  label = 'Loading...',
  showLabel = false,
  ...props
}) => {
  // Size styles
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  // Color styles
  const colorStyles = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    white: 'text-white',
    success: 'text-success-600',
    warning: 'text-warning-600',
    error: 'text-error-600'
  };

  // Label size styles
  const labelSizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const spinnerClasses = `${sizeStyles[size]} ${colorStyles[color]} ${className}`;

  return (
    <div 
      className="flex flex-col items-center justify-center"
      role="status"
      aria-label={label}
      {...props}
    >
      <motion.div
        className={spinnerClasses}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </motion.div>
      
      {showLabel && (
        <motion.span
          className={`mt-2 ${labelSizeStyles[size]} ${colorStyles[color]} font-medium`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {label}
        </motion.span>
      )}
      
      {/* Screen reader only text */}
      <span className="sr-only">{label}</span>
    </div>
  );
};

// Alternative dot-based spinner
export const DotSpinner = ({
  size = 'md',
  color = 'primary',
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2',
    xl: 'w-3 h-3'
  };

  const colorStyles = {
    primary: 'bg-primary-600',
    secondary: 'bg-secondary-600',
    white: 'bg-white',
    success: 'bg-success-600',
    warning: 'bg-warning-600',
    error: 'bg-error-600'
  };

  const dotClasses = `${sizeStyles[size]} ${colorStyles[color]} rounded-full`;

  return (
    <div className={`flex space-x-1 ${className}`} {...props}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={dotClasses}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.2,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
};

// Pulse spinner
export const PulseSpinner = ({
  size = 'md',
  color = 'primary',
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorStyles = {
    primary: 'bg-primary-600',
    secondary: 'bg-secondary-600',
    white: 'bg-white',
    success: 'bg-success-600',
    warning: 'bg-warning-600',
    error: 'bg-error-600'
  };

  const pulseClasses = `${sizeStyles[size]} ${colorStyles[color]} rounded-full ${className}`;

  return (
    <motion.div
      className={pulseClasses}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7]
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      {...props}
    />
  );
};

export default LoadingSpinner;