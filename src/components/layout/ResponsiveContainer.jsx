import React from 'react';
import { motion } from 'framer-motion';

/**
 * Responsive container component that adapts layout based on screen size
 * - Mobile (320-767px): Single column, touch-friendly controls
 * - Tablet (768-1023px): Two column where appropriate
 * - Desktop (1024px+): Multi-column with sidebar
 */
const ResponsiveContainer = ({ 
  children, 
  className = '',
  variant = 'default',
  ...props 
}) => {
  // Base container styles with mobile-first approach
  const baseStyles = 'w-full mx-auto px-4 sm:px-6 lg:px-8';
  
  // Variant-specific styles
  const variantStyles = {
    default: 'max-w-7xl',
    narrow: 'max-w-4xl',
    wide: 'max-w-full',
    form: 'max-w-2xl',
  };

  const containerClasses = `${baseStyles} ${variantStyles[variant]} ${className}`;

  return (
    <motion.div
      className={containerClasses}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Responsive grid component with predefined breakpoints
 */
export const ResponsiveGrid = ({ 
  children, 
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className = '',
  ...props 
}) => {
  // Gap sizes
  const gapSizes = {
    sm: 'gap-2 md:gap-3 lg:gap-4',
    md: 'gap-4 md:gap-6',
    lg: 'gap-6 md:gap-8 lg:gap-10',
  };

  // Build responsive grid classes
  const gridClasses = [
    'grid',
    `grid-cols-${columns.mobile}`,
    `md:grid-cols-${columns.tablet}`,
    `lg:grid-cols-${columns.desktop}`,
    gapSizes[gap],
    className
  ].join(' ');

  return (
    <div className={gridClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Responsive flex layout component
 */
export const ResponsiveFlex = ({ 
  children, 
  direction = 'column',
  align = 'stretch',
  justify = 'start',
  gap = 'md',
  className = '',
  ...props 
}) => {
  // Direction classes
  const directionClasses = {
    column: 'flex flex-col',
    row: 'flex flex-col md:flex-row',
    'row-reverse': 'flex flex-col-reverse md:flex-row-reverse',
  };

  // Alignment classes
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  // Justify classes
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

  // Gap classes
  const gapClasses = {
    sm: 'gap-2 md:gap-3',
    md: 'gap-4 md:gap-6',
    lg: 'gap-6 md:gap-8',
  };

  const flexClasses = [
    directionClasses[direction],
    alignClasses[align],
    justifyClasses[justify],
    gapClasses[gap],
    className
  ].join(' ');

  return (
    <div className={flexClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Responsive section component with proper spacing
 */
export const ResponsiveSection = ({ 
  children, 
  spacing = 'md',
  className = '',
  ...props 
}) => {
  // Spacing classes
  const spacingClasses = {
    sm: 'py-4 md:py-6',
    md: 'py-6 md:py-8 lg:py-12',
    lg: 'py-8 md:py-12 lg:py-16',
  };

  const sectionClasses = `${spacingClasses[spacing]} ${className}`;

  return (
    <section className={sectionClasses} {...props}>
      <ResponsiveContainer>
        {children}
      </ResponsiveContainer>
    </section>
  );
};

/**
 * Touch-friendly button wrapper for mobile
 */
export const TouchTarget = ({ 
  children, 
  className = '',
  ...props 
}) => {
  const touchClasses = `min-h-[44px] min-w-[44px] flex items-center justify-center ${className}`;
  
  return (
    <div className={touchClasses} {...props}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;