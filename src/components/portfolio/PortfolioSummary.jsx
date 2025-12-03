import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import Card from '../common/Card';

const PortfolioSummary = ({ portfolio }) => {
  if (!portfolio) {
    return null;
  }

  const {
    totalInvested = 0,
    currentValue = 0,
    totalReturns = 0,
    roi = 0,
  } = portfolio;

  // Calculate if returns are positive or negative
  const isPositiveReturns = totalReturns >= 0;
  const isPositiveROI = roi >= 0;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (percentage) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  // Animation variants for the counters
  const counterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  // Animated counter component
  const AnimatedCounter = ({ value, formatter, delay = 0 }) => {
    return (
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay }}
        className="font-bold text-2xl"
      >
        {formatter(value)}
      </motion.span>
    );
  };

  const summaryCards = [
    {
      title: 'Total Invested',
      value: totalInvested,
      formatter: formatCurrency,
      icon: DollarSign,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-50',
      delay: 0,
    },
    {
      title: 'Current Value',
      value: currentValue,
      formatter: formatCurrency,
      icon: PieChart,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      delay: 0.1,
    },
    {
      title: 'Total Returns',
      value: totalReturns,
      formatter: formatCurrency,
      icon: isPositiveReturns ? TrendingUp : TrendingDown,
      color: isPositiveReturns ? 'text-success-600' : 'text-error-600',
      bgColor: isPositiveReturns ? 'bg-success-50' : 'bg-error-50',
      delay: 0.2,
    },
    {
      title: 'ROI',
      value: roi,
      formatter: formatPercentage,
      icon: isPositiveROI ? TrendingUp : TrendingDown,
      color: isPositiveROI ? 'text-success-600' : 'text-error-600',
      bgColor: isPositiveROI ? 'bg-success-50' : 'bg-error-50',
      delay: 0.3,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {summaryCards.map((card, index) => {
        const IconComponent = card.icon;
        
        return (
          <motion.div
            key={card.title}
            variants={counterVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: card.delay }}
          >
            <Card className="relative overflow-hidden">
              {/* Background decoration */}
              <div className={`absolute top-0 right-0 w-20 h-20 ${card.bgColor} rounded-full -mr-10 -mt-10 opacity-50`} />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-secondary-600">
                    {card.title}
                  </h3>
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <IconComponent className={`h-4 w-4 ${card.color}`} />
                  </div>
                </div>
                
                <div className={`${card.color}`}>
                  <AnimatedCounter
                    value={card.value}
                    formatter={card.formatter}
                    delay={card.delay}
                  />
                </div>
                
                {/* Additional context for returns */}
                {(card.title === 'Total Returns' || card.title === 'ROI') && (
                  <div className="mt-1">
                    <span className={`text-xs ${card.color} flex items-center`}>
                      <IconComponent className="h-3 w-3 mr-1" />
                      {card.title === 'Total Returns' ? 'vs invested' : 'return rate'}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default PortfolioSummary;