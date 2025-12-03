import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  onClick,
  padding = 'default',
  shadow = 'soft',
  hover = true,
  ...props
}) => {
  // Base card styles
  const baseStyles = 'bg-white rounded-lg border border-secondary-200 transition-all duration-200';

  // Padding styles
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    default: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  // Shadow styles
  const shadowStyles = {
    none: '',
    soft: 'shadow-soft',
    medium: 'shadow-medium',
    large: 'shadow-large'
  };

  // Interactive styles for clickable cards
  const interactiveStyles = onClick
    ? 'cursor-pointer hover:shadow-medium hover:border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
    : '';

  // Combine all styles
  const cardClasses = `${baseStyles} ${paddingStyles[padding]} ${shadowStyles[shadow]} ${interactiveStyles} ${className}`;

  // Handle click
  const handleClick = (e) => {
    onClick?.(e);
  };

  // Handle keyboard interaction for accessibility
  const handleKeyDown = (e) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e);
    }
  };

  const CardComponent = onClick ? motion.div : 'div';
  const motionProps = onClick && hover ? {
    whileHover: { 
      scale: 1.02,
      y: -2
    },
    whileTap: { 
      scale: 0.98 
    },
    transition: { 
      duration: 0.2,
      ease: 'easeInOut'
    }
  } : {};

  return (
    <CardComponent
      className={cardClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      {...(onClick ? motionProps : {})}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

export default Card;