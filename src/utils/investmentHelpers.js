/**
 * Investment-related utility functions
 * Shared helpers for formatting and calculations
 */

import { DEFAULT_CURRENCY } from './constants';

/**
 * Get full image URL with proper prefix
 * @param {string} imagePath - Image path from API
 * @param {boolean} useDefault - Whether to return default image if path is empty
 * @returns {string} Full image URL
 */
export const getImageUrl = (imagePath, useDefault = false) => {
  // Return default image if no path provided and default is requested
  if (!imagePath && useDefault) {
    return 'https://siscom.africa/static/img/homepage/card9.webp';
  }
  
  if (!imagePath) return '';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Remove leading slash if present
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  // Construct full URL with static prefix
  return `https://siscom.africa/static/${cleanPath}`;
};

/**
 * Get product image URL with fallback to default
 * @param {string} imagePath - Image path from API
 * @returns {string} Full image URL with fallback
 */
export const getProductImageUrl = (imagePath) => {
  return getImageUrl(imagePath, true);
};

/**
 * Process gallery images object to add proper URL prefixes
 * @param {Object} galleryImages - Gallery images object from API
 * @returns {Object} Processed gallery images with full URLs
 */
export const processGalleryImages = (galleryImages) => {
  if (!galleryImages || typeof galleryImages !== 'object') return {};
  
  const processedImages = {};
  
  Object.entries(galleryImages).forEach(([key, imagePath]) => {
    processedImages[key] = getImageUrl(imagePath);
  });
  
  return processedImages;
};

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = DEFAULT_CURRENCY) => {
  if (!amount || isNaN(amount)) return `$0`;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format percentage
 * @param {number} rate - Rate to format (already as percentage)
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (rate, decimals = 1) => {
  if (!rate || isNaN(rate)) return '0%';
  return `${parseFloat(rate).toFixed(decimals)}%`;
};

/**
 * Format large numbers with K/M/B suffixes
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted number string
 */
export const formatLargeNumber = (num, decimals = 1) => {
  if (!num || isNaN(num)) return '0';
  
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(decimals)}B`;
  } else if (num >= 1000000) {
    return `${(num / 1000000).toFixed(decimals)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(decimals)}K`;
  }
  
  return Math.round(num).toString();
};

/**
 * Format compact currency for statistics
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted compact currency string
 */
export const formatCompactCurrency = (amount, currency = DEFAULT_CURRENCY) => {
  if (!amount || isNaN(amount)) return `$0`;
  
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(1)}B`;
  } else if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  
  return formatCurrency(amount, currency);
};

/**
 * Calculate funding progress percentage
 * @param {number} raised - Amount raised
 * @param {number} goal - Funding goal
 * @returns {number} Progress percentage (0-100)
 */
export const calculateFundingProgress = (raised, goal) => {
  if (!raised || !goal || isNaN(raised) || isNaN(goal) || goal === 0) return 0;
  return Math.min((raised / goal) * 100, 100);
};

/**
 * Calculate projected returns
 * @param {number} amount - Investment amount
 * @param {number} returnRate - Return rate (as percentage)
 * @returns {number} Projected return amount
 */
export const calculateProjectedReturns = (amount, returnRate) => {
  if (!amount || !returnRate || isNaN(amount) || isNaN(returnRate)) return 0;
  return (amount * returnRate) / 100;
};

/**
 * Calculate monthly returns
 * @param {number} amount - Investment amount
 * @param {number} monthlyRate - Monthly return rate (as percentage)
 * @returns {number} Monthly return amount
 */
export const calculateMonthlyReturns = (amount, monthlyRate) => {
  if (!amount || !monthlyRate || isNaN(amount) || isNaN(monthlyRate)) return 0;
  return (amount * monthlyRate) / 100;
};

/**
 * Parse and validate product data from API response
 * @param {Object} product - Raw product data from API
 * @returns {Object} Parsed and validated product data
 */
