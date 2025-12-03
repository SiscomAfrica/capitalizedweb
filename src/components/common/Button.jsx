import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  children,
  className = '',
  type = 'button',
  ...props
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant styles
  const variantStyles = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-500 shadow-sm hover:shadow-md',
    secondary: 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200 active:bg-secondary-300 focus:ring-secondary-500 border border-secondary-300 hover:border-secondary-400',
    danger: 'bg-error-600 text-white hover:bg-error-700 active:bg-error-800 focus:ring-error-500 shadow-sm hover:shadow-md'
  };

  // Size styles - ensuring touch-friendly minimum sizes (44x44px)
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm min-h-[44px]', // Increased to meet touch target requirements
    md: 'px-4 py-2.5 text-base min-h-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[48px]'
  };

  // Combine all styles
  const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  // Handle click
  const handleClick = (e) => {
    if (loading || disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <motion.button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      transition={{ duration: 0.15 }}
      {...props}
    >
      {loading && (
        <Loader2 
          className={`animate-spin mr-2 ${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`}
        />
      )}
      {children}
    </motion.button>
  );
};

export default Button;