import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

const Input = forwardRef(({
  type = 'text',
  value,
  onChange,
  label,
  error,
  placeholder,
  disabled = false,
  required = false,
  className = '',
  id,
  name,
  ...props
}, ref) => {
  // Generate unique ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  // Base input styles
  const baseInputStyles = 'block w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

  // Input state styles
  const inputStateStyles = error
    ? 'border-error-300 text-error-900 placeholder-error-400 focus:border-error-500 focus:ring-error-500 bg-error-50'
    : 'border-secondary-300 text-secondary-900 placeholder-secondary-400 focus:border-primary-500 focus:ring-primary-500 bg-white hover:border-secondary-400';

  // Input size styles - ensuring touch-friendly minimum height (44px)
  const inputSizeStyles = 'px-3 py-3 text-base min-h-[44px]';

  // Combine input styles
  const inputClasses = `${baseInputStyles} ${inputStateStyles} ${inputSizeStyles} ${className}`;

  // Label styles
  const labelStyles = `block text-sm font-medium mb-1 ${error ? 'text-error-700' : 'text-secondary-700'}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className={labelStyles}>
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <motion.input
          ref={ref}
          type={type}
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputClasses}
          initial={false}
          animate={{
            borderColor: error ? '#fca5a5' : undefined,
          }}
          transition={{ duration: 0.2 }}
          {...props}
        />
        
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-4 w-4 text-error-500" />
          </div>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          className="mt-1 text-sm text-error-600 flex items-center"
        >
          <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
          {error}
        </motion.div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;