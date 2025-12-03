import React from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

// Skeleton loader for text content
export const TextSkeleton = ({ 
  lines = 3, 
  className = '',
  animate = true 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <motion.div
          key={index}
          className={`h-4 bg-gray-200 rounded ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
          animate={animate ? {
            opacity: [0.5, 1, 0.5],
          } : {}}
          transition={animate ? {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          } : {}}
        />
      ))}
    </div>
  );
};

// Skeleton loader for cards
export const CardSkeleton = ({ 
  className = '',
  animate = true 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <motion.div
        className="h-6 bg-gray-200 rounded w-3/4 mb-4"
        animate={animate ? {
          opacity: [0.5, 1, 0.5],
        } : {}}
        transition={animate ? {
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        } : {}}
      />
      <TextSkeleton lines={3} animate={animate} />
      <motion.div
        className="h-10 bg-gray-200 rounded w-1/3 mt-4"
        animate={animate ? {
          opacity: [0.5, 1, 0.5],
        } : {}}
        transition={animate ? {
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.2,
        } : {}}
      />
    </div>
  );
};

// Skeleton loader for tables
export const TableSkeleton = ({ 
  rows = 5, 
  columns = 4, 
  className = '',
  animate = true 
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <motion.div
              key={colIndex}
              className="h-4 bg-gray-200 rounded flex-1"
              animate={animate ? {
                opacity: [0.5, 1, 0.5],
              } : {}}
              transition={animate ? {
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: (rowIndex + colIndex) * 0.1,
              } : {}}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// Progress bar for file uploads or long operations
export const ProgressBar = ({
  progress = 0,
  className = '',
  showPercentage = true,
  color = 'primary',
  size = 'md'
}) => {
  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const colorStyles = {
    primary: 'bg-primary-600',
    success: 'bg-success-600',
    warning: 'bg-warning-600',
    error: 'bg-error-600'
  };

  return (
    <div className={className}>
      <div className={`w-full bg-gray-200 rounded-full ${sizeStyles[size]}`}>
        <motion.div
          className={`${sizeStyles[size]} ${colorStyles[color]} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
      {showPercentage && (
        <div className="text-sm text-gray-600 mt-1 text-center">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
};

// Full page loading overlay
export const PageLoader = ({
  message = 'Loading...',
  className = ''
}) => {
  return (
    <motion.div
      className={`fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <motion.p
          className="mt-4 text-gray-600 font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>
      </div>
    </motion.div>
  );
};

// Inline loading state for buttons and small components
export const InlineLoader = ({
  size = 'sm',
  message = '',
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <LoadingSpinner size={size} />
      {message && (
        <span className="text-sm text-gray-600">{message}</span>
      )}
    </div>
  );
};

// Loading state for lists
export const ListLoader = ({
  items = 5,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow">
          <motion.div
            className="w-12 h-12 bg-gray-200 rounded-full"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.1,
            }}
          />
          <div className="flex-1">
            <motion.div
              className="h-4 bg-gray-200 rounded w-1/2 mb-2"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.1,
              }}
            />
            <motion.div
              className="h-3 bg-gray-200 rounded w-3/4"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.1 + 0.2,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// Loading state for forms
export const FormLoader = ({
  fields = 4,
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index}>
          <motion.div
            className="h-4 bg-gray-200 rounded w-1/4 mb-2"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.1,
            }}
          />
          <motion.div
            className="h-10 bg-gray-200 rounded w-full"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.1 + 0.1,
            }}
          />
        </div>
      ))}
    </div>
  );
};

// Loading overlay for specific sections
export const SectionLoader = ({
  children,
  loading,
  message = 'Loading...',
  className = ''
}) => {
  if (!loading) {
    return children;
  }

  return (
    <div className={`relative ${className}`}>
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-2 text-gray-600 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default {
  TextSkeleton,
  CardSkeleton,
  TableSkeleton,
  ProgressBar,
  PageLoader,
  InlineLoader,
  ListLoader,
  FormLoader,
  SectionLoader,
};