export const parseProductData = (product) => {
  if (!product) return {};
  
  return {
    id: product.id || '',
    slug: product.slug || '',
    name: product.name || 'Investment Product',
    subtitle: product.subtitle || '',
    description: product.description || product.short_description || '',
    shortDescription: product.short_description || '',
    minimumInvestment: parseFloat(product.minimum_investment) || 0,
    maximumInvestment: parseFloat(product.maximum_investment) || 0,
    expectedAnnualReturn: parseFloat(product.expected_annual_return) || 0,
    expectedMonthlyReturn: parseFloat(product.expected_monthly_return) || 0,
    monthlyPayout: parseFloat(product.monthly_payout) || 0,
    annualPayout: parseFloat(product.annual_payout) || 0,
    duration: parseInt(product.investment_duration_months) || 0,
    status: product.status || 'inactive',
    investmentType: product.investment_type || 'investment',
    featuredImage: getProductImageUrl(product.featured_image),
    galleryImages: processGalleryImages(product.gallery_images),
    useVariableRates: product.use_variable_rates || false,
    yearlyReturnRates: product.yearly_return_rates || [],
    totalUnitsAvailable: parseInt(product.total_units_available) || 0,
    unitsSold: parseInt(product.units_sold) || 0,
    totalRaised: parseFloat(product.total_raised) || 0,
    fundingGoal: parseFloat(product.funding_goal) || 0,
    totalInvestors: parseInt(product.total_investors) || 0,
    features: product.features || {},
    technicalSpecs: product.technical_specs || {},
    useCases: product.use_cases || {},
    riskFactors: product.risk_factors || {},
    capitalAllocation: product.capital_allocation || {},
    overviewContent: product.overview_content || '',
    howItWorks: product.how_it_works || '',
    fundingStartDate: product.funding_start_date || '',
    fundingEndDate: product.funding_end_date || '',
    createdAt: product.created_at || '',
    updatedAt: product.updated_at || ''
  };
};

/**
 * Determine risk level from risk factors
 * @param {Object} riskFactors - Risk factors object
 * @returns {Object} Risk level details
 */
export const getRiskLevelDetails = (riskFactors = {}) => {
  // Determine overall risk level from risk factors
  const risks = Object.values(riskFactors);
  const highRiskCount = risks.filter(risk => risk?.level === 'High').length;
  const mediumRiskCount = risks.filter(risk => risk?.level === 'Medium').length;
  
  let level = 'Low';
  if (highRiskCount > 0) {
    level = 'High';
  } else if (mediumRiskCount > 1) {
    level = 'Medium';
  }

  const riskLevels = {
    'Low': {
      level: 'Low',
      color: 'text-success-600',
      bgColor: 'bg-success-100',
      borderColor: 'border-success-200',
      description: 'Conservative investment with stable returns'
    },
    'Medium': {
      level: 'Medium',
      color: 'text-warning-600',
      bgColor: 'bg-warning-100',
      borderColor: 'border-warning-200',
      description: 'Balanced risk with moderate return potential'
    },
    'High': {
      level: 'High',
      color: 'text-error-600',
      bgColor: 'bg-error-100',
      borderColor: 'border-error-200',
      description: 'Higher risk with potential for greater returns'
    }
  };

  return riskLevels[level] || riskLevels['Medium'];
};

/**
 * Get status badge styling
 * @param {string} status - Product status
 * @returns {Object} Status styling details
 */
export const getStatusStyling = (status) => {
  const statusStyles = {
    'active': {
      color: 'text-success-700',
      bgColor: 'bg-success-100',
      borderColor: 'border-success-200',
      label: 'Available for Investment'
    },
    'inactive': {
      color: 'text-secondary-700',
      bgColor: 'bg-secondary-100',
      borderColor: 'border-secondary-200',
      label: 'Currently Unavailable'
    },
    'coming_soon': {
      color: 'text-info-700',
      bgColor: 'bg-info-100',
      borderColor: 'border-info-200',
      label: 'Coming Soon'
    },
    'sold_out': {
      color: 'text-warning-700',
      bgColor: 'bg-warning-100',
      borderColor: 'border-warning-200',
      label: 'Sold Out'
    }
  };

  return statusStyles[status] || statusStyles['inactive'];
};

/**
 * Format duration with years and months
 * @param {number} months - Duration in months
 * @returns {string} Formatted duration string
 */
export const formatDuration = (months) => {
  if (!months || isNaN(months)) return '0 months';
  
  if (months >= 12) {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    let result = `${years} ${years === 1 ? 'year' : 'years'}`;
    if (remainingMonths > 0) {
      result += ` ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
    }
    return result;
  }
  
  return `${months} ${months === 1 ? 'month' : 'months'}`;
};

/**
 * Validate investment amount
 * @param {number} amount - Investment amount
 * @param {number} minInvestment - Minimum investment
 * @param {number} maxInvestment - Maximum investment
 * @returns {Object} Validation result
 */
export const validateInvestmentAmount = (amount, minInvestment, maxInvestment) => {
  const numAmount = parseFloat(amount);
  
  if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
    return {
      isValid: false,
      error: 'Please enter a valid investment amount'
    };
  }
  
  if (minInvestment && numAmount < minInvestment) {
    return {
      isValid: false,
      error: `Minimum investment is ${formatCurrency(minInvestment)}`
    };
  }
  
  if (maxInvestment && numAmount > maxInvestment) {
    return {
      isValid: false,
      error: `Maximum investment is ${formatCurrency(maxInvestment)}`
    };
  }
  
  return {
    isValid: true,
    error: null
  };
};